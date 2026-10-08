package service

import (
	"encoding/json"
	"errors"
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model"
	req "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model/request"
	"gorm.io/gorm"
	"time"
)

func mustJSON(v any) string { b, _ := json.Marshal(v); return string(b) }
func policyAt(db *gorm.DB, drama uint, at time.Time) model.Policies {
	p := model.Policies{FreeEpisodes: 0}
	q := db.Where("status = 'active' AND effective_at <= ? AND (expires_at IS NULL OR expires_at > ?)", at, at)
	if q.Session(&gorm.Session{}).Where("drama_id = ?", drama).Order("effective_at DESC,id DESC").First(&p).Error != nil {
		q.Where("drama_id = 0").Order("effective_at DESC,id DESC").First(&p)
	}
	return p
}
func (s PlatformService) Preview(a Actor, drama uint, at time.Time) (any, error) {
	if a.Role != 888 {
		return nil, errors.New("仅管理员可预览策略影响")
	}
	p := policyAt(global.GVA_DB, drama, at)
	var total, free int64
	q := global.GVA_DB.Model(&model.Episodes{}).Where("drama_id = ?", drama)
	q.Count(&total)
	if p.FreeEpisodes == -1 {
		free = total
	} else {
		q.Where("number <= ?", p.FreeEpisodes).Count(&free)
	}
	return map[string]any{"policy": p, "totalEpisodes": total, "freeEpisodes": free, "paidEpisodes": total - free, "at": at}, nil
}
func (s PlatformService) Playback(a Actor, episode uint) (any, error) {
	ep := model.Episodes{}
	if e := global.GVA_DB.First(&ep, episode).Error; e != nil {
		return nil, e
	}
	d := model.Dramas{}
	if e := global.GVA_DB.First(&d, ep.DramaId).Error; e != nil {
		return nil, e
	}
	if a.Role == 888 || a.Role == 300 && d.OwnerID == a.ID {
		return map[string]any{"episode": ep, "allowed": true, "reason": "管理预览"}, nil
	}
	now := time.Now()
	if d.Status != "published" || d.LicenseStart == nil || d.LicenseEnd == nil || now.Before(*d.LicenseStart) || !d.LicenseEnd.After(now) {
		return nil, errors.New("剧集未发布或授权已到期")
	}
	p := policyAt(global.GVA_DB, d.ID, now)
	allowed := p.FreeEpisodes == -1 || ep.Number <= p.FreeEpisodes
	reason := "需要单集权益或会员"
	if allowed {
		reason = "免费单集"
	}
	var n int64
	if !allowed {
		global.GVA_DB.Model(&model.Entitlements{}).Where("user_id = ? AND episode_id = ? AND status = 'active' AND (expires_at IS NULL OR expires_at > ?)", a.ID, ep.ID, now).Count(&n)
		allowed = n > 0
		if allowed {
			reason = "单集权益"
		}
	}
	if !allowed && p.MemberFree {
		global.GVA_DB.Model(&model.Subscriptions{}).Where("user_id = ? AND status = 'active' AND starts_at <= ? AND expires_at > ?", a.ID, now, now).Count(&n)
		allowed = n > 0
		if allowed {
			reason = "会员权益"
		}
	}
	if !allowed {
		ep.VideoUrl = ""
	}
	return map[string]any{"episode": ep, "allowed": allowed, "reason": reason, "adsEnabled": p.AdsEnabled}, nil
}
func (s PlatformService) Event(a Actor, in req.PlaybackEvent) error {
	if a.Role != 200 {
		return errors.New("仅观众账号可记录观看事件")
	}
	if in.Event != "play" && in.Event != "complete" && in.Event != "buffer" && in.Event != "error" && in.Event != "progress" {
		return errors.New("事件类型无效")
	}
	if in.StartupMs < 0 || in.BufferMs < 0 || in.WatchedSeconds < 0 || in.WatchedSeconds > 120 || in.PositionSeconds < 0 {
		return errors.New("播放指标超出范围")
	}
	v, e := s.Playback(a, in.EpisodeID)
	if e != nil {
		return e
	}
	m := v.(map[string]any)
	if !m["allowed"].(bool) {
		return errors.New("缺少观看权益")
	}
	ep := m["episode"].(model.Episodes)
	return global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		event := model.Events{Base: model.Base{OwnerID: ep.OwnerID, UserID: a.ID, Status: "recorded"}, DramaId: ep.DramaId, EpisodeId: int64(ep.ID), Event: in.Event, Source: in.Source, SessionId: in.SessionID, StartupMs: in.StartupMs, BufferMs: in.BufferMs, ErrorCode: in.ErrorCode}
		if e := tx.Create(&event).Error; e != nil {
			return e
		}
		h := model.History{Base: model.Base{OwnerID: ep.OwnerID, UserID: a.ID, Status: "recorded"}, EpisodeId: int64(ep.ID), Source: in.Source}
		if e := tx.Where("user_id = ? AND episode_id = ?", a.ID, ep.ID).FirstOrCreate(&h).Error; e != nil {
			return e
		}
		return tx.Model(&h).Updates(map[string]any{"position_seconds": in.PositionSeconds, "watched_seconds": gorm.Expr("watched_seconds + ?", in.WatchedSeconds), "updated_at": time.Now()}).Error
	})
}
func (s PlatformService) Overview(a Actor) (any, error) {
	counts := map[string]int64{}
	for _, key := range []string{"dramas", "episodes", "orders", "subscriptions", "feedback", "approvals", "alerts", "favorites", "ads", "bills", "settlements"} {
		r := model.Resources[key]
		if has(r.Read, a.Role) {
			var n int64
			if e := scoped(global.GVA_DB, r, a).Count(&n).Error; e != nil {
				return nil, e
			}
			counts[key] = n
		}
	}
	type Metric struct {
		Key   string `json:"key"`
		Count int64  `json:"count"`
	}
	type Revenue struct {
		Currency string `json:"currency"`
		NetMinor int64  `json:"netMinor,string"`
	}
	sources := []Metric{}
	funnel := []Metric{}
	quality := struct {
		StartupMs float64 `json:"startup_ms"`
		BufferMs  int64   `json:"buffer_ms"`
		Viewers   int64   `json:"viewers"`
	}{}
	revenue := []Revenue{}
	retention := []map[string]any{}
	dramaStats := []map[string]any{}
	if a.Role == 888 || a.Role == 300 {
		if a.Role == 300 {
			var n int64
			if err := global.GVA_DB.Model(&model.Ads{}).Where("owner_id=?", a.ID).Count(&n).Error; err != nil {
				return nil, err
			}
			counts["ads"] = n
		}
		queryByDrama := global.GVA_DB.Table("gd_events e").Joins("JOIN gd_dramas d ON d.id=e.drama_id")
		if a.Role == 300 {
			queryByDrama = queryByDrama.Where("e.owner_id=?", a.ID)
		}
		if err := queryByDrama.Select("d.id AS drama_id,d.title,COUNT(*) FILTER (WHERE e.event='play') AS plays,COUNT(*) FILTER (WHERE e.event='complete') AS completions,COUNT(DISTINCT e.user_id) AS viewers").Group("d.id,d.title").Order("plays DESC").Limit(100).Find(&dramaStats).Error; err != nil {
			return nil, err
		}
		db := scoped(global.GVA_DB, model.Resources["events"], a)
		if err := db.Session(&gorm.Session{}).Select("source AS key,COUNT(*) AS count").Group("source").Scan(&sources).Error; err != nil {
			return nil, err
		}
		if err := db.Session(&gorm.Session{}).Select("event AS key,COUNT(*) AS count").Group("event").Scan(&funnel).Error; err != nil {
			return nil, err
		}
		if err := db.Session(&gorm.Session{}).Select("COALESCE(AVG(startup_ms) FILTER (WHERE event = 'play'),0) AS startup_ms, COALESCE(SUM(buffer_ms),0) AS buffer_ms, COUNT(DISTINCT user_id) AS viewers").Scan(&quality).Error; err != nil {
			return nil, err
		}
		if err := scoped(global.GVA_DB, model.Resources["bills"], a).Select("currency,SUM(net_minor) AS net_minor").Group("currency").Scan(&revenue).Error; err != nil {
			return nil, err
		}
		query := `WITH first_play AS (SELECT user_id,MIN(created_at)::date cohort FROM gd_events WHERE event='play'`
		args := []any{}
		if a.Role == 300 {
			query += ` AND owner_id = ?`
			args = append(args, a.ID)
		}
		query += ` GROUP BY user_id), activity AS (SELECT DISTINCT user_id,created_at::date AS activity_date FROM gd_events WHERE event='play'`
		if a.Role == 300 {
			query += ` AND owner_id = ?`
			args = append(args, a.ID)
		}
		query += `) SELECT f.cohort,COUNT(DISTINCT f.user_id) AS users,CASE WHEN CURRENT_DATE>=f.cohort+1 THEN COUNT(DISTINCT CASE WHEN a.activity_date=f.cohort+1 THEN f.user_id END) ELSE NULL END AS day1,CASE WHEN CURRENT_DATE>=f.cohort+7 THEN COUNT(DISTINCT CASE WHEN a.activity_date=f.cohort+7 THEN f.user_id END) ELSE NULL END AS day7 FROM first_play f LEFT JOIN activity a ON a.user_id=f.user_id GROUP BY f.cohort ORDER BY f.cohort DESC LIMIT 30`
		if err := global.GVA_DB.Raw(query, args...).Scan(&retention).Error; err != nil {
			return nil, err
		}
	}
	var expiring []model.Dramas
	if a.Role != 200 {
		q := scoped(global.GVA_DB, model.Resources["dramas"], a)
		if err := q.Where("license_end BETWEEN ? AND ?", time.Now(), time.Now().AddDate(0, 0, 30)).Order("license_end").Limit(20).Find(&expiring).Error; err != nil {
			return nil, err
		}
	}
	return map[string]any{"counts": counts, "sources": sources, "funnel": funnel, "quality": quality, "revenue": revenue, "retention": retention, "dramaStats": dramaStats, "expiring": expiring}, nil
}

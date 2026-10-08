package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model"
	req "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model/request"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
)

type PlatformService struct{}
type Actor struct {
	ID   uint
	Role uint
}

func has(roles []uint, role uint) bool {
	for _, r := range roles {
		if r == role {
			return true
		}
	}
	return false
}
func resource(key string, a Actor, write bool) (model.Resource, error) {
	r, ok := model.Resources[key]
	if !ok {
		return r, errors.New("资源不存在")
	}
	roles := r.Read
	if write {
		roles = r.Write
	}
	if !has(roles, a.Role) {
		return r, errors.New("当前角色无操作权限")
	}
	return r, nil
}
func scoped(db *gorm.DB, r model.Resource, a Actor) *gorm.DB {
	db = db.Model(r.New())
	if a.Role == 888 {
		return db
	}
	if a.Role == 300 {
		return db.Where("owner_id = ?", a.ID)
	}
	if r.Key == "dramas" {
		return db.Where("status = 'published' AND license_start <= ? AND license_end > ?", time.Now(), time.Now())
	}
	if r.Key == "episodes" {
		return db.Where("drama_id IN (?)", global.GVA_DB.Model(&model.Dramas{}).Select("id").Where("status = 'published' AND license_start <= ? AND license_end > ?", time.Now(), time.Now()))
	}
	if r.Key == "plans" {
		return db.Where("status = 'active'")
	}
	if r.Scope == "user" {
		return db.Where("user_id = ?", a.ID)
	}
	return db.Where("owner_id = ?", a.ID)
}
func audit(tx *gorm.DB, a Actor, key string, id uint, action string, detail any) error {
	b, _ := json.Marshal(detail)
	return tx.Create(&model.Audits{Base: model.Base{OwnerID: a.ID, UserID: a.ID, Status: "recorded"}, Resource: key, TargetId: int64(id), Action: action, Detail: string(b)}).Error
}
func (s PlatformService) Schema(a Actor) []map[string]any {
	keys := make([]string, 0)
	for k := range model.Resources {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	out := []map[string]any{}
	for _, k := range keys {
		r := model.Resources[k]
		if has(r.Read, a.Role) {
			out = append(out, map[string]any{"key": k, "title": r.Title, "fields": r.Fields, "canWrite": has(r.Write, a.Role), "role": a.Role})
		}
	}
	return out
}
func (s PlatformService) List(a Actor, key string, p req.Page) (map[string]any, error) {
	r, e := resource(key, a, false)
	if e != nil {
		return nil, e
	}
	if p.Page < 1 {
		p.Page = 1
	}
	if p.PageSize < 1 {
		p.PageSize = 20
	}
	if p.PageSize > 100 {
		p.PageSize = 100
	}
	db := scoped(global.GVA_DB, r, a)
	if p.ID > 0 {
		db = db.Where("id = ?", p.ID)
	}
	if p.Status != "" {
		db = db.Where("status = ?", p.Status)
	}
	if p.DramaID > 0 {
		for _, f := range r.Fields {
			if f.Key == "dramaId" {
				db = db.Where("drama_id = ?", p.DramaID)
			}
		}
	}
	if p.Search != "" {
		columns := []string{}
		args := []any{}
		for _, f := range r.Fields {
			if f.Type == "text" || f.Type == "textarea" {
				columns = append(columns, f.Column+" ILIKE ?")
				args = append(args, "%"+p.Search+"%")
			}
		}
		if len(columns) > 0 {
			db = db.Where("("+strings.Join(columns, " OR ")+")", args...)
		}
	}
	var total int64
	if e = db.Count(&total).Error; e != nil {
		return nil, e
	}
	list := r.List()
	if e = db.Order("id DESC").Offset((p.Page - 1) * p.PageSize).Limit(p.PageSize).Find(list).Error; e != nil {
		return nil, e
	}
	// Public episode metadata never exposes paid playback URLs.
	if a.Role == 200 && key == "episodes" {
		for i := range *list.(*[]model.Episodes) {
			(*list.(*[]model.Episodes))[i].VideoUrl = ""
		}
	}
	return map[string]any{"list": list, "total": total, "page": p.Page, "pageSize": p.PageSize}, nil
}
func values(r model.Resource, input map[string]json.RawMessage, creating bool) (map[string]any, error) {
	out := map[string]any{}
	known := map[string]bool{}
	for _, f := range r.Fields {
		known[f.Key] = true
		raw, ok := input[f.Key]
		if f.Type == "readonly" {
			if ok {
				return nil, fmt.Errorf("%s为系统计算字段", f.Label)
			}
			continue
		}
		if !ok {
			if creating && f.Required {
				return nil, fmt.Errorf("请填写%s", f.Label)
			}
			continue
		}
		var v any
		switch f.Type {
		case "number", "integer":
			var n int64
			if json.Unmarshal(raw, &n) != nil {
				return nil, fmt.Errorf("%s必须为整数", f.Label)
			}
			if n > 9007199254740991 || n < -9007199254740991 {
				return nil, fmt.Errorf("%s超过允许整数范围", f.Label)
			}
			if f.Type == "number" && n < 0 {
				return nil, fmt.Errorf("%s不能为负数", f.Label)
			}
			if f.Ref != "" && f.Required && n <= 0 {
				return nil, fmt.Errorf("请选择%s", f.Label)
			}
			v = n
		case "boolean":
			var b bool
			if json.Unmarshal(raw, &b) != nil {
				return nil, errors.New("开关值必须为布尔值")
			}
			v = b
		case "datetime":
			if string(raw) == "null" || string(raw) == `""` {
				if f.Required {
					return nil, fmt.Errorf("请填写%s", f.Label)
				}
				v = nil
			} else {
				var str string
				if json.Unmarshal(raw, &str) != nil {
					return nil, errors.New("时间格式无效")
				}
				t, e := time.Parse(time.RFC3339, str)
				if e != nil {
					return nil, errors.New("时间请使用RFC3339格式")
				}
				v = &t
			}
		default:
			var str string
			if json.Unmarshal(raw, &str) != nil {
				return nil, fmt.Errorf("%s格式无效", f.Label)
			}
			str = strings.TrimSpace(str)
			if f.Required && str == "" {
				return nil, fmt.Errorf("请填写%s", f.Label)
			}
			if len(str) > 20000 {
				return nil, errors.New("文本过长")
			}
			if f.Type == "url" && str != "" {
				u, e := url.Parse(str)
				if e != nil || u.Host == "" || (u.Scheme != "https" && u.Scheme != "http") {
					return nil, errors.New("地址必须为http或https")
				}
			}
			if len(f.Options) > 0 && str != "" {
				match := false
				for _, o := range f.Options {
					if o == str {
						match = true
					}
				}
				if !match {
					return nil, fmt.Errorf("%s选项无效", f.Label)
				}
			}
			v = str
		}
		out[f.Column] = v
	}
	for k := range input {
		if !known[k] {
			return nil, fmt.Errorf("不允许修改字段 %s", k)
		}
	}
	return out, nil
}
func asMap(v any) map[string]any {
	b, _ := json.Marshal(v)
	m := map[string]any{}
	_ = json.Unmarshal(b, &m)
	return m
}
func (s PlatformService) Save(a Actor, key string, id uint, input map[string]json.RawMessage) (any, error) {
	r, e := resource(key, a, true)
	if e != nil {
		return nil, e
	}
	v, e := values(r, input, id == 0)
	if e != nil {
		return nil, e
	}
	var result any
	e = global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		existing := r.New()
		if id > 0 {
			if e := scoped(tx, r, a).Clauses(clause.Locking{Strength: "UPDATE"}).First(existing, id).Error; e != nil {
				return errors.New("记录不存在或无权修改")
			}
			m := asMap(existing)
			st, _ := m["status"].(string)
			if key == "dramas" && st != "draft" && st != "rejected" && st != "offline" {
				return errors.New("已提交或发布的内容须下架后编辑")
			}
			if key == "orders" || key == "refunds" || key == "ads" {
				return errors.New("业务记录请使用对应操作，不能直接编辑")
			}
			if (key == "bills" || key == "settlements" || key == "compensations") && st != "draft" {
				return errors.New("已进入审批的记录不可修改")
			}
		}
		owner := a.ID
		if id > 0 {
			owner = uint(asMap(existing)["ownerId"].(float64))
		}
		if key == "history" && a.Role == 200 {
			epID, ok := v["episode_id"].(int64)
			if !ok && id > 0 {
				epID = existing.(*model.History).EpisodeId
			}
			play, err := s.Playback(a, uint(epID))
			if err != nil {
				return err
			}
			if !play.(map[string]any)["allowed"].(bool) {
				return errors.New("缺少观看权益")
			}
		}
		for _, f := range r.Fields {
			n, ok := v[f.Column].(int64)
			if f.Ref == "" || !ok || n == 0 {
				continue
			}
			rr := model.Resources[f.Ref]
			ref := rr.New()
			q := scoped(tx, rr, a)
			if a.Role == 200 && f.Ref == "episodes" {
				q = scoped(tx, rr, a)
			}
			if e := q.First(ref, n).Error; e != nil {
				return fmt.Errorf("%s不存在或无权限", f.Label)
			}
			rm := asMap(ref)
			if f.Ref == "dramas" || f.Ref == "episodes" || f.Ref == "orders" || f.Ref == "organizations" {
				owner = uint(rm["ownerId"].(float64))
			}
		}
		if a.Role != 888 && key == "feedback" {
			delete(v, "reply")
		}
		if key == "versions" {
			var snap any
			if json.Unmarshal([]byte(v["snapshot"].(string)), &snap) != nil {
				return errors.New("内容快照必须为合法JSON")
			}
		}
		if key == "dramas" {
			old := existing.(*model.Dramas)
			start, end := old.LicenseStart, old.LicenseEnd
			if value, ok := v["license_start"]; ok {
				start, _ = value.(*time.Time)
			}
			if value, ok := v["license_end"]; ok {
				end, _ = value.(*time.Time)
			}
			if start != nil && end != nil && !end.After(*start) {
				return errors.New("授权截止必须晚于开始")
			}
			if n, ok := v["total_episodes"].(int64); ok && (n < 1 || n > 1000) {
				return errors.New("计划集数须在1到1000之间")
			}
		}
		if key == "episodes" {
			if n, ok := v["number"].(int64); ok && n < 1 {
				return errors.New("集数须大于0")
			}
			if n, ok := v["processing_progress"].(int64); ok && n > 100 {
				return errors.New("处理进度不能超过100")
			}
		}
		if key == "licenses" {
			old := existing.(*model.Licenses)
			start, end := old.StartsAt, old.ExpiresAt
			if value, ok := v["starts_at"]; ok {
				start, _ = value.(*time.Time)
			}
			if value, ok := v["expires_at"]; ok {
				end, _ = value.(*time.Time)
			}
			if start != nil && end != nil && !end.After(*start) {
				return errors.New("授权结束必须晚于开始")
			}
		}
		if key == "policies" {
			old := existing.(*model.Policies)
			start, end := old.EffectiveAt, old.ExpiresAt
			if value, ok := v["effective_at"]; ok {
				start, _ = value.(*time.Time)
			}
			if value, ok := v["expires_at"]; ok {
				end, _ = value.(*time.Time)
			}
			if start != nil && end != nil && !end.After(*start) {
				return errors.New("策略失效时间须晚于生效时间")
			}
			if n, ok := v["free_episodes"].(int64); ok && n < -1 {
				return errors.New("免费集数最低为-1")
			}
		}
		if key == "plans" {
			if n, ok := v["duration_days"].(int64); ok && (n < 1 || n > 3660) {
				return errors.New("套餐有效天数须为1到3660")
			}
		}
		if key == "orders" {
			if id > 0 {
				return errors.New("订单不能编辑")
			}
			kind := v["kind"].(string)
			if kind == "episode" {
				n, ok := v["episode_id"].(int64)
				if !ok || n <= 0 {
					return errors.New("请选择单集")
				}
			} else {
				n, ok := v["plan_id"].(int64)
				if !ok || n <= 0 {
					return errors.New("请选择会员套餐")
				}
			}
			if kind == "episode" {
				ep := model.Episodes{}
				if e := scoped(tx, model.Resources["episodes"], a).First(&ep, v["episode_id"]).Error; e != nil {
					return errors.New("请选择已发布的单集")
				}
				v["amount_minor"] = ep.PriceMinor
				v["currency"] = ep.Currency
				owner = ep.OwnerID
			} else {
				plan := model.Plans{}
				if e := tx.Where("status = 'active'").First(&plan, v["plan_id"]).Error; e != nil {
					return errors.New("请选择在售会员套餐")
				}
				v["amount_minor"] = plan.PriceMinor
				v["currency"] = plan.Currency
			}
			v["fulfillment"] = "pending"
		}
		if key == "refunds" {
			order := model.Orders{}
			if e := scoped(tx, model.Resources["orders"], a).Clauses(clause.Locking{Strength: "UPDATE"}).First(&order, v["order_id"]).Error; e != nil {
				return e
			}
			if order.Status != "paid" {
				return errors.New("只能申请已支付订单退款")
			}
			var count int64
			tx.Model(&model.Refunds{}).Where("order_id = ? AND status <> 'rejected'", order.ID).Count(&count)
			if count > 0 {
				return errors.New("该订单已有退款申请")
			}
			v["amount_minor"] = order.AmountMinor
			owner = order.OwnerID
		}
		if key == "bills" {
			gross, _ := v["gross_minor"].(int64)
			fee, _ := v["fee_minor"].(int64)
			if id > 0 {
				old := existing.(*model.Bills)
				gross = old.GrossMinor
				fee = old.FeeMinor
				if n, ok := v["gross_minor"].(int64); ok {
					gross = n
				}
				if n, ok := v["fee_minor"].(int64); ok {
					fee = n
				}
			}
			v["net_minor"] = gross - fee
		}
		if key == "organizations" {
			n, ok := v["account_id"].(int64)
			if !ok && id > 0 {
				n = existing.(*model.Organizations).AccountId
			}
			var count int64
			if err := tx.Table("sys_users").Where("id = ? AND authority_id = 300 AND deleted_at IS NULL", n).Count(&count).Error; err != nil {
				return err
			}
			if count != 1 {
				return errors.New("所属账号必须为版权方/制片方角色")
			}
			if id > 0 && existing.(*model.Organizations).OwnerID != uint(n) {
				return errors.New("机构归属账号不可直接更换")
			}
			owner = uint(n)
			if id > 0 {
				v["owner_id"] = owner
			}
		}
		if key == "episodes" {
			if id > 0 {
				old := existing.(*model.Episodes)
				var parent model.Dramas
				if err := tx.First(&parent, old.DramaId).Error; err != nil {
					return err
				}
				if parent.Status != "draft" && parent.Status != "rejected" && parent.Status != "offline" {
					return errors.New("原父剧集不可编辑，请先下架")
				}
			}
			dramaID, ok := v["drama_id"].(int64)
			if !ok && id > 0 {
				dramaID = existing.(*model.Episodes).DramaId
			}
			d := model.Dramas{}
			if err := tx.First(&d, dramaID).Error; err != nil {
				return err
			}
			if d.Status != "draft" && d.Status != "rejected" && d.Status != "offline" {
				return errors.New("父剧集已提交或发布，暂不可编辑单集")
			}
		}
		if key == "ads" {
			ep := model.Episodes{}
			if err := tx.First(&ep, v["episode_id"]).Error; err != nil {
				return err
			}
			policy := policyAt(tx, uint(ep.DramaId), time.Now())
			if !policy.AdsEnabled {
				return errors.New("此剧集未开放广告解锁")
			}
		}
		if key == "profiles" {
			if n, ok := v["account_id"].(int64); ok {
				var count int64
				tx.Table("sys_users").Where("id = ? AND deleted_at IS NULL", n).Count(&count)
				if count != 1 {
					return errors.New("系统账号不存在")
				}
				v["user_id"] = n
			}
		}
		if key == "compensations" {
			var n int64
			tx.Table("sys_users").Where("id = ? AND deleted_at IS NULL", v["target_user_id"]).Count(&n)
			if n != 1 {
				return errors.New("补偿账号不存在")
			}
		}
		if id == 0 {
			v["owner_id"] = owner
			v["user_id"] = a.ID
			if key == "profiles" {
				v["user_id"] = v["account_id"]
			}
			v["status"] = "draft"
			if key == "orders" {
				v["status"] = "pending"
			}
			if key == "refunds" || key == "feedback" {
				v["status"] = "pending"
			}
			if key == "ads" {
				v["status"] = "attempted"
			}
			if key == "history" || key == "favorites" || key == "versions" || key == "recoveries" || key == "syncs" || key == "restores" {
				v["status"] = "recorded"
			}
			v["created_at"] = time.Now()
			v["updated_at"] = time.Now()
			// Unique activity is updated instead of producing repeated favorites/history.
			if key == "favorites" || key == "history" {
				fk := "drama_id"
				if key == "history" {
					fk = "episode_id"
				}
				err := tx.Where("user_id = ? AND "+fk+" = ?", a.ID, v[fk]).First(existing).Error
				if err == nil {
					id = uint(asMap(existing)["id"].(float64))
					delete(v, "created_at")
					delete(v, "owner_id")
					delete(v, "user_id")
					delete(v, "status")
				} else if !errors.Is(err, gorm.ErrRecordNotFound) {
					return err
				}
			}
		}
		if id == 0 {
			if e := tx.Model(r.New()).Create(&v).Error; e != nil {
				return e
			}
			n, err := strconv.ParseUint(fmt.Sprint(v["id"]), 10, 64)
			if err != nil {
				return err
			}
			id = uint(n)
		} else {
			v["updated_at"] = time.Now()
			v["owner_id"] = owner
			if e := tx.Model(r.New()).Where("id = ?", id).Updates(v).Error; e != nil {
				return e
			}
		}
		result = r.New()
		if e := tx.First(result, id).Error; e != nil {
			return e
		}
		return audit(tx, a, key, id, "save", input)
	})
	return result, e
}
func (s PlatformService) Delete(a Actor, key string, id uint) error {
	r, e := resource(key, a, true)
	if e != nil {
		return e
	}
	if key != "favorites" && key != "dramas" && key != "episodes" && key != "versions" {
		return errors.New("业务流水不能删除，请使用状态操作")
	}
	return global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		v := r.New()
		if e := scoped(tx, r, a).Clauses(clause.Locking{Strength: "UPDATE"}).First(v, id).Error; e != nil {
			return e
		}
		m := asMap(v)
		if key != "favorites" && m["status"] != "draft" {
			return errors.New("仅草稿可删除")
		}
		if key == "episodes" {
			old := v.(*model.Episodes)
			var parent model.Dramas
			if err := tx.First(&parent, old.DramaId).Error; err != nil {
				return err
			}
			if parent.Status != "draft" && parent.Status != "rejected" && parent.Status != "offline" {
				return errors.New("父剧集不可编辑，请先下架")
			}
			for _, ref := range []string{"history", "entitlements", "orders", "ads", "events"} {
				var n int64
				if err := tx.Model(model.Resources[ref].New()).Where("episode_id = ?", id).Count(&n).Error; err != nil {
					return err
				}
				if n > 0 {
					return errors.New("单集已有业务引用，不可删除")
				}
			}
		}
		if key == "dramas" {
			for _, ref := range []string{"episodes", "versions", "reviews", "licenses", "policies", "favorites", "bills", "events"} {
				var n int64
				if err := tx.Model(model.Resources[ref].New()).Where("drama_id = ?", id).Count(&n).Error; err != nil {
					return err
				}
				if n > 0 {
					return errors.New("剧集已有业务引用，不可删除")
				}
			}
			var n int64
			tx.Model(&model.Episodes{}).Where("drama_id = ?", id).Count(&n)
			if n > 0 {
				return errors.New("请先删除草稿单集")
			}
		}
		if e := tx.Delete(v).Error; e != nil {
			return e
		}
		return audit(tx, a, key, id, "delete", nil)
	})
}

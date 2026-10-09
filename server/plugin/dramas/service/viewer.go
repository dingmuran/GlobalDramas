package service

import (
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model"
	req "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model/request"
	"gorm.io/gorm"
	"time"
)

type ViewerService struct{}

// Shared visibility rule for both viewer catalogue and retained playback logic.
func publishedDramas(db *gorm.DB, at time.Time) *gorm.DB {
	return db.Model(&model.Dramas{}).Where("status = 'published' AND license_start <= ? AND license_end > ?", at, at)
}
func viewerPage(p req.ViewerPage) req.ViewerPage {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.PageSize < 1 {
		p.PageSize = 20
	}
	if p.PageSize > 100 {
		p.PageSize = 100
	}
	return p
}
func (ViewerService) Dramas(p req.ViewerPage) (model.ViewerDramaPage, error) {
	p = viewerPage(p)
	out := model.ViewerDramaPage{List: []model.ViewerDrama{}, Page: p.Page, PageSize: p.PageSize}
	db := publishedDramas(global.GVA_DB, time.Now())
	if p.Search != "" {
		db = db.Where("title ILIKE ?", "%"+p.Search+"%")
	}
	if err := db.Count(&out.Total).Error; err != nil {
		return out, err
	}
	err := db.Select("id,title,synopsis,cover_url,genre,language,region,total_episodes").Order("id DESC").Offset((p.Page - 1) * p.PageSize).Limit(p.PageSize).Scan(&out.List).Error
	return out, err
}
func (ViewerService) Detail(id uint) (model.ViewerDrama, error) {
	var out model.ViewerDrama
	result := publishedDramas(global.GVA_DB, time.Now()).Select("id,title,synopsis,cover_url,genre,language,region,total_episodes").Where("id = ?", id).Limit(1).Scan(&out)
	if result.Error != nil {
		return out, result.Error
	}
	if result.RowsAffected == 0 {
		return out, gorm.ErrRecordNotFound
	}
	return out, nil
}
func (s ViewerService) Episodes(id uint, p req.ViewerPage) (model.ViewerEpisodePage, error) {
	p = viewerPage(p)
	out := model.ViewerEpisodePage{List: []model.ViewerEpisode{}, Page: p.Page, PageSize: p.PageSize}
	// A subquery rechecks publication and expiry in the metadata query itself.
	if _, err := s.Detail(id); err != nil {
		return out, err
	}
	db := global.GVA_DB.Model(&model.Episodes{}).Where("drama_id = ? AND drama_id IN (?)", id, publishedDramas(global.GVA_DB, time.Now()).Select("id"))
	if err := db.Count(&out.Total).Error; err != nil {
		return out, err
	}
	err := db.Select("id,drama_id,number,title,duration_seconds").Order("number ASC,id ASC").Offset((p.Page - 1) * p.PageSize).Limit(p.PageSize).Scan(&out.List).Error
	return out, err
}

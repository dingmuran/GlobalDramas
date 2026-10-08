package service

import (
	"fmt"
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model"
	"gorm.io/gorm"
	"time"
)

// Monitor expires published content automatically and records one warning per expiry.
func (PlatformService) Monitor() error {
	if global.GVA_DB == nil {
		return nil
	}
	return global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("SELECT pg_advisory_xact_lock(?)", int64(-7100811)).Error; err != nil {
			return err
		}
		var expired []model.Dramas
		if err := tx.Where("status = 'published' AND license_end <= ?", time.Now()).Find(&expired).Error; err != nil {
			return err
		}
		for _, d := range expired {
			if err := tx.Model(&d).Update("status", "offline").Error; err != nil {
				return err
			}
			subject := fmt.Sprintf("剧集 #%d 授权到期", d.ID)
			v := model.Alerts{Base: model.Base{OwnerID: d.OwnerID, Status: "pending"}, Category: "license", Severity: "warning", Subject: subject, Detail: d.Title + " 授权到期，系统已自动下架"}
			if err := tx.Where("subject = ? AND status <> 'resolved'", subject).FirstOrCreate(&v).Error; err != nil {
				return err
			}
			if err := audit(tx, Actor{}, "dramas", d.ID, "license_expired", nil); err != nil {
				return err
			}
		}
		return nil
	})
}

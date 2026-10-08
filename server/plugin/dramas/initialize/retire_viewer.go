package initialize

import "gorm.io/gorm"

// RetireViewerBackend removes legacy viewer access without touching user identities
// or gd_* business records. Role 200 remains a service-layer H5 identity marker.
// The caller supplies a transaction so startup reconciliation is atomic.
func RetireViewerBackend(tx *gorm.DB) error {
	statements := []string{
		`DELETE FROM sys_authority_btns WHERE authority_id = 200 OR sys_menu_id IN (SELECT id FROM sys_base_menus WHERE name IN ('GDRoot200','GDDiscover','GDHistory','GDFavorites','GDWallet','GDViewerMember','GDViewerFeedback'))`,
		`DELETE FROM sys_authority_menus WHERE sys_authority_authority_id = 200 OR sys_base_menu_id IN (SELECT id FROM sys_base_menus WHERE name IN ('GDRoot200','GDDiscover','GDHistory','GDFavorites','GDWallet','GDViewerMember','GDViewerFeedback'))`,
		`DELETE FROM sys_base_menu_parameters WHERE sys_base_menu_id IN (SELECT id FROM sys_base_menus WHERE name IN ('GDRoot200','GDDiscover','GDHistory','GDFavorites','GDWallet','GDViewerMember','GDViewerFeedback'))`,
		`DELETE FROM sys_base_menu_btns WHERE sys_base_menu_id IN (SELECT id FROM sys_base_menus WHERE name IN ('GDRoot200','GDDiscover','GDHistory','GDFavorites','GDWallet','GDViewerMember','GDViewerFeedback'))`,
		`DELETE FROM sys_base_menus WHERE name IN ('GDRoot200','GDDiscover','GDHistory','GDFavorites','GDWallet','GDViewerMember','GDViewerFeedback')`,
		`DELETE FROM sys_user_authority WHERE sys_authority_authority_id = 200`,
		`DELETE FROM sys_data_authority_id WHERE sys_authority_authority_id = 200 OR data_authority_id_authority_id = 200`,
		`UPDATE sys_authorities SET parent_id = NULL WHERE parent_id = 200`,
		`DELETE FROM sys_authorities WHERE authority_id = 200`,
		`DELETE FROM casbin_rule WHERE v0 = '200' OR v1 IN ('/dramas/playback/:id','/dramas/events')`,
		`DELETE FROM sys_apis WHERE path IN ('/dramas/playback/:id','/dramas/events')`,
	}
	for _, statement := range statements {
		if err := tx.Exec(statement).Error; err != nil {
			return err
		}
	}
	return nil
}

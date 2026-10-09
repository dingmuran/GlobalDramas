package initialize

import (
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system"
	"gorm.io/gorm"
)

// ReconcileReactBackoffice only retires explicitly obsolete generator metadata.
// It preserves custom menus, administrator edits, accounts and business records.
func ReconcileReactBackoffice(tx *gorm.DB) error {
	var obsolete []uint
	if err := tx.Model(&system.SysBaseMenu{}).Where("path LIKE 'autoCode%' OR component LIKE '%autoCode%' OR name IN ?", []string{"autoCode", "autoCodeAdmin", "autoCodeEdit", "autoCodeHistory", "autoPkg", "autoCodePlugin"}).Pluck("id", &obsolete).Error; err != nil {
		return err
	}
	if len(obsolete) > 0 {
		for _, s := range []string{"DELETE FROM sys_authority_btns WHERE sys_menu_id IN ?", "DELETE FROM sys_authority_menus WHERE sys_base_menu_id IN ?", "DELETE FROM sys_base_menu_parameters WHERE sys_base_menu_id IN ?", "DELETE FROM sys_base_menu_btns WHERE sys_base_menu_id IN ?", "DELETE FROM sys_base_menus WHERE id IN ?"} {
			if err := tx.Exec(s, obsolete).Error; err != nil {
				return err
			}
		}
	}
	for _, s := range []string{"DELETE FROM casbin_rule WHERE v1 LIKE '/autoCode%' OR v1 LIKE '/skills/%' OR v1='/sysError/getSysErrorSolution'", "DELETE FROM sys_apis WHERE path LIKE '/autoCode%' OR path LIKE '/skills/%' OR path='/sysError/getSysErrorSolution'", "DELETE FROM sys_ignore_apis WHERE path LIKE '/autoCode%' OR path LIKE '/skills/%'"} {
		if err := tx.Exec(s).Error; err != nil {
			return err
		}
	}
	groups := []struct {
		Name, Title, Icon string
		Pages             []string
	}{
		{"GDContentGroup", "内容管理", "videoCamera", []string{"GDReviews"}},
		{"GDStrategyGroup", "策略与会员", "control", []string{"GDPolicies", "GDMembership"}},
		{"GDOperationGroup", "用户与运营", "team", []string{"GDUsers", "GDOrders", "GDAds"}},
		{"GDFinanceGroup", "平台财务", "accountBook", []string{"GDFinance"}},
		{"GDDataGroup", "数据分析", "barChart", []string{"GDData"}},
		{"GDGovernanceGroup", "平台治理", "safety", []string{"GDGovernance"}},
		{"GDCreatorContentGroup", "内容管理", "videoCamera", []string{"GDDramas", "GDLicenses"}},
		{"GDCreatorDataGroup", "数据与收益", "barChart", []string{"GDAnalytics", "GDEarnings"}},
	}
	var legacy []uint
	if err := tx.Model(&system.SysBaseMenu{}).Where("name IN ?", []string{"GDRoot300", "GDRoot888"}).Pluck("id", &legacy).Error; err != nil {
		return err
	}
	legacy = append(legacy, 0)
	for i, g := range groups {
		group := system.SysBaseMenu{Name: g.Name, Path: g.Name, Component: "Layout", Sort: i + 10, Meta: system.Meta{Title: g.Title, Icon: g.Icon}}
		if err := tx.Where("name=?", g.Name).FirstOrCreate(&group).Error; err != nil {
			return err
		}
		if err := tx.Model(&system.SysBaseMenu{}).Where("name IN ? AND parent_id IN ?", g.Pages, legacy).Update("parent_id", group.ID).Error; err != nil {
			return err
		}
		// Grant the new ancestor only when the role already has an assigned child.
		if err := tx.Exec("INSERT INTO sys_authority_menus(sys_authority_authority_id,sys_base_menu_id) SELECT DISTINCT a.sys_authority_authority_id, CAST(? AS bigint) FROM sys_authority_menus a JOIN sys_base_menus m ON m.id=a.sys_base_menu_id WHERE m.parent_id=? ON CONFLICT DO NOTHING", group.ID, group.ID).Error; err != nil {
			return err
		}
	}
	if err := tx.Model(&system.SysBaseMenu{}).Where("name IN ? AND parent_id IN ?", []string{"GDOverview", "GDStudio"}, legacy).Update("parent_id", 0).Error; err != nil {
		return err
	}
	root := system.SysBaseMenu{Name: "GDSystemGroup", Path: "system", Component: "Layout", Sort: 90, Meta: system.Meta{Title: "系统管理", Icon: "setting"}}
	if err := tx.Where("name=?", root.Name).FirstOrCreate(&root).Error; err != nil {
		return err
	}
	for i, m := range []struct{ Name, Path, Component, Title string }{
		{"GDRoles", "system/roles", "pages/Roles", "角色管理"}, {"GDMenus", "system/menus", "pages/Menus", "菜单管理"}, {"GDApis", "system/apis", "pages/SystemRecords", "API管理"}, {"GDSystemUsers", "system/users", "pages/SystemUsers", "用户管理"}, {"GDDictionaries", "system/dictionaries", "pages/SystemRecords", "字典管理"}, {"GDOperationLogs", "system/logs/operation", "pages/Logs", "操作历史"}, {"GDParams", "system/params", "pages/SystemRecords", "参数管理"}, {"GDTokens", "system/tokens", "pages/SystemRecords", "API Token"}, {"GDLoginLogs", "system/logs/login", "pages/Logs", "登录日志"}, {"GDVersions", "system/versions", "pages/SystemRecords", "版本管理"}, {"GDErrorLogs", "system/logs/error", "pages/Logs", "错误日志"}, {"GDAssets", "system/assets", "pages/Assets", "素材文件"},
	} {
		menu := system.SysBaseMenu{Name: m.Name, Path: m.Path, Component: m.Component, ParentId: root.ID, Sort: i, Meta: system.Meta{Title: m.Title}}
		if err := tx.Where("name=?", m.Name).FirstOrCreate(&menu).Error; err != nil {
			return err
		}
		if err := tx.Model(&menu).Where("parent_id IN ?", legacy).Update("parent_id", root.ID).Error; err != nil {
			return err
		}
	}
	// Retire empty legacy directories only; preserve directories with custom children.
	var retired []uint
	if err := tx.Model(&system.SysBaseMenu{}).Where("name IN ? AND NOT EXISTS (SELECT 1 FROM sys_base_menus child WHERE child.parent_id=sys_base_menus.id)", []string{"GDRoot300", "GDRoot888", "GDLogs"}).Pluck("id", &retired).Error; err != nil {
		return err
	}
	if len(retired) > 0 {
		for _, query := range []string{"DELETE FROM sys_authority_btns WHERE sys_menu_id IN ?", "DELETE FROM sys_authority_menus WHERE sys_base_menu_id IN ?", "DELETE FROM sys_base_menu_parameters WHERE sys_base_menu_id IN ?", "DELETE FROM sys_base_menu_btns WHERE sys_base_menu_id IN ?", "DELETE FROM sys_base_menus WHERE id IN ?"} {
			if err := tx.Exec(query, retired).Error; err != nil {
				return err
			}
		}
	}
	// Change legacy defaults once, without overwriting administrator customization.
	for _, update := range []struct {
		Name, Title   string
		OldSort, Sort int
	}{
		{"GDRoles", "角色与权限", 30, 0}, {"GDAssets", "素材文件", 32, 11}, {"GDOverview", "管理总览", 11, 0},
	} {
		values := map[string]any{"sort": update.Sort}
		if update.Name == "GDRoles" {
			values["title"] = "角色管理"
		}
		if err := tx.Model(&system.SysBaseMenu{}).Where("name=? AND title=? AND sort=?", update.Name, update.Title, update.OldSort).Updates(values).Error; err != nil {
			return err
		}
	}
	return tx.Model(&system.SysUser{}).Where("header_img=?", "/global-dramas.svg").Update("header_img", "/gload-dramas.svg").Error
}

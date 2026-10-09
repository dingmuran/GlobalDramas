package initialize_test

import (
	"github.com/dingmuran/GlobalDramasAdmin/server/core"
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	base "github.com/dingmuran/GlobalDramasAdmin/server/initialize"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system"
	dramaInit "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/initialize"
	sysService "github.com/dingmuran/GlobalDramasAdmin/server/service/system"
	"os"
	"sync"
	"testing"
)

var bootstrap sync.Once

func setup() {
	bootstrap.Do(func() { global.GVA_VP = core.Viper(); global.GVA_LOG = core.Zap(); base.OtherInit() })
}

func TestRetireGeneratorMetadataPreservesBusiness(t *testing.T) {
	if os.Getenv("GD_INTEGRATION") != "1" {
		t.Skip("PostgreSQL integration requires GD_INTEGRATION=1")
	}
	setup()
	db := base.Gorm()
	if db == nil {
		t.Fatal("database unavailable")
	}
	tx := db.Begin()
	defer tx.Rollback()
	var beforeUsers, beforeDramas int64
	tx.Table("sys_users").Count(&beforeUsers)
	tx.Table("gd_dramas").Count(&beforeDramas)
	old := system.SysBaseMenu{Name: "CodeGeneratorRetirementTest", Path: "autoCode", Component: "view/systemTools/autoCode/index.vue"}
	if err := tx.Create(&old).Error; err != nil {
		t.Fatal(err)
	}
	if err := tx.Exec("INSERT INTO casbin_rule(ptype,v0,v1,v2) VALUES('p','300','/autoCode/testRetirement','POST')").Error; err != nil {
		t.Fatal(err)
	}
	custom := system.SysBaseMenu{Name: "CustomMenuPreservationTest", Path: "custom-preservation", Component: "Layout", Meta: system.Meta{Title: "自定义分组"}}
	if err := tx.Create(&custom).Error; err != nil {
		t.Fatal(err)
	}
	// Existing custom menu restrictions must survive reconciliation.
	if err := tx.Exec("DELETE FROM sys_authority_menus WHERE sys_authority_authority_id=300").Error; err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 2; i++ {
		if err := dramaInit.ReconcileReactBackoffice(tx); err != nil {
			t.Fatal(err)
		}
	}
	var customCount int64
	tx.Table("sys_base_menus").Where("id=? AND title=?", custom.ID, "自定义分组").Count(&customCount)
	if customCount != 1 {
		t.Fatal("custom menu lost")
	}
	var systemRoot system.SysBaseMenu
	if err := tx.Where("name=?", "GDSystemGroup").First(&systemRoot).Error; err != nil {
		t.Fatal(err)
	}
	var systemChildren int64
	tx.Model(&system.SysBaseMenu{}).Where("parent_id=?", systemRoot.ID).Count(&systemChildren)
	if systemChildren != 12 {
		t.Fatalf("missing system management entries: %d", systemChildren)
	}
	if err := tx.Model(&systemRoot).Update("title", "系统配置自定义标题").Error; err != nil {
		t.Fatal(err)
	}
	if err := dramaInit.ReconcileReactBackoffice(tx); err != nil {
		t.Fatal(err)
	}
	tx.First(&systemRoot, systemRoot.ID)
	if systemRoot.Title != "系统配置自定义标题" {
		t.Fatal("administrator edits overwritten")
	}
	var obsolete, permissions, afterUsers, afterDramas, creatorMenus int64
	tx.Table("sys_base_menus").Where("name=?", old.Name).Count(&obsolete)
	tx.Table("casbin_rule").Where("v1 LIKE '/autoCode%'").Count(&permissions)
	tx.Table("sys_users").Count(&afterUsers)
	tx.Table("gd_dramas").Count(&afterDramas)
	tx.Table("sys_authority_menus").Where("sys_authority_authority_id=300").Count(&creatorMenus)
	if obsolete != 0 || permissions != 0 || creatorMenus != 0 {
		t.Fatalf("metadata or permissions not preserved correctly: %d %d %d", obsolete, permissions, creatorMenus)
	}
	if beforeUsers != afterUsers || beforeDramas != afterDramas {
		t.Fatal("business data changed")
	}
}

func TestMenuParentAndCatalogPermissions(t *testing.T) {
	if os.Getenv("GD_INTEGRATION") != "1" {
		t.Skip("PostgreSQL integration requires GD_INTEGRATION=1")
	}
	setup()
	db := base.Gorm()
	if db == nil {
		t.Fatal("database unavailable")
	}
	tx := db.Begin()
	defer tx.Rollback()
	previous := global.GVA_DB
	global.GVA_DB = tx
	defer func() { global.GVA_DB = previous }()
	catalog := system.SysBaseMenu{Name: "TestCatalogPermissions", Path: "test-catalog", Component: "Layout"}
	if err := sysService.MenuServiceApp.AddBaseMenu(catalog); err != nil {
		t.Fatal(err)
	}
	tx.Where("name=?", catalog.Name).First(&catalog)
	child := system.SysBaseMenu{Name: "TestChildPermissions", Path: "system/menus", Component: "pages/Menus", ParentId: catalog.ID}
	if err := sysService.MenuServiceApp.AddBaseMenu(child); err != nil {
		t.Fatal(err)
	}
	tx.Where("name=?", child.Name).First(&child)
	var count int64
	tx.Table("sys_authority_menus").Where("sys_authority_authority_id=888 AND sys_base_menu_id=?", catalog.ID).Count(&count)
	if count != 1 {
		t.Fatal("creating first catalog child removed administrator access")
	}
	if err := sysService.ValidateMenuParent(tx, catalog.ID, child.ID); err == nil {
		t.Fatal("descendant parent accepted")
	}
	if err := sysService.ValidateMenuParent(tx, child.ID, child.ID); err == nil {
		t.Fatal("self parent accepted")
	}
	if err := sysService.ValidateMenuParent(tx, child.ID, 999999999); err == nil {
		t.Fatal("missing parent accepted")
	}
	target := system.SysBaseMenu{Name: "TestMoveCatalogPermissions", Path: "test-move", Component: "Layout"}
	if err := tx.Create(&target).Error; err != nil {
		t.Fatal(err)
	}
	child.ParentId = target.ID
	if err := sysService.BaseMenuServiceApp.UpdateBaseMenu(child); err != nil {
		t.Fatal(err)
	}
	tx.Table("sys_authority_menus").Where("sys_authority_authority_id=888 AND sys_base_menu_id=?", target.ID).Count(&count)
	if count != 1 {
		t.Fatal("moving authorized menu lost ancestor permission")
	}
}

package system

import (
	"context"
	"errors"

	. "github.com/dingmuran/GlobalDramasAdmin/server/model/system"
	"github.com/dingmuran/GlobalDramasAdmin/server/service/system"
	"gorm.io/gorm"
)

const initOrderMenu = initOrderAuthority + 1

type initMenu struct{}

// auto run
func init() {
	system.RegisterInit(initOrderMenu, &initMenu{})
}

func (i *initMenu) InitializerName() string {
	return SysBaseMenu{}.TableName()
}

func (i *initMenu) MigrateTable(ctx context.Context) (context.Context, error) {
	db, ok := ctx.Value("db").(*gorm.DB)
	if !ok {
		return ctx, system.ErrMissingDBContext
	}
	return ctx, db.AutoMigrate(
		&SysBaseMenu{},
		&SysBaseMenuParameter{},
		&SysBaseMenuBtn{},
	)
}

func (i *initMenu) TableCreated(ctx context.Context) bool {
	db, ok := ctx.Value("db").(*gorm.DB)
	if !ok {
		return false
	}
	m := db.Migrator()
	return m.HasTable(&SysBaseMenu{}) &&
		m.HasTable(&SysBaseMenuParameter{}) &&
		m.HasTable(&SysBaseMenuBtn{})
}

func (i *initMenu) InitializeData(ctx context.Context) (next context.Context, err error) {
	db, ok := ctx.Value("db").(*gorm.DB)
	if !ok {
		return ctx, system.ErrMissingDBContext
	}

	allEntities := []SysBaseMenu{
		{Path: "system/roles", Name: "GDRoles", Component: "pages/Roles", Sort: 30, Meta: Meta{Title: "角色与权限", Icon: "lock"}},
		{Path: "system/assets", Name: "GDAssets", Component: "pages/Assets", Sort: 32, Meta: Meta{Title: "素材文件", Icon: "folder"}},
	}
	if err = db.Create(&allEntities).Error; err != nil {
		return ctx, err
	}

	next = context.WithValue(ctx, i.InitializerName(), allEntities)
	return next, nil
}

func (i *initMenu) DataInserted(ctx context.Context) bool {
	db, ok := ctx.Value("db").(*gorm.DB)
	if !ok {
		return false
	}
	if errors.Is(db.Where("name = ?", "GDRoles").First(&SysBaseMenu{}).Error, gorm.ErrRecordNotFound) { // 判断是否存在数据
		return false
	}
	return true
}

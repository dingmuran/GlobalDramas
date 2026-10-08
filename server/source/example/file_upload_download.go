package example

import (
	"context"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/example"
	"github.com/dingmuran/GlobalDramasAdmin/server/service/system"
	"gorm.io/gorm"
)

const initOrderExaFile = system.InitOrderInternal + 1

type initExaFileMysql struct{}

// auto run
func init() {
	system.RegisterInit(initOrderExaFile, &initExaFileMysql{})
}

func (i *initExaFileMysql) MigrateTable(ctx context.Context) (context.Context, error) {
	db, ok := ctx.Value("db").(*gorm.DB)
	if !ok {
		return ctx, system.ErrMissingDBContext
	}
	return ctx, db.AutoMigrate(&example.ExaFileUploadAndDownload{})
}

func (i *initExaFileMysql) TableCreated(ctx context.Context) bool {
	db, ok := ctx.Value("db").(*gorm.DB)
	if !ok {
		return false
	}
	return db.Migrator().HasTable(&example.ExaFileUploadAndDownload{})
}

func (i *initExaFileMysql) InitializerName() string {
	return example.ExaFileUploadAndDownload{}.TableName()
}

// 新项目不创建示例图片记录。
func (i *initExaFileMysql) InitializeData(ctx context.Context) (context.Context, error) {
	return ctx, nil
}

func (i *initExaFileMysql) DataInserted(ctx context.Context) bool {
	return true
}

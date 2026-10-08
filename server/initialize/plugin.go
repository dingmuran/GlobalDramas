package initialize

import (
	adapter "github.com/casbin/gorm-adapter/v3"
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system"
	"github.com/dingmuran/GlobalDramasAdmin/server/utils"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func InstallPlugin(PrivateGroup *gin.RouterGroup, PublicRouter *gin.RouterGroup, engine *gin.Engine) {
	notifier := GetDBReadyNotifier()

	// 保存插件初始化参数
	notifier.SetPluginParams(&PluginParams{
		PrivateGroup: PrivateGroup,
		PublicRouter: PublicRouter,
		Engine:       engine,
	})

	if global.GVA_DB == nil {
		global.GVA_LOG.Info("项目暂未初始化，插件将在数据库初始化完成后自动注册")
		// 订阅数据库就绪事件
		notifier.Subscribe(func() {
			global.GVA_LOG.Info("数据库已就绪，开始注册插件")
			params := notifier.GetPluginParams()
			if params != nil {
				bizPluginV1(params.PrivateGroup, params.PublicRouter)
				bizPluginV2(params.Engine)
				syncSuperAdminPermissions()
				// 重新同步全局路由表，包含插件注册的路由
				global.GVA_ROUTERS = params.Engine.Routes()
				global.GVA_LOG.Info("插件注册完成")
			}
		})
		return
	}

	// 数据库已存在，直接注册
	bizPluginV1(PrivateGroup, PublicRouter)
	bizPluginV2(engine)
	syncSuperAdminPermissions()
}

// 插件在基础数据初始化之后注册，需同步其菜单和接口到超级管理员。
func syncSuperAdminPermissions() {
	err := global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		var admin system.SysAuthority
		if err := tx.First(&admin, "authority_id = ?", 888).Error; err != nil {
			return err
		}
		var menus []system.SysBaseMenu
		if err := tx.Find(&menus).Error; err != nil {
			return err
		}
		if err := tx.Model(&admin).Association("SysBaseMenus").Append(menus); err != nil {
			return err
		}
		var apis []system.SysApi
		if err := tx.Find(&apis).Error; err != nil {
			return err
		}
		var policies []adapter.CasbinRule
		if err := tx.Where("ptype = ? AND v0 = ?", "p", "888").Find(&policies).Error; err != nil {
			return err
		}
		seen := make(map[string]bool)
		for _, policy := range policies {
			seen[policy.V1+"\x00"+policy.V2] = true
		}
		var missing []adapter.CasbinRule
		for _, api := range apis {
			key := api.Path + "\x00" + api.Method
			if !seen[key] {
				missing = append(missing, adapter.CasbinRule{Ptype: "p", V0: "888", V1: api.Path, V2: api.Method})
				seen[key] = true
			}
		}
		if len(missing) > 0 {
			return tx.Create(&missing).Error
		}
		return nil
	})
	if err == nil {
		err = utils.GetCasbin().LoadPolicy()
	}
	if err != nil {
		global.GVA_LOG.Error("同步超级管理员插件权限失败", zap.Error(err))
	}
}

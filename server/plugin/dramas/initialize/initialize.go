package initialize

import (
	"fmt"
	adapter "github.com/casbin/gorm-adapter/v3"
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/middleware"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/router"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/service"
	pluginutil "github.com/dingmuran/GlobalDramasAdmin/server/plugin/plugin-tool/utils"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"sort"
	"strconv"
)

var pages = []struct {
	Name, Title string
	Role        uint
}{
	{"GDDiscover", "发现好剧", 200}, {"GDHistory", "追剧记录", 200}, {"GDFavorites", "我的收藏", 200}, {"GDWallet", "钱包和订单", 200}, {"GDViewerMember", "会员中心", 200}, {"GDViewerFeedback", "帮助与反馈", 200},
	{"GDStudio", "工作台", 300}, {"GDDramas", "剧集管理", 300}, {"GDAnalytics", "数据分析", 300}, {"GDEarnings", "收益中心", 300}, {"GDLicenses", "版权与授权", 300},
	{"GDOverview", "管理总览", 888}, {"GDReviews", "内容审核", 888}, {"GDUsers", "用户与机构", 888}, {"GDFinance", "平台财务", 888}, {"GDPolicies", "策略配置", 888}, {"GDMembership", "会员管理", 888}, {"GDOrders", "订单与售后", 888}, {"GDAds", "广告与补偿", 888}, {"GDData", "平台数据", 888}, {"GDGovernance", "审批审计与告警", 888},
}

func Register(engine *gin.Engine) error {
	if global.GVA_DB.Dialector.Name() != "postgres" {
		return fmt.Errorf("Global Dramas业务模块需要PostgreSQL，请设置system.db-type为pgsql")
	}
	keys := []string{}
	for k := range model.Resources {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, key := range keys {
		r := model.Resources[key]
		if e := global.GVA_DB.AutoMigrate(r.New()); e != nil {
			return e
		}
		if global.GVA_DB.Dialector.Name() == "postgres" {
			if e := global.GVA_DB.Exec(fmt.Sprintf("COMMENT ON TABLE gd_%s IS '%s'", key, r.Title)).Error; e != nil {
				return e
			}
		}
	}
	// Database uniqueness also protects concurrent imports and duplicate reward grants.
	for _, sql := range []string{
		"CREATE UNIQUE INDEX IF NOT EXISTS gd_username_unique ON sys_users(username) WHERE deleted_at IS NULL",
		"CREATE UNIQUE INDEX IF NOT EXISTS gd_payment_reference ON gd_orders(provider,provider_reference) WHERE provider_reference <> ''",
		"CREATE UNIQUE INDEX IF NOT EXISTS gd_episode_number ON gd_episodes(drama_id,number)",
		"CREATE UNIQUE INDEX IF NOT EXISTS gd_favorite_user_drama ON gd_favorites(user_id,drama_id)",
		"CREATE UNIQUE INDEX IF NOT EXISTS gd_history_user_episode ON gd_history(user_id,episode_id)",
		"CREATE UNIQUE INDEX IF NOT EXISTS gd_entitlement_reference ON gd_entitlements(user_id,episode_id,source,reference)",
		"CREATE UNIQUE INDEX IF NOT EXISTS gd_bill_platform_external ON gd_bills(platform,external_id)",
		"CREATE UNIQUE INDEX IF NOT EXISTS gd_pending_approval ON gd_approvals(resource,target_id) WHERE status='pending'",
		"CREATE UNIQUE INDEX IF NOT EXISTS gd_profile_account ON gd_profiles(account_id)",
		"CREATE UNIQUE INDEX IF NOT EXISTS gd_plan_product ON gd_plans(platform,platform_product_id)",
		"CREATE UNIQUE INDEX IF NOT EXISTS gd_refund_order ON gd_refunds(order_id) WHERE status <> 'rejected'",
	} {
		if e := global.GVA_DB.Exec(sql).Error; e != nil {
			return e
		}
	}
	if e := referenceGuards(); e != nil {
		return e
	}
	apis := []system.SysApi{}
	for _, p := range []struct{ Path, Method, Title string }{
		{"/dramas/schema", "GET", "资源元数据"}, {"/dramas/overview", "GET", "业务概览"}, {"/dramas/records/:resource", "GET", "业务列表"}, {"/dramas/records/:resource", "POST", "业务创建"}, {"/dramas/records/:resource/:id", "PUT", "业务编辑"}, {"/dramas/records/:resource/:id", "DELETE", "草稿删除"}, {"/dramas/actions/:resource/:id", "POST", "业务状态操作"}, {"/dramas/playback/:id", "GET", "播放权益"}, {"/dramas/events", "POST", "播放指标"}, {"/dramas/preview", "GET", "策略影响预览"}, {"/dramas/accounts", "GET", "账号管理"}, {"/dramas/accounts", "POST", "创建业务账号"}, {"/dramas/bills/import", "POST", "账单导入"},
	} {
		apis = append(apis, system.SysApi{Path: p.Path, Method: p.Method, ApiGroup: "Global Dramas", Description: p.Title})
	}
	pluginutil.RegisterApis(apis...)
	err := global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		for _, role := range []struct {
			ID           uint
			Name, Router string
		}{{200, "观众", "GDDiscover"}, {300, "版权方 / 制片方", "GDStudio"}, {888, "超级管理员", "GDOverview"}} {
			a := system.SysAuthority{AuthorityId: role.ID, AuthorityName: role.Name, DefaultRouter: role.Router}
			if e := tx.Where("authority_id = ?", role.ID).FirstOrCreate(&a).Error; e != nil {
				return e
			}
			if e := tx.Model(&a).Updates(map[string]any{"authority_name": role.Name, "default_router": role.Router}).Error; e != nil {
				return e
			}
			root := system.SysBaseMenu{Path: "gd" + strconv.Itoa(int(role.ID)), Name: "GDRoot" + strconv.Itoa(int(role.ID)), Component: "view/routerHolder.vue", Sort: int(role.ID) / 100, Meta: system.Meta{Title: role.Name, Icon: "film"}}
			if e := tx.Where("name = ?", root.Name).FirstOrCreate(&root).Error; e != nil {
				return e
			}
			menus := []system.SysBaseMenu{root}
			for i, p := range pages {
				if p.Role != role.ID {
					continue
				}
				m := system.SysBaseMenu{ParentId: root.ID, Path: p.Name, Name: p.Name, Component: "plugin/dramas/view/workspace.vue", Sort: i, Meta: system.Meta{Title: p.Title, Icon: "film"}}
				if e := tx.Where("name = ?", m.Name).FirstOrCreate(&m).Error; e != nil {
					return e
				}
				menus = append(menus, m)
			}
			if role.ID == 888 {
				if e := tx.Model(&a).Association("SysBaseMenus").Append(menus); e != nil {
					return e
				}
			} else {
				if e := tx.Model(&a).Association("SysBaseMenus").Replace(menus); e != nil {
					return e
				}
			}
			for _, api := range apis {
				if role.ID != 888 && (api.Path == "/dramas/accounts" || api.Path == "/dramas/bills/import" || api.Path == "/dramas/preview") {
					continue
				}
				rule := adapter.CasbinRule{Ptype: "p", V0: strconv.Itoa(int(role.ID)), V1: api.Path, V2: api.Method}
				if e := tx.Where("ptype = ? AND v0 = ? AND v1 = ? AND v2 = ?", rule.Ptype, rule.V0, rule.V1, rule.V2).FirstOrCreate(&rule).Error; e != nil {
					return e
				}
			}
			if role.ID != 888 {
				for _, api := range []system.SysApi{{Path: "/user/getUserInfo", Method: "GET"}, {Path: "/menu/getMenu", Method: "POST"}, {Path: "/user/changePassword", Method: "POST"}, {Path: "/user/setSelfInfo", Method: "PUT"}, {Path: "/user/setSelfSetting", Method: "PUT"}, {Path: "/user/setUserAuthority", Method: "POST"}} {
					r := adapter.CasbinRule{Ptype: "p", V0: strconv.Itoa(int(role.ID)), V1: api.Path, V2: api.Method}
					if e := tx.Where("ptype = ? AND v0 = ? AND v1 = ? AND v2 = ?", r.Ptype, r.V0, r.V1, r.V2).FirstOrCreate(&r).Error; e != nil {
						return e
					}
				}
			}
		}
		return nil
	})
	if err != nil {
		return err
	}
	if err := service.ServiceGroupApp.PlatformService.Monitor(); err != nil {
		return err
	}
	_, err = global.GVA_Timer.AddTaskByFunc("GlobalDramasLicense", "@every 1m", func() {
		if e := service.ServiceGroupApp.PlatformService.Monitor(); e != nil {
			global.GVA_LOG.Error("授权期限检查失败", zap.Error(e))
		}
	}, "授权到期自动下架与告警")
	if err != nil {
		return err
	}
	g := engine.Group(global.GVA_CONFIG.System.RouterPrefix)
	g.Use(middleware.JWTAuth(), middleware.CasbinHandler())
	router.RouterGroupApp.PlatformRouter.Init(g)
	return nil
}

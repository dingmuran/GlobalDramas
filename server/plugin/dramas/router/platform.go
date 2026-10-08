package router

import (
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/common/response"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system"
	"github.com/dingmuran/GlobalDramasAdmin/server/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

type PlatformRouter struct{}

func (PlatformRouter) Init(g *gin.RouterGroup) {
	r := g.Group("dramas")
	r.Use(func(c *gin.Context) {
		var user system.SysUser
		if err := global.GVA_DB.Select("id", "enable", "authority_id").Preload("Authorities").First(&user, utils.GetUserID(c)).Error; err != nil || user.Enable != 1 {
			response.NoAuth("账号已失效或被冻结", c)
			c.Abort()
			return
		}
		role := utils.GetUserAuthorityId(c)
		valid := user.AuthorityId == role
		for _, r := range user.Authorities {
			if r.AuthorityId == role {
				valid = true
			}
		}
		if !valid {
			response.NoAuth("角色授权已变更，请重新登录", c)
			c.Abort()
			return
		}
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 2<<20)
		c.Next()
	})
	r.GET("schema", platformApi.Schema)
	r.GET("overview", platformApi.Overview)
	r.GET("records/:resource", platformApi.List)
	r.GET("playback/:id", platformApi.Playback)
	r.GET("preview", platformApi.Preview)
	r.GET("accounts", platformApi.Accounts)
	w := r.Group("")
	w.POST("records/:resource", platformApi.Create)
	w.PUT("records/:resource/:id", platformApi.Update)
	w.DELETE("records/:resource/:id", platformApi.Delete)
	w.POST("actions/:resource/:id", platformApi.Action)
	w.POST("events", platformApi.Event)
	w.POST("accounts", platformApi.CreateAccount)
	w.POST("bills/import", platformApi.Import)
}

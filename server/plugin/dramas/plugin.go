package dramas

import (
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/initialize"
	interfaces "github.com/dingmuran/GlobalDramasAdmin/server/utils/plugin/v2"
	"github.com/gin-gonic/gin"
)

type plugin struct{}

var Plugin = new(plugin)

func init() { interfaces.Register(Plugin) }
func (*plugin) Register(engine *gin.Engine) {
	if err := initialize.Register(engine); err != nil {
		panic("Global Dramas初始化失败: " + err.Error())
	}
}

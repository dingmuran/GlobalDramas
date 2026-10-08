package router

import (
	"github.com/dingmuran/GlobalDramasAdmin/server/router/example"
	"github.com/dingmuran/GlobalDramasAdmin/server/router/system"
)

var RouterGroupApp = new(RouterGroup)

type RouterGroup struct {
	System  system.RouterGroup
	Example example.RouterGroup
}

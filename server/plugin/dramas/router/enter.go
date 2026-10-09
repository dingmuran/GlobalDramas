package router

import "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/api"

var RouterGroupApp = new(RouterGroup)

type RouterGroup struct {
	PlatformRouter
	ViewerRouter
}

var platformApi = api.ApiGroupApp.PlatformApi
var viewerApi = api.ApiGroupApp.ViewerApi

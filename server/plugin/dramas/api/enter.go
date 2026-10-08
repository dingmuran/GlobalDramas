package api

import "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/service"

var ApiGroupApp = new(ApiGroup)

type ApiGroup struct{ PlatformApi }

var platform = service.ServiceGroupApp.PlatformService

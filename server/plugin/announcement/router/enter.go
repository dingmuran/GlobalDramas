package router

import "github.com/dingmuran/GlobalDramasAdmin/server/plugin/announcement/api"

var (
	Router  = new(router)
	apiInfo = api.Api.Info
)

type router struct{ Info info }

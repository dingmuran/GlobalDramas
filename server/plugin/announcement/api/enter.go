package api

import "github.com/dingmuran/GlobalDramasAdmin/server/plugin/announcement/service"

var (
	Api         = new(api)
	serviceInfo = service.Service.Info
)

type api struct{ Info info }

package service

import (
	"github.com/dingmuran/GlobalDramasAdmin/server/service/example"
	"github.com/dingmuran/GlobalDramasAdmin/server/service/system"
)

var ServiceGroupApp = new(ServiceGroup)

type ServiceGroup struct {
	SystemServiceGroup  system.ServiceGroup
	ExampleServiceGroup example.ServiceGroup
}

package initialize

import (
	_ "github.com/dingmuran/GlobalDramasAdmin/server/source/example"
	_ "github.com/dingmuran/GlobalDramasAdmin/server/source/system"
)

func init() {
	// do nothing,only import source package so that inits can be registered
}

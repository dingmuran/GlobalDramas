package core

import (
	"fmt"
	"time"

	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/initialize"
	"github.com/dingmuran/GlobalDramasAdmin/server/service/system"
	"go.uber.org/zap"
)

func RunServer() {
	if global.GVA_CONFIG.System.UseRedis {
		initialize.Redis()
		if global.GVA_CONFIG.System.UseMultipoint {
			initialize.RedisList()
		}
	}

	if global.GVA_CONFIG.System.UseMongo {
		if err := initialize.Mongo.Initialization(); err != nil {
			zap.L().Error(fmt.Sprintf("%+v", err))
		}
	}

	if global.GVA_DB != nil {
		system.LoadAll()
	}

	Router := initialize.Routers()
	address := fmt.Sprintf(":%d", global.GVA_CONFIG.System.Addr)

	fmt.Printf(`
	欢迎使用 Gload Dramas
	当前版本:%s
	项目地址:https://github.com/dingmuran/GlobalDramasAdmin
	默认自动化文档地址:http://127.0.0.1%s/swagger/index.html
	默认前端文件运行地址:http://127.0.0.1:8080

`, global.Version, address)

	initServer(address, Router, 10*time.Minute, 10*time.Minute)
}

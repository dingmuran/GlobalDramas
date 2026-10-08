package request

import (
	"github.com/dingmuran/GlobalDramasAdmin/server/model/common/request"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system"
)

type SysLoginLogSearch struct {
	system.SysLoginLog
	request.PageInfo
}

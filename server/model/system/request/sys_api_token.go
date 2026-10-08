package request

import (
	"github.com/dingmuran/GlobalDramasAdmin/server/model/common/request"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system"
)

type SysApiTokenSearch struct {
	system.SysApiToken
	request.PageInfo
    Status *bool `json:"status" form:"status"`
}

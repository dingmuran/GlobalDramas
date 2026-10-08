package request

import (
	"github.com/dingmuran/GlobalDramasAdmin/server/model/common/request"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system"
)

type SysOperationRecordSearch struct {
	system.SysOperationRecord
	request.PageInfo
}

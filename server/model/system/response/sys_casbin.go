package response

import (
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system/request"
)

type PolicyPathResponse struct {
	Paths []request.CasbinInfo `json:"paths"`
}

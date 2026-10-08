package response

import "github.com/dingmuran/GlobalDramasAdmin/server/config"

type SysConfigResponse struct {
	Config config.Server `json:"config"`
}

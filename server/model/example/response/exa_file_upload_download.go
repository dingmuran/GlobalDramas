package response

import "github.com/dingmuran/GlobalDramasAdmin/server/model/example"

type ExaFileResponse struct {
	File example.ExaFileUploadAndDownload `json:"file"`
}

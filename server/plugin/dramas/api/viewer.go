package api

import (
	"errors"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/common/response"
	req "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model/request"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ViewerApi struct{}

func viewerReply(c *gin.Context, data any, err error) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		response.FailWithMessage("剧集不存在或暂不可观看", c)
		return
	}
	if err != nil {
		response.FailWithMessage("内容加载失败", c)
		return
	}
	response.OkWithData(data, c)
}

// Health checks viewer API reachability; it is not a database readiness probe.
// @Summary 检查观众接口连接
// @Tags Viewer
// @Success 200 {object} response.Response
// @Router /viewer/v1/health [get]
func (ViewerApi) Health(c *gin.Context) {
	response.OkWithData(map[string]string{"status": "available"}, c)
}

// Dramas lists only published content within its licence period.
// @Summary 分页查询公开剧集
// @Tags Viewer
// @Param page query int false "页码，1–100000"
// @Param pageSize query int false "每页数量，1–100"
// @Param search query string false "剧名关键词，最多100字符"
// @Success 200 {object} response.Response{data=model.ViewerDramaPage}
// @Router /viewer/v1/dramas [get]
func (ViewerApi) Dramas(c *gin.Context) {
	var p req.ViewerPage
	if err := c.ShouldBindQuery(&p); err != nil {
		response.FailWithMessage("查询参数无效", c)
		return
	}
	v, e := viewer.Dramas(p)
	viewerReply(c, v, e)
}

// Detail returns public metadata without administrative fields.
// @Summary 获取公开剧集详情
// @Tags Viewer
// @Param id path int true "剧集ID"
// @Success 200 {object} response.Response{data=model.ViewerDrama}
// @Router /viewer/v1/dramas/{id} [get]
func (ViewerApi) Detail(c *gin.Context) {
	if id(c) == 0 {
		response.FailWithMessage("剧集ID无效", c)
		return
	}
	v, e := viewer.Detail(id(c))
	viewerReply(c, v, e)
}

// Episodes never discloses video URLs or grants playback rights.
// @Summary 分页获取公开选集信息
// @Tags Viewer
// @Param id path int true "剧集ID"
// @Param page query int false "页码，1–100000"
// @Param pageSize query int false "每页数量，1–100"
// @Success 200 {object} response.Response{data=model.ViewerEpisodePage}
// @Router /viewer/v1/dramas/{id}/episodes [get]
func (ViewerApi) Episodes(c *gin.Context) {
	if id(c) == 0 {
		response.FailWithMessage("剧集ID无效", c)
		return
	}
	var p req.ViewerPage
	if err := c.ShouldBindQuery(&p); err != nil {
		response.FailWithMessage("查询参数无效", c)
		return
	}
	v, e := viewer.Episodes(id(c), p)
	viewerReply(c, v, e)
}

package api

import (
	"encoding/json"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/common/response"
	req "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model/request"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/service"
	"github.com/dingmuran/GlobalDramasAdmin/server/utils"
	"github.com/gin-gonic/gin"
	"strconv"
	"time"
)

type PlatformApi struct{}

func actor(c *gin.Context) service.Actor {
	return service.Actor{ID: utils.GetUserID(c), Role: utils.GetUserAuthorityId(c)}
}
func id(c *gin.Context) uint { n, _ := strconv.ParseUint(c.Param("id"), 10, 32); return uint(n) }
func reply(c *gin.Context, v any, e error) {
	if e != nil {
		response.FailWithMessage(e.Error(), c)
	} else {
		response.OkWithData(v, c)
	}
}

// Schema 角色可访问资源与字段元数据。
// @Summary 获取业务资源表单元数据
// @Tags GlobalDramas
// @Security ApiKeyAuth
// @Success 200 {object} response.Response
// @Router /dramas/schema [get]
func (PlatformApi) Schema(c *gin.Context) {
	a := actor(c)
	resources := platform.Schema(a)
	out := []map[string]any{}
	allowed := func(path, method string) bool {
		ok, err := utils.GetCasbin().Enforce(strconv.Itoa(int(a.Role)), path, method)
		return err == nil && ok
	}
	for _, r := range resources {
		key := r["key"].(string)
		if !allowed("/dramas/records/"+key, "GET") {
			continue
		}
		writable := r["canWrite"].(bool)
		r["canWrite"] = writable && allowed("/dramas/records/"+key, "POST")
		r["canEdit"] = writable && allowed("/dramas/records/"+key+"/1", "PUT")
		r["canDelete"] = writable && allowed("/dramas/records/"+key+"/1", "DELETE")
		r["canAction"] = allowed("/dramas/actions/"+key+"/1", "POST")
		out = append(out, r)
	}
	response.OkWithData(out, c)
}

// @Summary 获取当前角色的真实业务概览
// @Tags GlobalDramas
// @Security ApiKeyAuth
// @Success 200 {object} response.Response
// @Router /dramas/overview [get]
func (PlatformApi) Overview(c *gin.Context) { v, e := platform.Overview(actor(c)); reply(c, v, e) }

// @Summary 分页查询业务资源（按角色和所属账号隔离）
// @Tags GlobalDramas
// @Security ApiKeyAuth
// @Param resource path string true "资源键"
// @Param page query int false "页码"
// @Param pageSize query int false "每页数量，最多100"
// @Success 200 {object} response.Response
// @Router /dramas/records/{resource} [get]
func (PlatformApi) List(c *gin.Context) {
	var p req.Page
	if e := c.ShouldBindQuery(&p); e != nil {
		reply(c, nil, e)
		return
	}
	v, e := platform.List(actor(c), c.Param("resource"), p)
	reply(c, v, e)
}

// @Summary 创建资源记录（字段按白名单校验）
// @Tags GlobalDramas
// @Security ApiKeyAuth
// @Param resource path string true "资源键"
// @Param body body object true "可写字段，不含状态或归属"
// @Success 200 {object} response.Response
// @Router /dramas/records/{resource} [post]
func (PlatformApi) Create(c *gin.Context) { save(c, 0) }

// @Summary 修改可编辑记录
// @Tags GlobalDramas
// @Security ApiKeyAuth
// @Param resource path string true "资源键"
// @Param id path int true "记录ID"
// @Param body body object true "可写字段"
// @Success 200 {object} response.Response
// @Router /dramas/records/{resource}/{id} [put]
func (PlatformApi) Update(c *gin.Context) {
	if id(c) == 0 {
		response.FailWithMessage("记录ID无效", c)
		return
	}
	save(c, id(c))
}
func save(c *gin.Context, n uint) {
	c.Request.Body = maxBody(c)
	var m map[string]json.RawMessage
	if e := c.ShouldBindJSON(&m); e != nil {
		reply(c, nil, e)
		return
	}
	v, e := platform.Save(actor(c), c.Param("resource"), n, m)
	reply(c, v, e)
}

// @Summary 删除后台草稿内容；用户行为和业务流水不可删除
// @Tags GlobalDramas
// @Security ApiKeyAuth
// @Param resource path string true "资源键"
// @Param id path int true "记录ID"
// @Success 200 {object} response.Response
// @Router /dramas/records/{resource}/{id} [delete]
func (PlatformApi) Delete(c *gin.Context) {
	reply(c, nil, platform.Delete(actor(c), c.Param("resource"), id(c)))
}

// @Summary 执行审核、发布、批量集数、审批等状态操作
// @Tags GlobalDramas
// @Security ApiKeyAuth
// @Param resource path string true "资源键"
// @Param id path int true "记录ID"
// @Param body body req.Action true "操作与凭据"
// @Success 200 {object} response.Response
// @Router /dramas/actions/{resource}/{id} [post]
func (PlatformApi) Action(c *gin.Context) {
	var in req.Action
	if e := c.ShouldBindJSON(&in); e != nil {
		reply(c, nil, e)
		return
	}
	v, e := platform.Action(actor(c), c.Param("resource"), id(c), in)
	reply(c, v, e)
}

// @Summary 按剧与指定时间预览已激活策略的覆盖结果
// @Tags GlobalDramas
// @Security ApiKeyAuth
// @Param dramaId query int true "剧集ID"
// @Param at query string false "RFC3339时间"
// @Success 200 {object} response.Response
// @Router /dramas/preview [get]
func (PlatformApi) Preview(c *gin.Context) {
	n, _ := strconv.ParseUint(c.Query("dramaId"), 10, 32)
	at := time.Now()
	if c.Query("at") != "" {
		var e error
		at, e = time.Parse(time.RFC3339, c.Query("at"))
		if e != nil {
			reply(c, nil, e)
			return
		}
	}
	v, e := platform.Preview(actor(c), uint(n), at)
	reply(c, v, e)
}

// @Summary 管理员查看账号与角色
// @Tags GlobalDramas
// @Security ApiKeyAuth
// @Success 200 {object} response.Response
// @Router /dramas/accounts [get]
func (PlatformApi) Accounts(c *gin.Context) { v, e := platform.Accounts(actor(c)); reply(c, v, e) }

// @Summary 创建版权方 / 制片方或超级管理员后台账号
// @Tags GlobalDramas
// @Security ApiKeyAuth
// @Param body body req.Account true "账号信息"
// @Success 200 {object} response.Response
// @Router /dramas/accounts [post]
func (PlatformApi) CreateAccount(c *gin.Context) {
	var in req.Account
	if e := c.ShouldBindJSON(&in); e != nil {
		reply(c, nil, e)
		return
	}
	v, e := platform.CreateAccount(actor(c), in)
	reply(c, v, e)
}

// @Summary 原子导入CSV账单；平台及账单行编号重复时拒绝整个文件
// @Tags GlobalDramas
// @Security ApiKeyAuth
// @Accept multipart/form-data
// @Param file formData file true "CSV账单"
// @Success 200 {object} response.Response
// @Router /dramas/bills/import [post]
func (PlatformApi) Import(c *gin.Context) {
	c.Request.Body = maxBody(c)
	f, e := c.FormFile("file")
	if e != nil {
		reply(c, nil, e)
		return
	}
	r, e := f.Open()
	if e != nil {
		reply(c, nil, e)
		return
	}
	defer r.Close()
	v, e := platform.ImportBills(actor(c), r)
	reply(c, v, e)
}

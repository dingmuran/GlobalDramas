package initialize_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	base "github.com/dingmuran/GlobalDramasAdmin/server/initialize"
	"github.com/dingmuran/GlobalDramasAdmin/server/middleware"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system"
	"github.com/dingmuran/GlobalDramasAdmin/server/router"
	"github.com/dingmuran/GlobalDramasAdmin/server/utils"
	"github.com/gin-gonic/gin"
)

// Exercise the same HTTP methods and JSON payloads used by the migrated UI.
// All database changes, including operation logs and access links, roll back.
func TestSystemManagementHTTPWorkflow(t *testing.T) {
	if os.Getenv("GD_INTEGRATION") != "1" {
		t.Skip("requires PostgreSQL in Docker")
	}
	setup()
	db := base.Gorm()
	if db == nil {
		t.Fatal("database unavailable")
	}
	tx := db.Begin()
	defer tx.Rollback()
	previous := global.GVA_DB
	global.GVA_DB = tx
	defer func() { global.GVA_DB = previous }()
	var admin system.SysUser
	if err := tx.Where("authority_id=888 AND enable=1").First(&admin).Error; err != nil {
		t.Fatal(err)
	}
	token, _, err := utils.LoginToken(&admin)
	if err != nil {
		t.Fatal(err)
	}
	gin.SetMode(gin.TestMode)
	engine := gin.New()
	private := engine.Group("", middleware.JWTAuth(), middleware.CasbinHandler())
	public := engine.Group("")
	r := router.RouterGroupApp.System
	r.InitApiRouter(private, public)
	r.InitMenuRouter(private)
	r.InitSysDictionaryRouter(private)
	r.InitSysDictionaryDetailRouter(private)
	r.InitSysParamsRouter(private, public)
	r.InitSysVersionRouter(private)
	r.InitApiTokenRouter(private)
	call := func(method, path string, body any) json.RawMessage {
		b, err := json.Marshal(body)
		if err != nil {
			t.Fatal(err)
		}
		q := httptest.NewRequest(method, path, bytes.NewReader(b))
		q.Header.Set("Content-Type", "application/json")
		q.Header.Set("x-token", token)
		w := httptest.NewRecorder()
		engine.ServeHTTP(w, q)
		var out struct {
			Code int
			Data json.RawMessage
			Msg  string
		}
		if err := json.Unmarshal(w.Body.Bytes(), &out); err != nil {
			t.Fatalf("%s %s HTTP %d: %s", method, path, w.Code, w.Body.String())
		}
		if w.Code != 200 || out.Code != 0 {
			t.Fatalf("%s %s: HTTP %d code %d %s", method, path, w.Code, out.Code, out.Msg)
		}
		return out.Data
	}
	call("POST", "/sysDictionary/createSysDictionary", map[string]any{"name": "HTTP测试字典", "type": "http_test_dictionary", "status": true, "parentID": 0})
	var dictionary system.SysDictionary
	if err := tx.Where("type=?", "http_test_dictionary").First(&dictionary).Error; err != nil {
		t.Fatal(err)
	}
	call("PUT", "/sysDictionary/updateSysDictionary", map[string]any{"ID": dictionary.ID, "name": "HTTP测试字典已编辑", "type": dictionary.Type, "status": true, "parentID": 0})
	call("POST", "/sysDictionaryDetail/createSysDictionaryDetail", map[string]any{"label": "测试标签", "value": "test", "status": true, "sort": 0, "sysDictionaryID": dictionary.ID, "parentID": 0})
	var detail system.SysDictionaryDetail
	if err := tx.Where("sys_dictionary_id=?", dictionary.ID).First(&detail).Error; err != nil {
		t.Fatal(err)
	}
	call("PUT", "/sysDictionaryDetail/updateSysDictionaryDetail", map[string]any{"ID": detail.ID, "label": "编辑标签", "value": "test", "status": true, "sort": 1, "sysDictionaryID": dictionary.ID, "parentID": 0})
	exported := call("GET", fmt.Sprintf("/sysDictionary/exportSysDictionary?ID=%d", dictionary.ID), nil)
	var dictionaryJSON map[string]any
	if err := json.Unmarshal(exported, &dictionaryJSON); err != nil {
		t.Fatal(err)
	}
	dictionaryJSON["type"] = "http_test_dictionary_imported"
	importedJSON, _ := json.Marshal(dictionaryJSON)
	call("POST", "/sysDictionary/importSysDictionary", map[string]any{"json": string(importedJSON)})
	call("POST", "/sysParams/createSysParams", map[string]any{"name": "HTTP测试参数", "key": "http_test_param", "value": "test"})
	var param system.SysParams
	if err := tx.Where("key=?", "http_test_param").First(&param).Error; err != nil {
		t.Fatal(err)
	}
	call("PUT", "/sysParams/updateSysParams", map[string]any{"ID": param.ID, "name": param.Name, "key": param.Key, "value": "updated"})
	call("POST", "/api/createApi", map[string]any{"path": "/http-test-only", "method": "GET", "apiGroup": "测试", "description": "HTTP CRUD test"})
	var api system.SysApi
	if err := tx.Where("path=?", "/http-test-only").First(&api).Error; err != nil {
		t.Fatal(err)
	}
	call("POST", "/api/updateApi", map[string]any{"ID": api.ID, "path": api.Path, "method": "GET", "apiGroup": "测试", "description": "edited"})
	call("POST", "/menu/addBaseMenu", map[string]any{"name": "HTTPTestMenu", "path": "system/menus", "component": "pages/Menus", "parentId": 0, "meta": map[string]any{"title": "HTTP测试菜单"}})
	var menu system.SysBaseMenu
	if err := tx.Where("name=?", "HTTPTestMenu").First(&menu).Error; err != nil {
		t.Fatal(err)
	}
	menu.Title = "HTTP测试菜单已编辑"
	call("POST", "/menu/updateBaseMenu", menu)
	call("POST", "/sysVersion/exportVersion", map[string]any{"versionName": "HTTP测试版本", "versionCode": "http_test_version", "apiIds": []uint{api.ID}, "menuIds": []uint{menu.ID}, "dictIds": []uint{dictionary.ID}})
	var version system.SysVersion
	if err := tx.Where("version_code=?", "http_test_version").First(&version).Error; err != nil {
		t.Fatal(err)
	}
	if version.VersionData == nil {
		t.Fatal("missing exported version data")
	}
	var snapshot map[string]any
	if err := json.Unmarshal([]byte(*version.VersionData), &snapshot); err != nil {
		t.Fatal(err)
	}
	versionInfo := snapshot["version"].(map[string]any)
	versionInfo["code"] = "http_test_imported"
	call("POST", "/sysVersion/importVersion", snapshot)
	var imported system.SysVersion
	if err := tx.Where("version_code LIKE ?", "http_test_imported_imported_%").First(&imported).Error; err != nil {
		t.Fatal(err)
	}
	call("DELETE", fmt.Sprintf("/sysVersion/deleteSysVersion?ID=%d", imported.ID), nil)
	call("DELETE", fmt.Sprintf("/sysVersion/deleteSysVersion?ID=%d", version.ID), nil)
	call("POST", "/menu/deleteBaseMenu", map[string]any{"ID": menu.ID})
	call("POST", "/api/deleteApi", map[string]any{"ID": api.ID})
	call("DELETE", fmt.Sprintf("/sysParams/deleteSysParams?ID=%d", param.ID), nil)
	call("DELETE", "/sysDictionaryDetail/deleteSysDictionaryDetail", map[string]any{"ID": detail.ID})
	call("DELETE", "/sysDictionary/deleteSysDictionary", map[string]any{"ID": dictionary.ID})
}

package initialize_test

import (
	"encoding/json"
	"fmt"
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	base "github.com/dingmuran/GlobalDramasAdmin/server/initialize"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/router"
	"github.com/gin-gonic/gin"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"
)

func TestViewerPublicCatalogue(t *testing.T) {
	if os.Getenv("GD_INTEGRATION") != "1" {
		t.Skip("requires PostgreSQL")
	}
	setup()
	db := base.Gorm()
	if db == nil {
		t.Fatal("database unavailable")
	}
	tx := db.Begin()
	previous := global.GVA_DB
	global.GVA_DB = tx
	defer func() { tx.Rollback(); global.GVA_DB = previous }()
	start, end := time.Now().Add(-time.Hour), time.Now().Add(time.Hour)
	prefix := fmt.Sprintf("viewer_test_%d", time.Now().UnixNano())
	visible := model.Dramas{Base: model.Base{Status: "published"}, Title: prefix, LicenseStart: &start, LicenseEnd: &end, ReviewNote: "secret review", CopyrightProof: "secret proof", TotalEpisodes: 1}
	if err := tx.Create(&visible).Error; err != nil {
		t.Fatal(err)
	}
	hidden := visible
	hidden.ID = 0
	hidden.Status = "draft"
	if err := tx.Create(&hidden).Error; err != nil {
		t.Fatal(err)
	}
	expired := visible
	expired.ID = 0
	expired.LicenseEnd = &start
	if err := tx.Create(&expired).Error; err != nil {
		t.Fatal(err)
	}
	future := visible
	future.ID = 0
	future.LicenseStart = &end
	if err := tx.Create(&future).Error; err != nil {
		t.Fatal(err)
	}
	ep := model.Episodes{Base: model.Base{Status: "ready"}, DramaId: int64(visible.ID), Number: 1, Title: "episode", VideoUrl: "secret video"}
	if err := tx.Create(&ep).Error; err != nil {
		t.Fatal(err)
	}
	r := gin.New()
	router.RouterGroupApp.ViewerRouter.InitPublic(r.Group(""))
	get := func(path string) map[string]any {
		w := httptest.NewRecorder()
		r.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		if w.Code != 200 {
			t.Fatalf("%s: %d", path, w.Code)
		}
		for _, field := range []string{"ownerId", "userId", "reviewNote", "copyrightProof", "videoUrl", "secret"} {
			if strings.Contains(w.Body.String(), field) {
				t.Fatalf("private field exposed: %s", field)
			}
		}
		var out map[string]any
		if err := json.Unmarshal(w.Body.Bytes(), &out); err != nil {
			t.Fatal(err)
		}
		return out
	}
	list := get("/viewer/v1/dramas?search=" + prefix)
	data := list["data"].(map[string]any)
	if list["code"] != float64(0) || data["total"] != float64(1) || len(data["list"].([]any)) != 1 {
		t.Fatalf("visibility failed: %v", list)
	}
	for _, id := range []uint{hidden.ID, expired.ID, future.ID} {
		if get(fmt.Sprintf("/viewer/v1/dramas/%d", id))["code"] == float64(0) {
			t.Fatal("hidden drama accessible")
		}
		if get(fmt.Sprintf("/viewer/v1/dramas/%d/episodes", id))["code"] == float64(0) {
			t.Fatal("hidden episodes accessible")
		}
	}
	if get(fmt.Sprintf("/viewer/v1/dramas/%d", visible.ID))["code"] != float64(0) {
		t.Fatal("visible detail failed")
	}
	episodes := get(fmt.Sprintf("/viewer/v1/dramas/%d/episodes", visible.ID))
	if episodes["data"].(map[string]any)["total"] != float64(1) {
		t.Fatal("episodes missing")
	}
	for _, path := range []string{"/viewer/v1/dramas?pageSize=101", "/viewer/v1/dramas?page=-1", "/viewer/v1/dramas/abc"} {
		if get(path)["code"] == float64(0) {
			t.Fatal("invalid query accepted")
		}
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest("POST", "/viewer/v1/dramas", nil))
	if w.Code != 404 {
		t.Fatal("public write route exists")
	}
}

package service_test

import (
	"bytes"
	"encoding/json"
	"github.com/dingmuran/GlobalDramasAdmin/server/core"
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/initialize"
	"github.com/dingmuran/GlobalDramasAdmin/server/middleware"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system"
	dramaInit "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/initialize"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model"
	req "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model/request"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/router"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/service"
	systemService "github.com/dingmuran/GlobalDramasAdmin/server/service/system"
	"github.com/dingmuran/GlobalDramasAdmin/server/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"
)

func payload(v map[string]any) map[string]json.RawMessage {
	out := map[string]json.RawMessage{}
	for k, x := range v {
		b, _ := json.Marshal(x)
		out[k] = b
	}
	return out
}
func TestPlatformPostgreSQLWorkflow(t *testing.T) {
	if os.Getenv("GD_INTEGRATION") != "1" {
		t.Skip("set GD_INTEGRATION=1 inside Docker to run PostgreSQL integration")
	}
	global.GVA_VP = core.Viper()
	global.GVA_LOG = core.Zap()
	initialize.OtherInit()
	db := initialize.Gorm()
	if db == nil {
		t.Fatal("PostgreSQL not initialized")
	}
	tx := db.Begin()
	global.GVA_DB = tx
	defer func() { tx.Rollback(); global.GVA_DB = db }()
	s := service.PlatformService{}
	var admin system.SysUser
	if e := tx.Where("username = 'admin'").First(&admin).Error; e != nil {
		t.Fatal(e)
	}
	a := service.Actor{ID: admin.ID, Role: 888}
	createActor := func(name string, role uint) (service.Actor, system.SysUser) {
		v, e := s.CreateAccount(a, req.Account{Username: "it_" + name + time.Now().Format("150405.000000"), Password: "Integration@2026", Role: role})
		if e != nil {
			t.Fatal(e)
		}
		u := v.(system.SysUser)
		return service.Actor{ID: u.ID, Role: role}, u
	}
	creator, creatorUser := createActor("creator", 300)
	other, _ := createActor("other", 300)
	if _, e := s.CreateAccount(a, req.Account{Username: "viewer_rejected", Password: "Integration@2026", Role: 200}); e == nil {
		t.Fatal("backoffice created a viewer account")
	}
	// Future H5 identities are independent of backend account provisioning.
	vu := system.SysUser{UUID: uuid.New(), Username: "it_h5_" + time.Now().Format("150405.000000"), Password: utils.BcryptHash("Integration@2026"), NickName: "H5 transaction viewer", AuthorityId: 200, Enable: 1}
	if e := tx.Create(&vu).Error; e != nil {
		t.Fatal(e)
	}
	viewer := service.Actor{ID: vu.ID, Role: 200}
	for _, key := range []string{"history", "favorites", "orders", "ads"} {
		if _, err := s.Save(a, key, 0, payload(map[string]any{})); err == nil {
			t.Fatalf("admin wrote viewer activity: %s", key)
		}
	}
	if _, e := (&systemService.UserService{}).Login(&system.SysUser{Username: vu.Username, Password: "Integration@2026"}); e == nil {
		t.Fatal("H5 viewer logged into backoffice")
	}
	reviewer, _ := createActor("reviewer", 888)
	save := func(actor service.Actor, key string, id uint, m map[string]any) any {
		v, e := s.Save(actor, key, id, payload(m))
		if e != nil {
			t.Fatalf("save %s: %v", key, e)
		}
		return v
	}
	act := func(actor service.Actor, key string, id uint, in req.Action) {
		if _, e := s.Action(actor, key, id, in); e != nil {
			t.Fatalf("action %s/%s: %v", key, in.Action, e)
		}
	}
	d := save(creator, "dramas", 0, map[string]any{"title": "事务测试内容", "totalEpisodes": 2, "licenseStart": time.Now().Add(-time.Hour).Format(time.RFC3339), "licenseEnd": time.Now().Add(24 * time.Hour).Format(time.RFC3339), "copyrightProof": "https://example.invalid/proof"}).(*model.Dramas)
	act(creator, "dramas", d.ID, req.Action{Action: "batch", Count: 2, Start: 1})
	eps, e := s.List(creator, "episodes", req.Page{DramaID: d.ID})
	if e != nil {
		t.Fatal(e)
	}
	episodes := *eps["list"].(*[]model.Episodes)
	if len(episodes) != 2 {
		t.Fatal("batch episode mismatch")
	}
	ep := episodes[0]
	for _, x := range episodes {
		save(creator, "episodes", x.ID, map[string]any{"videoUrl": "https://example.invalid/video.mp4", "processingProgress": 100, "priceMinor": 199, "currency": "CNY"})
	}
	if _, e := s.Save(other, "dramas", d.ID, payload(map[string]any{"title": "越权"})); e == nil {
		t.Fatal("other creator modified content")
	}
	if _, e := s.Save(viewer, "dramas", 0, payload(map[string]any{"title": "越权", "totalEpisodes": 1})); e == nil {
		t.Fatal("viewer created content")
	}
	act(creator, "dramas", d.ID, req.Action{Action: "submit"})
	if _, e := s.Action(creator, "dramas", d.ID, req.Action{Action: "approve", Note: "越权"}); e == nil {
		t.Fatal("creator approved own content")
	}
	act(a, "dramas", d.ID, req.Action{Action: "approve", Note: "授权及内容通过"})
	act(creator, "dramas", d.ID, req.Action{Action: "publish"})
	if _, e := s.Save(creator, "episodes", ep.ID, payload(map[string]any{"videoUrl": "https://example.invalid/changed.mp4"})); e == nil {
		t.Fatal("published episode modified")
	}
	if e := s.Delete(creator, "episodes", ep.ID); e == nil {
		t.Fatal("published episode deleted")
	}
	play, e := s.Playback(viewer, ep.ID)
	if e != nil {
		t.Fatal(e)
	}
	pm := play.(map[string]any)
	if pm["allowed"].(bool) || pm["episode"].(model.Episodes).VideoUrl != "" {
		t.Fatal("paid URL leaked")
	}
	favorite := save(viewer, "favorites", 0, map[string]any{"dramaId": d.ID}).(*model.Favorites)
	save(viewer, "favorites", 0, map[string]any{"dramaId": d.ID})
	var nf int64
	tx.Model(&model.Favorites{}).Where("user_id = ?", viewer.ID).Count(&nf)
	if nf != 1 {
		t.Fatal("duplicate favorite")
	}
	if e := s.Delete(viewer, "favorites", favorite.ID); e != nil {
		t.Fatal(e)
	}
	if _, e := s.Save(viewer, "orders", 0, payload(map[string]any{"kind": "episode", "episodeId": ep.ID, "provider": "web", "amountMinor": 1})); e == nil {
		t.Fatal("price tampering permitted")
	}
	order := save(viewer, "orders", 0, map[string]any{"kind": "episode", "episodeId": ep.ID, "provider": "web"}).(*model.Orders)
	if order.AmountMinor != 199 {
		t.Fatalf("wrong server-derived price %d", order.AmountMinor)
	}
	act(a, "orders", order.ID, req.Action{Action: "request", Note: "核验支付流水", Evidence: "integration-payment"})
	var approval model.Approvals
	tx.Where("resource = 'orders' AND target_id = ?", order.ID).First(&approval)
	if _, e := s.Action(a, "approvals", approval.ID, req.Action{Action: "decide", Decision: true, Note: "自己审批"}); e == nil {
		t.Fatal("self approval permitted")
	}
	act(reviewer, "approvals", approval.ID, req.Action{Action: "decide", Decision: true, Note: "凭据核对通过"})
	if _, e := s.Action(reviewer, "approvals", approval.ID, req.Action{Action: "decide", Decision: true, Note: "重放"}); e == nil {
		t.Fatal("approval replay permitted")
	}
	play, e = s.Playback(viewer, ep.ID)
	if e != nil || !play.(map[string]any)["allowed"].(bool) {
		t.Fatalf("entitlement not granted: %v", e)
	}
	if e := s.Event(viewer, req.PlaybackEvent{EpisodeID: ep.ID, Event: "play", SessionID: "integration", WatchedSeconds: 12}); e != nil {
		t.Fatal(e)
	}
	if _, e := s.Overview(creator); e != nil {
		t.Fatal(e)
	}
	refund := save(viewer, "refunds", 0, map[string]any{"orderId": order.ID, "reason": "退款流程验证"}).(*model.Refunds)
	act(a, "refunds", refund.ID, req.Action{Action: "request", Note: "退款已在外部处理", Evidence: "integration-refund"})
	tx.Where("resource = 'refunds' AND target_id = ?", refund.ID).First(&model.Approvals{}) // Reload a different approval into a fresh value.
	var refundApproval model.Approvals
	if e := tx.Where("resource = 'refunds' AND target_id = ?", refund.ID).First(&refundApproval).Error; e != nil {
		t.Fatal(e)
	}
	act(reviewer, "approvals", refundApproval.ID, req.Action{Action: "decide", Decision: true, Note: "核验退款"})
	play, e = s.Playback(viewer, ep.ID)
	if e != nil || play.(map[string]any)["allowed"].(bool) {
		t.Fatal("refund failed to revoke entitlement")
	}
	policy := save(a, "policies", 0, map[string]any{"name": "免费测试策略", "dramaId": d.ID, "freeEpisodes": -1, "adsEnabled": true, "memberFree": true, "effectiveAt": time.Now().Add(-time.Minute).Format(time.RFC3339)}).(*model.Policies)
	act(a, "policies", policy.ID, req.Action{Action: "activate"})
	play, e = s.Playback(viewer, ep.ID)
	if e != nil || !play.(map[string]any)["allowed"].(bool) {
		t.Fatal("policy override not effective")
	}
	if _, e := s.Preview(a, d.ID, time.Now()); e != nil {
		t.Fatal(e)
	}
	// JWT + Casbin + HTTP API boundary, with the same transaction database.
	gin.SetMode(gin.TestMode)
	engine := gin.New()
	g := engine.Group("")
	g.Use(middleware.JWTAuth(), middleware.CasbinHandler())
	router.RouterGroupApp.PlatformRouter.Init(g)
	token, _, e := utils.LoginToken(&vu)
	if e != nil {
		t.Fatal(e)
	}
	httpCheck := func(method, path, body string, success bool) {
		q := httptest.NewRequest(method, path, bytes.NewBufferString(body))
		q.Header.Set("x-token", token)
		q.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		engine.ServeHTTP(w, q)
		var out struct {
			Code int
			Data json.RawMessage
			Msg  string
		}
		if e := json.Unmarshal(w.Body.Bytes(), &out); e != nil {
			t.Fatalf("HTTP: %s", w.Body.String())
		}
		if (out.Code == 0) != success {
			t.Fatalf("%s %s: code %d %s", method, path, out.Code, out.Msg)
		}
	}
	httpCheck(http.MethodGet, "/dramas/records/dramas", "", false)
	token, _, e = utils.LoginToken(&creatorUser)
	if e != nil {
		t.Fatal(e)
	}
	httpCheck(http.MethodGet, "/dramas/records/dramas", "", true)
	httpCheck(http.MethodGet, "/dramas/accounts", "", false)
	tx.Model(&system.SysUser{}).Where("id=?", creator.ID).Update("enable", 2)
	httpCheck(http.MethodGet, "/dramas/records/orders", "", false)
	tx.Model(&system.SysUser{}).Where("id=?", creator.ID).Update("enable", 1)
	token, _, e = utils.LoginToken(&vu)
	if e != nil {
		t.Fatal(e)
	}
	httpCheck(http.MethodPost, "/dramas/records/dramas", `{"title":"越权","totalEpisodes":1}`, false)
	// Router rejects old viewer JWTs even if upstream Casbin rules were stale.
	isolated := gin.New()
	router.RouterGroupApp.PlatformRouter.Init(isolated.Group("", middleware.JWTAuth()))
	oldEngine := engine
	engine = isolated
	httpCheck(http.MethodGet, "/dramas/schema", "", false)
	engine = oldEngine
	token, _, e = utils.LoginToken(&admin)
	if e != nil {
		t.Fatal(e)
	}
	httpCheck(http.MethodGet, "/dramas/accounts", "", true)
	csv := "externalId,platform,dramaId,period,currency,grossMinor,feeMinor\nit-01,web," + strings.TrimSpace(jsonNumber(d.ID)) + ",2026-10,CNY,1000,100\n"
	if _, e := s.ImportBills(a, strings.NewReader(csv)); e != nil {
		t.Fatal(e)
	}
	if _, e := s.ImportBills(a, strings.NewReader(csv)); e == nil {
		t.Fatal("duplicate import accepted")
	}
	// Membership first purchase and renewal retain independent fulfillment references.
	plan := save(a, "plans", 0, map[string]any{"name": "事务测试会员", "platform": "web", "platformProductId": "it_plan", "benefits": "会员免费观看", "priceMinor": 999, "currency": "CNY", "durationDays": 30}).(*model.Plans)
	act(a, "plans", plan.ID, req.Action{Action: "activate"})
	for i, kind := range []string{"membership", "renewal"} {
		o := save(viewer, "orders", 0, map[string]any{"kind": kind, "planId": plan.ID, "provider": "web"}).(*model.Orders)
		act(a, "orders", o.ID, req.Action{Action: "request", Note: "人工核对会员流水", Evidence: jsonNumber(uint(i+1)) + "-member"})
		var p model.Approvals
		tx.Where("resource='orders' AND target_id=?", o.ID).First(&p)
		act(reviewer, "approvals", p.ID, req.Action{Action: "decide", Decision: true, Note: "凭据核验通过"})
	}
	var subscriptions []model.Subscriptions
	tx.Where("user_id=?", viewer.ID).Order("id").Find(&subscriptions)
	if len(subscriptions) != 2 || !subscriptions[1].StartsAt.Equal(*subscriptions[0].ExpiresAt) {
		t.Fatal("renewal continuity incorrect")
	}
	ad := save(viewer, "ads", 0, map[string]any{"episodeId": ep.ID, "network": "it", "placement": "unlock"}).(*model.Ads)
	act(a, "ads", ad.ID, req.Action{Action: "request", Note: "核验广告完成回执", Evidence: "it-ad-verified"})
	var adApproval model.Approvals
	tx.Where("resource='ads' AND target_id=?", ad.ID).First(&adApproval)
	act(reviewer, "approvals", adApproval.ID, req.Action{Action: "decide", Decision: true, Note: "广告回执验证通过"})
	var rewards int64
	tx.Model(&model.Entitlements{}).Where("source='ad' AND reference=?", jsonNumber(ad.ID)).Count(&rewards)
	if rewards != 1 {
		t.Fatal("advertisement reward incorrect")
	}
	organization := save(a, "organizations", 0, map[string]any{"accountId": creator.ID, "name": "事务测试机构", "kind": "producer", "contact": "事务测试"}).(*model.Organizations)
	if organization.OwnerID != creator.ID {
		t.Fatal("organization ownership incorrect")
	}
	var bill model.Bills
	tx.Where("external_id='it-01'").First(&bill)
	act(a, "bills", bill.ID, req.Action{Action: "reconcile", Note: "差异核对完成"})
	settlement := save(a, "settlements", 0, map[string]any{"organizationId": organization.ID, "period": "2026-10", "currency": "CNY", "amountMinor": 900}).(*model.Settlements)
	act(a, "settlements", settlement.ID, req.Action{Action: "request", Note: "银行到账流水确认", Evidence: "it-bank-received"})
	var settleApproval model.Approvals
	tx.Where("resource='settlements' AND target_id=?", settlement.ID).First(&settleApproval)
	act(reviewer, "approvals", settleApproval.ID, req.Action{Action: "decide", Decision: true, Note: "同币种收入与银行流水匹配"})
	var settled model.Settlements
	tx.First(&settled, settlement.ID)
	if settled.Status != "received" || settled.OwnerID != creator.ID {
		t.Fatal("settlement not received or incorrectly scoped")
	}
	if _, e := s.Save(viewer, "favorites", 0, payload(map[string]any{"dramaId": 0})); e == nil {
		t.Fatal("required reference accepted zero")
	}
	// The DB guard catches invalid direct writes independently of the API.
	tx.SavePoint("invalid_ref")
	if e := tx.Create(&model.Favorites{Base: model.Base{OwnerID: viewer.ID, UserID: viewer.ID, Status: "recorded"}, DramaId: 99999999}).Error; e == nil {
		t.Fatal("database reference guard accepted missing drama")
	}
	tx.RollbackTo("invalid_ref")
	if e := tx.Model(&model.Dramas{}).Where("id=?", d.ID).Update("license_end", time.Now().Add(-time.Second)).Error; e != nil {
		t.Fatal(e)
	}
	if e := s.Monitor(); e != nil {
		t.Fatal(e)
	}
	var expired model.Dramas
	tx.First(&expired, d.ID)
	if expired.Status != "offline" {
		t.Fatal("expired content remained published")
	}
	if _, e := s.Playback(viewer, ep.ID); e == nil {
		t.Fatal("expired license allowed playback")
	}

	t.Log("PASS: content workflow, actor isolation, paid URL protection, price integrity, dual approval, idempotency, fulfillment, refund revocation, timed policy, telemetry, JWT/Casbin HTTP, CSV import, membership renewal, verified ad reward, settlement, database references and automatic license expiry; all records rolled back")
	legacyRole := system.SysAuthority{AuthorityId: 200, AuthorityName: "观众", DefaultRouter: "GDDiscover"}
	if e := tx.Where("authority_id = ?", 200).FirstOrCreate(&legacyRole).Error; e != nil {
		t.Fatal(e)
	}
	legacyMenu := system.SysBaseMenu{Name: "GDDiscover", Path: "GDDiscover", Component: "plugin/dramas/view/workspace.vue"}
	if e := tx.Where("name = ?", legacyMenu.Name).FirstOrCreate(&legacyMenu).Error; e != nil {
		t.Fatal(e)
	}
	if e := tx.Model(&legacyRole).Association("SysBaseMenus").Append(&legacyMenu); e != nil {
		t.Fatal(e)
	}
	if e := tx.Model(&vu).Association("Authorities").Append(&legacyRole); e != nil {
		t.Fatal(e)
	}
	if e := tx.Exec("INSERT INTO casbin_rule (ptype,v0,v1,v2) VALUES ('p','200','/dramas/schema','GET') ON CONFLICT DO NOTHING").Error; e != nil {
		t.Fatal(e)
	}
	var ordersBefore int64
	tx.Model(&model.Orders{}).Count(&ordersBefore)
	for i := 0; i < 2; i++ {
		if e := dramaInit.RetireViewerBackend(tx); e != nil {
			t.Fatal(e)
		}
	}
	for _, query := range []string{
		"SELECT count(*) FROM sys_authorities WHERE authority_id=200",
		"SELECT count(*) FROM sys_base_menus WHERE name='GDDiscover'",
		"SELECT count(*) FROM sys_user_authority WHERE sys_authority_authority_id=200",
		"SELECT count(*) FROM casbin_rule WHERE v0='200'",
	} {
		var n int64
		if e := tx.Raw(query).Scan(&n).Error; e != nil || n != 0 {
			t.Fatalf("viewer backend migration: count=%d err=%v", n, e)
		}
	}
	var ordersAfter, usersAfter int64
	tx.Model(&model.Orders{}).Count(&ordersAfter)
	tx.Model(&system.SysUser{}).Where("id=?", viewer.ID).Count(&usersAfter)
	if ordersBefore != ordersAfter || usersAfter != 1 {
		t.Fatal("retiring viewer backend deleted H5 business data")
	}

}
func jsonNumber(n uint) string { b, _ := json.Marshal(n); return string(b) }

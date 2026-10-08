package service

import (
	"encoding/csv"
	"encoding/json"
	"errors"
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model"
	req "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model/request"
	"github.com/dingmuran/GlobalDramasAdmin/server/utils"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"io"
	"strconv"
	"strings"
)

func (s PlatformService) Accounts(a Actor) (any, error) {
	if a.Role != 888 {
		return nil, errors.New("无账号管理权限")
	}
	var list []system.SysUser
	e := global.GVA_DB.Preload("Authority").Order("id DESC").Limit(500).Find(&list).Error
	return list, e
}
func (s PlatformService) CreateAccount(a Actor, in req.Account) (any, error) {
	if a.Role != 888 {
		return nil, errors.New("仅管理员可创建账号")
	}
	if len(in.Username) < 3 || len(in.Username) > 60 || strings.ContainsAny(in.Username, " \t\r\n") {
		return nil, errors.New("用户名需为3至60个字符且不含空白")
	}
	if len(in.Password) < 12 || len(in.Password) > 72 {
		return nil, errors.New("密码须为12至72字节")
	}
	if in.Role != 200 && in.Role != 300 && in.Role != 888 {
		return nil, errors.New("角色无效")
	}
	if in.NickName == "" {
		in.NickName = in.Username
	}
	u := system.SysUser{UUID: uuid.New(), Username: in.Username, Password: utils.BcryptHash(in.Password), NickName: in.NickName, AuthorityId: in.Role, Enable: 1, HeaderImg: "/global-dramas.svg"}
	e := global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		var n int64
		if e := tx.Model(&system.SysUser{}).Where("username = ?", in.Username).Count(&n).Error; e != nil {
			return e
		}
		if n > 0 {
			return errors.New("用户名已存在")
		}
		var role system.SysAuthority
		if e := tx.First(&role, "authority_id = ?", in.Role).Error; e != nil {
			return e
		}
		u.Authorities = []system.SysAuthority{role}
		if e := tx.Create(&u).Error; e != nil {
			return e
		}
		return audit(tx, a, "accounts", u.ID, "create", map[string]any{"username": in.Username, "role": in.Role})
	})
	return u, e
}
func (s PlatformService) ImportBills(a Actor, reader io.Reader) (any, error) {
	if a.Role != 888 {
		return nil, errors.New("仅管理员可导入财务账单")
	}
	r := csv.NewReader(io.LimitReader(reader, 2<<20))
	head, e := r.Read()
	if e != nil {
		return nil, errors.New("CSV缺少表头")
	}
	expected := []string{"externalId", "platform", "dramaId", "period", "currency", "grossMinor", "feeMinor"}
	if len(head) != len(expected) {
		return nil, errors.New("CSV表头应为 externalId,platform,dramaId,period,currency,grossMinor,feeMinor")
	}
	for i, h := range head {
		if strings.TrimPrefix(h, "\ufeff") != expected[i] {
			return nil, errors.New("CSV表头或顺序无效")
		}
	}
	rows := []model.Bills{}
	seen := map[string]bool{}
	for {
		line, e := r.Read()
		if e == io.EOF {
			break
		}
		if e != nil {
			return nil, e
		}
		if len(rows) >= 2000 {
			return nil, errors.New("单次最多导入2000行")
		}
		gross, e := strconv.ParseInt(line[5], 10, 64)
		if e != nil || gross < 0 || gross > 9007199254740991 {
			return nil, errors.New("收入须为非负整数")
		}
		fee, e := strconv.ParseInt(line[6], 10, 64)
		if e != nil || fee < 0 || fee > 9007199254740991 {
			return nil, errors.New("费用须为非负整数")
		}
		drama, e := strconv.ParseInt(line[2], 10, 64)
		if e != nil || drama < 0 {
			return nil, errors.New("剧集ID无效")
		}
		currency := line[4]
		if currency != "CNY" && currency != "USD" && currency != "EUR" && currency != "JPY" && currency != "GBP" {
			return nil, errors.New("币种无效")
		}
		if line[0] == "" || line[1] == "" || line[3] == "" {
			return nil, errors.New("账单编号、平台和账期必填")
		}
		unique := line[1] + ":" + line[0]
		if seen[unique] {
			return nil, errors.New("文件内账单行编号重复")
		}
		seen[unique] = true
		rows = append(rows, model.Bills{Base: model.Base{OwnerID: a.ID, UserID: a.ID, Status: "draft"}, ExternalId: line[0], Platform: line[1], DramaId: drama, Period: line[3], Currency: currency, GrossMinor: gross, FeeMinor: fee, NetMinor: gross - fee, Source: "csv"})
	}
	e = global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		for i := range rows {
			b := &rows[i]
			if b.DramaId > 0 {
				d := model.Dramas{}
				if e := tx.First(&d, b.DramaId).Error; e != nil {
					return errors.New("账单关联剧集不存在")
				}
				b.OwnerID = d.OwnerID
			}
			var n int64
			if e := tx.Model(&model.Bills{}).Where("platform = ? AND external_id = ?", b.Platform, b.ExternalId).Count(&n).Error; e != nil {
				return e
			}
			if n > 0 {
				return errors.New("账单已经导入，本次未写入任何行")
			}
			if e := tx.Create(b).Error; e != nil {
				return e
			}
		}
		return audit(tx, a, "bills", 0, "csv_import", map[string]any{"rows": len(rows)})
	})
	return map[string]any{"imported": len(rows)}, e
}
func raw(v any) json.RawMessage { b, _ := json.Marshal(v); return b }

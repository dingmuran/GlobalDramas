package service

import (
	"errors"
	"fmt"
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model"
	req "github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model/request"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"time"
)

func (s PlatformService) Action(a Actor, key string, id uint, in req.Action) (any, error) {
	r, e := resource(key, a, false)
	if e != nil {
		return nil, e
	}
	var result any
	e = global.GVA_DB.Transaction(func(tx *gorm.DB) error {
		row := r.New()
		if e := scoped(tx, r, a).Clauses(clause.Locking{Strength: "UPDATE"}).First(row, id).Error; e != nil {
			return errors.New("记录不存在或无权操作")
		}
		base := asMap(row)
		status := base["status"].(string)
		updates := map[string]any{"updated_at": time.Now()}
		if key == "approvals" && in.Action == "decide" {
			if a.Role != 888 {
				return errors.New("需要超级管理员")
			}
			v := row.(*model.Approvals)
			if status != "pending" {
				return errors.New("审批已处理")
			}
			if v.UserID == a.ID {
				return errors.New("申请人与审批人不能为同一账号")
			}
			if in.Note == "" {
				return errors.New("请填写审批意见")
			}
			updates["status"] = "rejected"
			if in.Decision {
				if err := s.executeApproval(tx, a, v); err != nil {
					return err
				}
				updates["status"] = "approved"
			}
			updates["reviewer_id"] = a.ID
			updates["decision_note"] = in.Note
		} else if in.Action == "request" {
			if a.Role != 888 {
				return errors.New("敏感操作需要管理员提交审批")
			}
			if in.Note == "" || in.Evidence == "" {
				return errors.New("请提供申请说明及外部流水或凭据")
			}
			allowed := key == "refunds" && status == "pending" || key == "compensations" && status == "draft" || key == "settlements" && status == "draft" || key == "orders" && status == "pending" || key == "ads" && status == "attempted"
			if !allowed {
				return errors.New("当前状态不能申请该操作")
			}
			var count int64
			if err := tx.Model(&model.Approvals{}).Where("resource = ? AND target_id = ? AND status = 'pending'", key, id).Count(&count).Error; err != nil {
				return err
			}
			if count > 0 {
				return errors.New("该记录已有待处理审批")
			}
			appr := model.Approvals{Base: model.Base{OwnerID: a.ID, UserID: a.ID, Status: "pending"}, Resource: key, TargetId: int64(id), Action: "confirm", Reason: in.Note, Evidence: in.Evidence}
			if e := tx.Create(&appr).Error; e != nil {
				return e
			}
			return audit(tx, a, key, id, "request", in)
		} else {
			switch key {
			case "dramas":
				if a.Role != 888 && a.Role != 300 {
					return errors.New("无内容管理权限")
				}
				d := row.(*model.Dramas)
				switch in.Action {
				case "submit":
					if status != "draft" && status != "rejected" && status != "offline" {
						return errors.New("当前状态不可提交")
					}
					if d.LicenseStart == nil || d.LicenseEnd == nil || !d.LicenseEnd.After(*d.LicenseStart) || d.CopyrightProof == "" {
						return errors.New("请补充有效授权期限和版权证明")
					}
					updates["status"] = "pending_review"
				case "approve", "reject":
					if a.Role != 888 || status != "pending_review" {
						return errors.New("仅管理员可审核待审核内容")
					}
					if in.Note == "" {
						return errors.New("请填写审核意见")
					}
					decision := "rejected"
					if in.Action == "approve" {
						decision = "approved"
					}
					updates["status"] = decision
					updates["review_note"] = in.Note
					if e := tx.Create(&model.Reviews{Base: model.Base{OwnerID: d.OwnerID, UserID: a.ID, Status: "recorded"}, DramaId: int64(id), Decision: decision, Note: in.Note, ReviewerId: int64(a.ID)}).Error; e != nil {
						return e
					}
				case "publish":
					if status != "approved" {
						return errors.New("审核通过后方可发布")
					}
					now := time.Now()
					if d.LicenseStart == nil || d.LicenseEnd == nil || d.LicenseStart.After(now) || !d.LicenseEnd.After(now) {
						return errors.New("当前不在授权期限内")
					}
					var count int64
					if e := tx.Model(&model.Episodes{}).Where("drama_id = ? AND video_url <> '' AND processing_progress = 100", id).Count(&count).Error; e != nil {
						return e
					}
					if count != d.TotalEpisodes {
						return errors.New("单集数量和处理完成数量必须与计划集数一致")
					}
					updates["status"] = "published"
				case "offline":
					if status != "published" {
						return errors.New("当前未发布")
					}
					updates["status"] = "offline"
				case "batch":
					if status != "draft" && status != "rejected" && status != "offline" {
						return errors.New("请先转为可编辑状态")
					}
					if in.Count < 1 || in.Count > 200 || in.Start < 1 || int64(in.Start+in.Count-1) > d.TotalEpisodes {
						return errors.New("批量集数范围无效（最多200集）")
					}
					for n := in.Start; n < in.Start+in.Count; n++ {
						ep := model.Episodes{Base: model.Base{OwnerID: d.OwnerID, UserID: a.ID, Status: "draft"}, DramaId: int64(id), Number: int64(n), Title: fmt.Sprintf("第%d集", n), Currency: "CNY"}
						if e := tx.Where("drama_id = ? AND number = ?", id, n).FirstOrCreate(&ep).Error; e != nil {
							return e
						}
					}
				case "version":
					if in.Note == "" {
						return errors.New("请填写版本说明")
					}
					v := model.Versions{Base: model.Base{OwnerID: d.OwnerID, UserID: a.ID, Status: "recorded"}, DramaId: int64(id), Version: time.Now().Format("20060102-150405.000000000"), ChangeNote: in.Note, Snapshot: mustJSON(d)}
					if e := tx.Create(&v).Error; e != nil {
						return e
					}
				default:
					return errors.New("内容操作无效")
				}
			case "plans", "policies":
				if a.Role != 888 {
					return errors.New("无平台配置权限")
				}
				if in.Action == "activate" {
					updates["status"] = "active"
				} else if in.Action == "disable" {
					updates["status"] = "inactive"
				} else {
					return errors.New("配置操作无效")
				}
			case "feedback":
				if a.Role != 888 || in.Action != "resolve" || in.Note == "" {
					return errors.New("管理员填写回复后可处理反馈")
				}
				updates["status"] = "resolved"
				updates["reply"] = in.Note
			case "alerts":
				if a.Role != 888 || in.Action != "resolve" || in.Note == "" {
					return errors.New("请填写告警恢复说明")
				}
				updates["status"] = "resolved"
				updates["recovery_note"] = in.Note
				updates["resolved_at"] = time.Now()
				if e := tx.Create(&model.Restores{Base: model.Base{OwnerID: a.ID, UserID: a.ID, Status: "recorded"}, AlertId: int64(id), Operation: "resolve", Result: in.Note, Evidence: in.Evidence}).Error; e != nil {
					return e
				}
			case "bills":
				if a.Role != 888 || in.Action != "reconcile" || in.Note == "" {
					return errors.New("请填写对账处理说明")
				}
				updates["status"] = "reconciled"
				updates["resolution"] = in.Note
			case "ads":
				if in.Action != "fail" || status != "attempted" {
					return errors.New("当前广告尝试不可标记失败")
				}
				updates["status"] = "failed"
				updates["failure_category"] = "provider_error"
			default:
				return errors.New("该资源不支持此操作")
			}
		}
		if e := tx.Model(r.New()).Where("id = ?", id).Updates(updates).Error; e != nil {
			return e
		}
		result = r.New()
		if e := tx.First(result, id).Error; e != nil {
			return e
		}
		return audit(tx, a, key, id, in.Action, in)
	})
	return result, e
}
func (s PlatformService) executeApproval(tx *gorm.DB, a Actor, p *model.Approvals) error {
	r, ok := model.Resources[p.Resource]
	if !ok {
		return errors.New("审批资源无效")
	}
	row := r.New()
	if e := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(row, p.TargetId).Error; e != nil {
		return e
	}
	switch p.Resource {
	case "orders":
		o := row.(*model.Orders)
		if o.Status != "pending" {
			return errors.New("订单已经处理")
		}
		if e := s.fulfill(tx, o); e != nil {
			return e
		}
		if e := tx.Model(o).Updates(map[string]any{"status": "paid", "provider_reference": p.Evidence, "fulfillment": "fulfilled"}).Error; e != nil {
			return e
		}
		if e := tx.Create(&model.Wallet{Base: model.Base{OwnerID: o.OwnerID, UserID: o.UserID, Status: "recorded"}, AmountMinor: o.AmountMinor, Currency: o.Currency, Direction: "expense", Reference: fmt.Sprint(o.ID), Description: "订单支付"}).Error; e != nil {
			return e
		}
	case "refunds":
		r := row.(*model.Refunds)
		if r.Status != "pending" {
			return errors.New("退款已处理")
		}
		o := model.Orders{}
		if e := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&o, r.OrderId).Error; e != nil {
			return e
		}
		if o.Status != "paid" {
			return errors.New("订单未支付或已退款")
		}
		if e := tx.Model(&o).Updates(map[string]any{"status": "refunded", "fulfillment": "revoked"}).Error; e != nil {
			return e
		}
		if e := tx.Where("user_id = ? AND source = 'order' AND reference = ?", o.UserID, fmt.Sprint(o.ID)).Delete(&model.Entitlements{}).Error; e != nil {
			return e
		}
		if o.Kind != "episode" {
			if e := tx.Model(&model.Subscriptions{}).Where("provider_subscription_id = ?", fmt.Sprint(o.ID)).Update("status", "revoked").Error; e != nil {
				return e
			}
		}
		if e := tx.Model(r).Updates(map[string]any{"status": "refunded", "provider_reference": p.Evidence}).Error; e != nil {
			return e
		}
		if e := tx.Create(&model.Wallet{Base: model.Base{OwnerID: o.OwnerID, UserID: o.UserID, Status: "recorded"}, AmountMinor: r.AmountMinor, Currency: o.Currency, Direction: "income", Reference: fmt.Sprint(r.ID), Description: "订单退款"}).Error; e != nil {
			return e
		}
	case "ads":
		v := row.(*model.Ads)
		if v.Status != "attempted" {
			return errors.New("广告已处理")
		}
		if e := grant(tx, v.OwnerID, v.UserID, v.EpisodeId, "ad", fmt.Sprint(v.ID)); e != nil {
			return e
		}
		if e := tx.Model(v).Updates(map[string]any{"status": "rewarded", "provider_reference": p.Evidence, "completed_at": time.Now()}).Error; e != nil {
			return e
		}
	case "compensations":
		v := row.(*model.Compensations)
		if v.Status != "draft" {
			return errors.New("补偿已处理")
		}
		if e := grant(tx, v.OwnerID, uint(v.TargetUserId), v.EpisodeId, "compensation", fmt.Sprint(v.ID)); e != nil {
			return e
		}
		if e := tx.Model(v).Update("status", "granted").Error; e != nil {
			return e
		}
	case "settlements":
		v := row.(*model.Settlements)
		if err := tx.Exec("SELECT pg_advisory_xact_lock(?)", int64(v.OwnerID)).Error; err != nil {
			return err
		}
		if v.Status != "draft" {
			return errors.New("结算已处理")
		}
		var total int64
		if e := tx.Model(&model.Bills{}).Select("COALESCE(SUM(net_minor),0)").Where("owner_id = ? AND period = ? AND currency = ? AND status = 'reconciled'", v.OwnerID, v.Period, v.Currency).Scan(&total).Error; e != nil {
			return e
		}
		var paid int64
		if e := tx.Model(&model.Settlements{}).Select("COALESCE(SUM(amount_minor),0)").Where("owner_id = ? AND period = ? AND currency = ? AND status = 'received'", v.OwnerID, v.Period, v.Currency).Scan(&paid).Error; e != nil {
			return e
		}
		if v.AmountMinor <= 0 || v.AmountMinor > total-paid {
			return errors.New("结算金额超过同币种、同账期可结算净收入")
		}
		if e := tx.Model(v).Updates(map[string]any{"status": "received", "bank_reference": p.Evidence, "received_at": time.Now()}).Error; e != nil {
			return e
		}
	default:
		return errors.New("不支持的审批操作")
	}
	return audit(tx, a, p.Resource, uint(p.TargetId), "approved_execution", map[string]any{"approvalId": p.ID, "evidence": p.Evidence})
}
func grant(tx *gorm.DB, owner, user uint, episode int64, source, reference string) error {
	v := model.Entitlements{Base: model.Base{OwnerID: owner, UserID: user, Status: "active"}, EpisodeId: episode, Source: source, Reference: reference}
	return tx.Where("user_id = ? AND episode_id = ? AND source = ? AND reference = ?", user, episode, source, reference).FirstOrCreate(&v).Error
}
func (s PlatformService) fulfill(tx *gorm.DB, o *model.Orders) error {
	if o.Kind == "episode" {
		return grant(tx, o.OwnerID, o.UserID, o.EpisodeId, "order", fmt.Sprint(o.ID))
	}
	plan := model.Plans{}
	if e := tx.First(&plan, o.PlanId).Error; e != nil {
		return e
	}
	start := time.Now()
	if o.Kind == "renewal" {
		var prev model.Subscriptions
		if tx.Where("user_id = ? AND plan_id = ? AND status = 'active' AND expires_at > ?", o.UserID, plan.ID, start).Order("expires_at DESC").First(&prev).Error == nil && prev.ExpiresAt != nil {
			start = *prev.ExpiresAt
		}
	}
	end := start.AddDate(0, 0, int(plan.DurationDays))
	return tx.Create(&model.Subscriptions{Base: model.Base{OwnerID: o.OwnerID, UserID: o.UserID, Status: "active"}, PlanId: int64(plan.ID), Platform: o.Provider, ProviderSubscriptionId: fmt.Sprint(o.ID), StartsAt: &start, ExpiresAt: &end, SyncResult: "人工核对凭据并通过双人审批；尚未接入平台实时同步"}).Error
}

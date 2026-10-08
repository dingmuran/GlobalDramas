package initialize

import (
	"fmt"
	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	"github.com/dingmuran/GlobalDramasAdmin/server/plugin/dramas/model"
	"strings"
)

// PostgreSQL guards validate references even when data is imported outside the API.
// Optional references use 0; non-zero references must point to a persisted row.
func referenceGuards() error {
	db := global.GVA_DB
	if e := db.Exec(`CREATE OR REPLACE FUNCTION gd_reference_guard() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
 DECLARE n bigint; present boolean; i integer;
 BEGIN
 FOR i IN 0..TG_NARGS-1 BY 2 LOOP
 n := (to_jsonb(NEW)->>TG_ARGV[i])::bigint;
 IF n IS NOT NULL AND n <> 0 THEN
 EXECUTE format('SELECT true FROM public.%I WHERE id = $1 FOR KEY SHARE',TG_ARGV[i+1]) INTO present USING n;
 IF present IS DISTINCT FROM TRUE THEN RAISE EXCEPTION '关联记录不存在: %',TG_ARGV[i] USING ERRCODE='23503'; END IF;
 END IF;
 END LOOP;
 RETURN NEW;
 END $$`).Error; e != nil {
		return e
	}
	if e := db.Exec(`CREATE OR REPLACE FUNCTION gd_delete_guard() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
 DECLARE present boolean; i integer;
 BEGIN
 IF TG_NARGS>0 THEN
 FOR i IN 0..TG_NARGS-1 BY 2 LOOP
 EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE %I = $1)',TG_ARGV[i],TG_ARGV[i+1]) INTO present USING OLD.id;
 IF present THEN RAISE EXCEPTION '记录仍被业务数据引用，不可删除' USING ERRCODE='23503'; END IF;
 END LOOP;
 END IF;
 RETURN OLD;
 END $$`).Error; e != nil {
		return e
	}
	reverse := map[string][]string{}
	for key, r := range model.Resources {
		args := []string{"'owner_id'", "'sys_users'", "'user_id'", "'sys_users'"}
		for _, f := range r.Fields {
			target := ""
			if f.Ref != "" {
				target = "gd_" + f.Ref
			}
			if f.Key == "accountId" || f.Key == "targetUserId" || f.Key == "reviewerId" {
				target = "sys_users"
			}
			if target != "" {
				args = append(args, "'"+f.Column+"'", "'"+target+"'")
				if strings.HasPrefix(target, "gd_") {
					reverse[target] = append(reverse[target], "'gd_"+key+"'", "'"+f.Column+"'")
				}
			}
		}
		table := "gd_" + key
		if e := db.Exec("DROP TRIGGER IF EXISTS gd_references ON " + table).Error; e != nil {
			return e
		}
		if e := db.Exec(fmt.Sprintf("CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON %s DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION gd_reference_guard(%s)", table, strings.Join(args, ","))).Error; e != nil {
			return e
		}
	}
	for table, args := range reverse {
		if e := db.Exec("DROP TRIGGER IF EXISTS gd_referenced_delete ON " + table).Error; e != nil {
			return e
		}
		if e := db.Exec(fmt.Sprintf("CREATE TRIGGER gd_referenced_delete BEFORE DELETE ON %s FOR EACH ROW EXECUTE FUNCTION gd_delete_guard(%s)", table, strings.Join(args, ","))).Error; e != nil {
			return e
		}
	}
	return nil
}

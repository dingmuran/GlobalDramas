package system

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/dingmuran/GlobalDramasAdmin/server/global"
	model "github.com/dingmuran/GlobalDramasAdmin/server/model/system"
	"github.com/dingmuran/GlobalDramasAdmin/server/model/system/request"
)

func TestSkillsReadsDoNotRecreateDeletedToolDirectories(t *testing.T) {
	root := t.TempDir()
	previous := global.GVA_CONFIG.AutoCode.Root
	global.GVA_CONFIG.AutoCode.Root = root
	defer func() { global.GVA_CONFIG.AutoCode.Root = previous }()
	s := SkillsService{}
	ctx := context.Background()
	tools, err := s.Tools(ctx)
	if err != nil || len(tools) != 5 {
		t.Fatalf("tools: %v %v", tools, err)
	}
	for _, tool := range tools {
		list, err := s.List(ctx, tool.Key)
		if err != nil || len(list) != 0 {
			t.Fatalf("empty list: %v %v", list, err)
		}
		if _, exists, err := s.GetGlobalConstraint(ctx, tool.Key); err != nil || exists {
			t.Fatalf("constraint: %v %v", exists, err)
		}
	}
	entries, err := os.ReadDir(root)
	if err != nil || len(entries) != 0 {
		t.Fatalf("reads created directories: %v %v", entries, err)
	}
	// Explicitly saving a skill still creates the requested tool directory.
	if err := s.Save(ctx, request.SkillSaveRequest{Tool: "codex", Skill: "test-skill", Meta: model.SkillMeta{Name: "test-skill"}, Markdown: "# Test"}); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, ".codex", "skills", "test-skill", "SKILL.md")); err != nil {
		t.Fatal(err)
	}
	list, err := s.List(ctx, "codex")
	if err != nil || len(list) != 1 || list[0] != "test-skill" {
		t.Fatalf("saved skill: %v %v", list, err)
	}
}

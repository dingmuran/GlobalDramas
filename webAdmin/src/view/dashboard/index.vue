<template>
  <div class="h-full gva-container2 overflow-auto bg-slate-50/60 dark:bg-slate-900">
    <div class="space-y-4 p-4 lg:p-6">
      <section
        class="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white px-5 py-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        
        <div class="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs tracking-[0.2em] text-slate-500 dark:text-slate-400">DASHBOARD</p>
            <h1 class="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100 lg:text-2xl">
              欢迎使用 Gload Dramas
            </h1>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {{ today }} · 查看系统数据和常用管理入口
            </p>
          </div>

        </div>
      </section>

      <gva-card title="业务数据">
        <el-empty description="暂无业务数据" />
      </gva-card>
      <gva-card title="快捷功能">
        <gva-quick-link />
      </gva-card>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import GvaCard from './components/card.vue'
  import GvaQuickLink from './components/quickLinks.vue'

  const today = computed(() => {
    try {
      const d = new Date()
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (e) {
      return new Date().toISOString().slice(0, 10)
    }
  })

  defineOptions({
    name: 'Dashboard'
  })
</script>

<style lang="scss" scoped></style>


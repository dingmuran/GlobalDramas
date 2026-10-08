<template>
  <div class="mt-2">
    <el-card shadow="never">
      <template #header>{{ $GIN_VUE_ADMIN.appName }}</template>
      <div class="flex items-center gap-4">
        <Logo :size="4" />
        <div>
          <h1 class="text-xl font-semibold">{{ $GIN_VUE_ADMIN.appName }}</h1>
          <p class="mt-2 text-gray-500">Global Dramas 后台管理系统</p>
          <p class="mt-2 text-sm text-gray-500">版本 {{ packageInfo.version }}</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
  import Logo from '@/components/logo/index.vue'
  import packageInfo from '../../../package.json'
  defineOptions({ name: 'About' })
</script>

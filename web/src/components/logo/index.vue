<script setup>
  defineProps({ size: { type: Number, default: 2 } })
</script>

<template>
  <img
    src="/global-dramas.svg"
    :alt="$GIN_VUE_ADMIN.appName"
    class="object-contain shrink-0"
    :style="{ width: `${size}rem`, height: `${size}rem` }"
  />
</template>

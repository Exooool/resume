<script setup lang="ts">
import { NConfigProvider, dateZhCN, zhCN } from 'naive-ui';
import { RouterView } from 'vue-router';
import { themeOverrides } from './theme';
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
    <RouterView />
  </n-config-provider>
</template>

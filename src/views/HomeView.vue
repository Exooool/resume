<script setup lang="ts">
import { ArrowRight, FileText } from '@lucide/vue';
import { NButton, NIcon } from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();

function startEditing() {
  void router.push('/resumes');
}
</script>

<template>
  <main class="home-page">
    <header class="home-nav">
      <div class="home-brand">
        <n-icon :component="FileText" />
        <span>简历编辑器</span>
      </div>
    </header>

    <section class="home-hero">
      <div class="home-copy">
        <p class="eyebrow">Fresh Resume Builder</p>
        <h1>轻松整理一份干净好看的简历</h1>
        <p>
          左侧填写内容，右侧实时预览 A4 简历。支持自动分页，也可以导出 PDF、PNG 和 JPG。
        </p>
        <n-button type="primary" size="large" @click="startEditing">
          开始编辑
          <template #icon>
            <n-icon :component="ArrowRight" />
          </template>
        </n-button>
      </div>

      <div class="home-preview" aria-hidden="true">
        <div class="home-preview-sheet">
          <div class="sheet-header">
            <span></span>
            <i></i>
          </div>
          <div class="sheet-line strong"></div>
          <div class="sheet-line"></div>
          <div class="sheet-section"></div>
          <div class="sheet-row"></div>
          <div class="sheet-row short"></div>
          <div class="sheet-section"></div>
          <div class="sheet-row"></div>
          <div class="sheet-row"></div>
          <div class="sheet-row short"></div>
        </div>
      </div>
    </section>
  </main>
</template>

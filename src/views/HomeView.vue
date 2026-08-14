<script setup lang="ts">
import { ArrowRight, FileText } from '@lucide/vue';
import { NButton, NIcon } from 'naive-ui';
import { useRouter } from 'vue-router';
import { createDefaultResume } from '../data/defaultResume';
import ResumeListThumbnail from '../components/ResumeListThumbnail.vue';
import type { ResumeTemplateId } from '../types';
import { createPreviewBlocks } from '../utils/resume';

const router = useRouter();
const previewBlocks = createPreviewBlocks(createDefaultResume());
const previewTemplates: ResumeTemplateId[] = ['classic', 'fresh', 'sidebar'];

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
        <div class="editing-row">
          <n-button type="primary" size="large" @click="startEditing">
            开始编辑
            <template #icon>
              <n-icon :component="ArrowRight" />
            </template>
          </n-button>
        </div>
      </div>

      <div class="home-preview" aria-label="三种简历模板预览">
        <div class="home-preview-deck">
          <div v-for="(templateId, index) in previewTemplates" :key="templateId" class="home-preview-card"
            :class="`home-preview-card-${index + 1}`">
            <ResumeListThumbnail :blocks="previewBlocks" :template-id="templateId" />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style lang="scss">
.home-page {
  position: relative;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  background: #ffffff;
  color: #17302c;
  isolation: isolate;
}

.home-nav {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1080px, calc(100% - 40px));
  margin: 0 auto;
  padding: 24px 0;
}

.home-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #12715b;
  font-size: 16px;
  font-weight: 800;

  .n-icon {
    font-size: 22px;
  }
}

.home-hero {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  align-items: start;
  gap: 18px;
  width: min(1080px, calc(100% - 40px));
  height: calc(100vh - 86px);
  min-height: 0;
  margin: 0 auto;
  padding: 24px 0 0;
}

.home-copy {
  max-width: 760px;
  margin: 0 auto;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);

  h1 {
    max-width: 760px;
    margin: 0 0 28px;
    color: #10251f;
    font-size: 52px;
    font-weight: 850;
    line-height: 1.12;
  }

  .editing-row {
    display: flex;
    justify-content: center;
  }
}

.home-preview {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 520px;
  transform: translateY(56px);
}

.home-preview-deck {
  position: relative;
  width: min(100%, 500px);
  height: 520px;
  perspective: 1200px;
}

.home-preview-card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(320px, 72%);
  aspect-ratio: 210 / 297;
  overflow: hidden;
  border: 1px solid #d8e5df;
  background: #ffffff;
  box-shadow: 0 26px 60px rgba(22, 69, 57, 0.2);
  opacity: 0;
  transform: translate(calc(-50% + var(--card-offset)), calc(-50% + 220px)) rotate(0deg) scale(0.92);
  transform-origin: 50% 88%;
  animation: home-resume-card-in 1.15s cubic-bezier(0.22, 1.28, 0.36, 1) var(--card-delay) both;
  will-change: transform, opacity;

  .resume-list-card-preview {
    height: 100%;
    aspect-ratio: auto;
    border: 0;
    border-radius: 0;
  }

  .resume-list-card-preview-inner {
    box-shadow: none;
  }
}

.home-preview-card-1 {
  z-index: 1;
  --card-offset: -108px;
  --card-rotate: -11deg;
  --card-delay: 0ms;
}

.home-preview-card-2 {
  z-index: 3;
  --card-offset: 0px;
  --card-rotate: 0deg;
  --card-delay: 150ms;
}

.home-preview-card-3 {
  z-index: 2;
  --card-offset: 108px;
  --card-rotate: 11deg;
  --card-delay: 300ms;
}

@keyframes home-resume-card-in {
  0% {
    opacity: 0;
    transform: translate(calc(-50% + var(--card-offset)), calc(-50% + 220px)) rotate(calc(var(--card-rotate) * 0.7)) scale(0.88);
  }

  62% {
    opacity: 1;
    transform: translate(calc(-50% + var(--card-offset)), calc(-50% - 8px)) rotate(calc(var(--card-rotate) * 1.08)) scale(1.035);
  }

  78% {
    transform: translate(calc(-50% + var(--card-offset)), calc(-50% + 5px)) rotate(calc(var(--card-rotate) * 0.96)) scale(0.985);
  }

  100% {
    opacity: 1;
    transform: translate(calc(-50% + var(--card-offset)), -50%) rotate(var(--card-rotate)) scale(1);
  }
}

@media (max-width: 720px) {
  .home-page {
    height: 100dvh;
    min-height: 100dvh;
  }

  .home-nav,
  .home-hero {
    width: min(100% - 32px, 560px);
  }

  .home-nav {
    padding: 18px 0;
  }

  .home-hero {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    gap: 16px;
    height: calc(100dvh - 70px);
    min-height: 0;
    padding: 22px 0 0;
  }

  .home-copy h1 {
    font-size: clamp(36px, 11vw, 48px);
  }

  .home-preview {
    min-height: 430px;
    transform: translateY(34px);
  }

  .home-preview-deck {
    width: min(100%, 480px);
    height: 430px;
  }

  .home-preview-card {
    width: min(255px, 72%);
  }

  .home-preview-card-1 {
    --card-offset: -64px;
  }

  .home-preview-card-3 {
    --card-offset: 64px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-preview-card {
    opacity: 1;
    transform: translate(calc(-50% + var(--card-offset)), -50%) rotate(var(--card-rotate));
    animation: none;
  }
}
</style>

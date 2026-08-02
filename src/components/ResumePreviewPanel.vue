<script setup lang="ts">
import { Download, FileImage, FileText } from '@lucide/vue';
import { NButton, NDivider, NIcon, NScrollbar, NSpace } from 'naive-ui';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ResumeBlock, ResumeTemplateId } from '../types';
import { A4_PAGE_HEIGHT } from '../utils/resume';
import ResumeBlockView from './ResumeBlock.vue';

const A4_PAGE_WIDTH = 794;
const STAGE_INLINE_PADDING = 48;

const props = defineProps<{
  pages: ResumeBlock[][];
  pageCountLabel: string;
  previewBlocks: ResumeBlock[];
  templateId: ResumeTemplateId;
  exportingType: 'pdf' | 'png' | 'jpg' | '';
  spaceStyle?: Record<string, string>;
  compact?: boolean;
  collectPageRef: (element: unknown) => void;
  setMeasureRef: (element: unknown) => void;
}>();

const emit = defineEmits<{
  'export-pdf': [];
  'export-png': [];
  'export-jpg': [];
}>();

const stageRef = ref<HTMLElement | null>(null);
const previewScale = ref(1);

let observer: ResizeObserver | null = null;

const stackHeight = computed(
  () => A4_PAGE_HEIGHT * props.pages.length + 24 * Math.max(props.pages.length - 1, 0),
);

const previewFitStyle = computed(() => ({
  width: `${A4_PAGE_WIDTH * previewScale.value}px`,
}));

const scaleClipStyle = computed(() => ({
  height: `${stackHeight.value * previewScale.value}px`,
}));

const pageStackStyle = computed(() => ({
  width: `${A4_PAGE_WIDTH}px`,
  transform: `scale(${previewScale.value})`,
  transformOrigin: 'top left',
}));

onMounted(() => {
  const stage = stageRef.value;
  if (!stage) {
    return;
  }

  observer = new ResizeObserver((entries) => {
    updateScale(entries[0]?.contentRect.width ?? 0);
  });
  observer.observe(stage);
  updateScale(stage.clientWidth);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

watch(
  () => props.exportingType,
  (exportingType) => {
    if (exportingType) {
      previewScale.value = 1;
      return;
    }

    updateScale(stageRef.value?.clientWidth ?? 0);
  },
);

function updateScale(width: number) {
  if (props.exportingType || width <= 0) {
    previewScale.value = 1;
    return;
  }

  const availableWidth = Math.max(width - STAGE_INLINE_PADDING, 0);
  previewScale.value = Math.min(1, availableWidth / A4_PAGE_WIDTH);
}
</script>

<template>
  <section class="preview-panel">
    <header class="preview-toolbar">
      <div>
        <p class="eyebrow">Preview</p>
        <h2>简历预览</h2>
      </div>

      <n-space class="preview-export-actions" :wrap="compact" :size="8">
        <n-button
          secondary
          size="small"
          :loading="exportingType === 'pdf'"
          :disabled="Boolean(exportingType)"
          @click="emit('export-pdf')"
        >
          <template #icon>
            <n-icon :component="FileText" />
          </template>
          PDF
        </n-button>
        <n-button
          secondary
          size="small"
          :loading="exportingType === 'png'"
          :disabled="Boolean(exportingType)"
          @click="emit('export-png')"
        >
          <template #icon>
            <n-icon :component="Download" />
          </template>
          PNG
        </n-button>
        <n-button
          secondary
          size="small"
          :loading="exportingType === 'jpg'"
          :disabled="Boolean(exportingType)"
          @click="emit('export-jpg')"
        >
          <template #icon>
            <n-icon :component="FileImage" />
          </template>
          JPG
        </n-button>
      </n-space>
    </header>

    <n-divider />

    <n-scrollbar class="preview-scrollbar">
      <div ref="stageRef" class="preview-stage">
        <div class="preview-fit" :style="previewFitStyle">
          <div class="page-count">{{ pageCountLabel }}</div>
          <div class="page-scale-clip" :style="scaleClipStyle">
            <div class="page-stack" :style="pageStackStyle">
              <section
                v-for="(page, pageIndex) in pages"
                :key="pageIndex"
                :ref="collectPageRef"
                class="resume-page"
                :class="`resume-template-${templateId}`"
                :style="spaceStyle"
              >
                <ResumeBlockView
                  v-for="block in page"
                  :key="`${pageIndex}-${block.id}`"
                  :block="block"
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    </n-scrollbar>

    <div class="measurement">
      <div
        :ref="setMeasureRef"
        class="resume-page measure-page"
        :class="`resume-template-${templateId}`"
        :style="spaceStyle"
      >
        <ResumeBlockView v-for="block in previewBlocks" :key="block.id" :block="block" />
      </div>
    </div>
  </section>
</template>

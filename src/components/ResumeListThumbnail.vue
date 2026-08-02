<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { ResumeBlock, ResumeTemplateId } from '../types';
import { A4_PAGE_HEIGHT } from '../utils/resume';
import ResumeBlockView from './ResumeBlock.vue';

const A4_PAGE_WIDTH = 794;

defineProps<{
  blocks: ResumeBlock[];
  templateId: ResumeTemplateId;
}>();

const frameRef = ref<HTMLElement | null>(null);
const scale = ref(0);

let observer: ResizeObserver | null = null;

onMounted(() => {
  const frame = frameRef.value;
  if (!frame) {
    return;
  }

  const updateScale = (width: number) => {
    scale.value = width > 0 ? width / A4_PAGE_WIDTH : 0;
  };

  updateScale(frame.clientWidth);

  observer = new ResizeObserver((entries) => {
    updateScale(entries[0]?.contentRect.width ?? 0);
  });
  observer.observe(frame);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <div ref="frameRef" class="resume-list-card-preview" aria-hidden="true">
    <div
      class="resume-list-card-preview-inner"
      :style="{
        width: `${A4_PAGE_WIDTH}px`,
        height: `${A4_PAGE_HEIGHT}px`,
        transform: `scale(${scale})`,
      }"
    >
      <section
        class="resume-page resume-list-thumb-page"
        :class="`resume-template-${templateId}`"
      >
        <ResumeBlockView v-for="block in blocks" :key="block.id" :block="block" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from '@lucide/vue';
import { NButton, NIcon } from 'naive-ui';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createTemplateChooserSample } from '../data/defaultResume';
import { resumeTemplateOptions } from '../data/resumeTemplates';
import type { ResumeTemplateId } from '../types';
import { createPreviewBlocks } from '../utils/resume';
import ResumeListThumbnail from './ResumeListThumbnail.vue';

defineProps<{
  selectedTemplateId: ResumeTemplateId;
}>();

const emit = defineEmits<{
  selectTemplate: [templateId: ResumeTemplateId];
  confirm: [];
}>();

const previewBlocks = createPreviewBlocks(createTemplateChooserSample());
const isCompactLayout = ref(false);

const trackRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartScrollLeft = ref(0);
const shouldIgnoreClick = ref(false);
const wheelScrollDuration = 180;

const COMPACT_QUERY = '(max-width: 1020px)';
let compactMedia: MediaQueryList | null = null;
let wheelAnimationFrame = 0;
let wheelAnimationStartedAt = 0;
let wheelAnimationStartLeft = 0;
let wheelAnimationTargetLeft = 0;

function syncCompactLayout() {
  isCompactLayout.value = Boolean(compactMedia?.matches);
  if (isCompactLayout.value) {
    cancelWheelScrollAnimation();
    isDragging.value = false;
  }
}

function cancelWheelScrollAnimation() {
  if (wheelAnimationFrame) {
    cancelAnimationFrame(wheelAnimationFrame);
    wheelAnimationFrame = 0;
  }
  wheelAnimationStartedAt = 0;
}

function animateWheelScroll(timestamp: number) {
  const track = trackRef.value;
  if (!track) {
    cancelWheelScrollAnimation();
    return;
  }

  if (!wheelAnimationStartedAt) {
    wheelAnimationStartedAt = timestamp;
  }

  const progress = Math.min((timestamp - wheelAnimationStartedAt) / wheelScrollDuration, 1);
  track.scrollLeft =
    wheelAnimationStartLeft + (wheelAnimationTargetLeft - wheelAnimationStartLeft) * progress;

  if (progress < 1) {
    wheelAnimationFrame = requestAnimationFrame(animateWheelScroll);
    return;
  }

  cancelWheelScrollAnimation();
}

function startWheelScrollAnimation(targetScrollLeft: number) {
  const track = trackRef.value;
  if (!track) {
    return;
  }

  if (wheelAnimationFrame) {
    cancelAnimationFrame(wheelAnimationFrame);
  }

  wheelAnimationStartLeft = track.scrollLeft;
  wheelAnimationTargetLeft = targetScrollLeft;
  wheelAnimationStartedAt = 0;
  wheelAnimationFrame = requestAnimationFrame(animateWheelScroll);
}

function startDrag(event: PointerEvent) {
  if (isCompactLayout.value || event.button !== 0 || !trackRef.value) {
    return;
  }

  cancelWheelScrollAnimation();
  isDragging.value = true;
  shouldIgnoreClick.value = false;
  dragStartX.value = event.clientX;
  dragStartScrollLeft.value = trackRef.value.scrollLeft;
}

function dragTemplates(event: PointerEvent) {
  if (isCompactLayout.value || !isDragging.value || !trackRef.value) {
    return;
  }

  const deltaX = event.clientX - dragStartX.value;
  if (Math.abs(deltaX) > 4) {
    shouldIgnoreClick.value = true;
  }
  trackRef.value.scrollLeft = dragStartScrollLeft.value - deltaX;
}

function stopDrag() {
  isDragging.value = false;
}

function scrollTemplates(event: WheelEvent) {
  if (isCompactLayout.value || !trackRef.value) {
    return;
  }

  const track = trackRef.value;
  const maxScrollLeft = track.scrollWidth - track.clientWidth;
  if (maxScrollLeft <= 0) {
    return;
  }

  const rawDelta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (rawDelta === 0) {
    return;
  }

  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1;
  const baseScrollLeft = wheelAnimationFrame ? wheelAnimationTargetLeft : track.scrollLeft;
  const nextScrollLeft = Math.min(
    Math.max(baseScrollLeft + rawDelta * unit, 0),
    maxScrollLeft,
  );

  if (nextScrollLeft !== baseScrollLeft) {
    event.preventDefault();
    startWheelScrollAnimation(nextScrollLeft);
  }
}

function selectTemplate(event: MouseEvent, templateId: ResumeTemplateId) {
  if (shouldIgnoreClick.value) {
    event.preventDefault();
    shouldIgnoreClick.value = false;
    return;
  }

  emit('selectTemplate', templateId);
}

onMounted(() => {
  compactMedia = window.matchMedia(COMPACT_QUERY);
  syncCompactLayout();
  compactMedia.addEventListener('change', syncCompactLayout);
});

onBeforeUnmount(() => {
  compactMedia?.removeEventListener('change', syncCompactLayout);
  cancelWheelScrollAnimation();
});
</script>

<template>
  <section class="template-drawer">
    <header class="template-drawer-header">
      <div>
        <p class="eyebrow">Template</p>
        <h2>模板选择</h2>
      </div>
    </header>

    <div
      ref="trackRef"
      class="template-drawer-track"
      :class="{ 'is-dragging': isDragging }"
      @pointerdown="startDrag"
      @pointermove="dragTemplates"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
      @pointerleave="stopDrag"
      @wheel="scrollTemplates"
    >
      <button
        v-for="template in resumeTemplateOptions"
        :key="template.value"
        type="button"
        class="template-option-card"
        :class="{ 'is-selected': template.value === selectedTemplateId }"
        @click="selectTemplate($event, template.value)"
      >
        <span class="template-selected-badge">
          <n-icon :component="Check" />
        </span>
        <span class="template-option-preview">
          <ResumeListThumbnail
            :blocks="previewBlocks"
            :template-id="template.value"
          />
        </span>
        <strong>{{ template.label }}</strong>
        <small>{{ template.description }}</small>
      </button>
    </div>

    <footer class="template-drawer-footer">
      <n-button type="primary" size="large" @click="emit('confirm')">确定</n-button>
    </footer>
  </section>
</template>

<style lang="scss">
.template-drawer {
  position: relative;
  z-index: 30;
  display: grid;
  grid-row: 1;
  grid-template-rows: auto minmax(0, 1fr) auto;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-bottom: 1px solid #d5e1dc;
  background: #f8fbfa;
}

.template-drawer-header,
.template-drawer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 48px);
  margin: 0 auto;
}

.template-drawer-header {
  padding: 22px 0 8px;

  h2 {
    margin: 0;
    color: #17252c;
    font-size: 24px;
    line-height: 1.2;
  }
}

.template-drawer-enter-active,
.template-drawer-leave-active {
  transition: height 0.48s ease, opacity 0.32s ease, transform 0.48s ease, border-bottom-color 0.48s ease;
}

.template-drawer-enter-from,
.template-drawer-leave-to {
  height: 0;
  opacity: 0;
  border-bottom-color: transparent;
  transform: translateY(-20px);
}

.template-drawer-enter-to,
.template-drawer-leave-from {
  height: 80vh;
}

.template-drawer-track {
  display: flex;
  align-items: stretch;
  gap: 18px;
  width: 100%;
  min-height: 0;
  margin: 0;
  padding: 12px 30px 42px;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior: contain;
  cursor: grab;
  touch-action: pan-x;
  scrollbar-width: none;
  user-select: none;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }

  &.is-dragging {
    cursor: grabbing;
  }
}

.template-option-card {
  position: relative;
  display: grid;
  flex: 0 0 auto;
  align-self: stretch;
  grid-template-rows: auto auto auto;
  align-content: start;
  gap: 8px;
  width: auto;
  aspect-ratio: 280 / 450;
  min-width: 0;
  min-height: 0;
  padding: 12px;
  border: 1px solid #d8e3df;
  border-radius: 8px;
  background: #ffffff;
  color: #1d2a32;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

  &:hover,
  &.is-selected {
    border-color: #12715b;
    box-shadow: 0 12px 28px rgba(18, 113, 91, 0.16);
  }

  &.is-selected {
    transform: translateY(-2px);

    .template-selected-badge {
      display: flex;
    }
  }

  strong {
    color: #17252c;
    font-size: 15px;
    line-height: 1.3;
  }

  small {
    color: #687981;
    font-size: 12px;
    line-height: 1.45;
  }
}

.template-selected-badge {
  position: absolute;
  z-index: 2;
  top: 12px;
  right: 12px;
  display: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #12715b;
  color: #ffffff;
}

.template-option-preview {
  display: block;
  width: 100%;
  min-width: 0;
  padding: 8px;
  border-radius: 6px;
  background: #edf2f1;
  overflow: hidden;
  box-sizing: border-box;

  .resume-list-card-preview {
    width: 100%;
    aspect-ratio: 210 / 297;
    height: auto;
    border-bottom: 0;
    border-radius: 4px;
    box-shadow: 0 6px 16px rgba(26, 42, 50, 0.1);
  }
}

.template-drawer-footer {
  justify-content: flex-end;
  padding: 0 0 22px;
}

@media (max-width: 1020px) {
  .template-drawer-header,
  .template-drawer-footer {
    width: calc(100% - 32px);
  }

  .template-drawer-header {
    padding: 16px 0 8px;

    h2 {
      font-size: 20px;
    }
  }

  .template-drawer-track {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
    align-items: start;
    gap: 14px;
    padding: 8px 16px 20px;
    overflow-x: hidden;
    overflow-y: auto;
    cursor: default;
    touch-action: pan-y;
    scrollbar-width: thin;
    scrollbar-color: #b7c9c2 transparent;
    user-select: auto;

    &::-webkit-scrollbar {
      display: block;
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: #b7c9c2;
    }

    &.is-dragging {
      cursor: default;
    }
  }

  .template-option-card {
    flex: none;
    align-self: start;
    width: 100%;
    height: max-content;
    min-height: auto;
    aspect-ratio: unset;
    overflow: hidden;

    &.is-selected {
      transform: none;
    }
  }

  .template-option-preview .resume-list-card-preview {
    aspect-ratio: auto;
  }
}

@media (min-width: 900px) and (max-width: 1020px) {
  .template-drawer-track {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .template-drawer-track {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>

<script setup lang="ts">
import { Check } from '@lucide/vue';
import { NButton, NIcon } from 'naive-ui';
import { onBeforeUnmount, ref } from 'vue';
import { resumeTemplateOptions } from '../data/resumeTemplates';
import type { ResumeTemplateId } from '../types';

defineProps<{
  selectedTemplateId: ResumeTemplateId;
}>();

const emit = defineEmits<{
  selectTemplate: [templateId: ResumeTemplateId];
  confirm: [];
}>();

const trackRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartScrollLeft = ref(0);
const shouldIgnoreClick = ref(false);
const wheelScrollDuration = 180;

let wheelAnimationFrame = 0;
let wheelAnimationStartedAt = 0;
let wheelAnimationStartLeft = 0;
let wheelAnimationTargetLeft = 0;

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
  if (event.button !== 0 || !trackRef.value) {
    return;
  }

  cancelWheelScrollAnimation();
  isDragging.value = true;
  shouldIgnoreClick.value = false;
  dragStartX.value = event.clientX;
  dragStartScrollLeft.value = trackRef.value.scrollLeft;
}

function dragTemplates(event: PointerEvent) {
  if (!isDragging.value || !trackRef.value) {
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
  if (!trackRef.value) {
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

onBeforeUnmount(cancelWheelScrollAnimation);
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
        <span class="template-option-preview" :class="`template-preview-${template.value}`">
          <span class="template-preview-paper">
            <span class="preview-head">
              <i></i>
              <b></b>
            </span>
            <span class="preview-section"></span>
            <span class="preview-line long"></span>
            <span class="preview-line"></span>
            <span class="preview-section"></span>
            <span class="preview-line long"></span>
            <span class="preview-line short"></span>
          </span>
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

<script setup lang="ts">
import { Eye, PenLine, SlidersHorizontal } from '@lucide/vue';
import { NButton, NIcon } from 'naive-ui';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ResumeControlPanel from '../components/ResumeControlPanel.vue';
import ResumeFormPanel from '../components/ResumeFormPanel.vue';
import ResumePreviewPanel from '../components/ResumePreviewPanel.vue';
import ResumeTemplateChooser from '../components/ResumeTemplateChooser.vue';
import { useResumeEditor } from '../composables/useResumeEditor';
import { createBlankResume, createDefaultResume } from '../data/defaultResume';
import type { ResumeSectionId, ResumeTemplateId } from '../types';
import { cloneResumeData } from '../utils/resume';
import { getResumeDocument, updateResumeDocument } from '../utils/resumeStorage';

const COMPACT_QUERY = '(max-width: 1180px)';
const isDev = import.meta.env.DEV;

const route = useRoute();
const router = useRouter();
const resumeId = readResumeId();
const storedDocument = resumeId ? getResumeDocument(resumeId) : null;
const isMissingResume = ref(!storedDocument);
const resumeName = ref(storedDocument?.name ?? '未命名简历');

if (isMissingResume.value) {
  void router.replace('/resumes');
}

const {
  resume,
  pages,
  previewBlocks,
  pageCountLabel,
  exportingType,
  spaceStyle,
  canUndo,
  canRedo,
  undo,
  redo,
  addEducation,
  removeEducation,
  addWorkExperience,
  removeWorkExperience,
  addProject,
  removeProject,
  setMeasureRef,
  collectPageRef,
  exportPDF,
  exportPNG,
  exportJPG,
} = useResumeEditor(storedDocument?.data ?? createBlankResume());

const isTemplateChooserOpen = ref(false);
const draftTemplateId = ref<ResumeTemplateId>(resume.templateId);
const activeSection = ref<ResumeSectionId>(resume.sectionOrder[0] ?? 'basic');
const isCompactLayout = ref(false);
const mobilePane = ref<'settings' | 'edit' | 'preview'>('edit');
let saveTimer = 0;
let compactMedia: MediaQueryList | null = null;

watch(
  resume,
  () => {
    scheduleSave();
  },
  { deep: true },
);

onMounted(() => {
  compactMedia = window.matchMedia(COMPACT_QUERY);
  syncCompactLayout();
  compactMedia.addEventListener('change', syncCompactLayout);
});

onBeforeUnmount(() => {
  compactMedia?.removeEventListener('change', syncCompactLayout);
  saveResume();
});

function readResumeId() {
  const routeValue = route.params.resumeId;
  return Array.isArray(routeValue) ? routeValue[0] : routeValue ?? '';
}

function syncCompactLayout() {
  isCompactLayout.value = Boolean(compactMedia?.matches);
  if (!isCompactLayout.value) {
    mobilePane.value = 'edit';
  }
}

function scheduleSave() {
  if (isMissingResume.value) {
    return;
  }

  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveResume();
  }, 500);
}

function saveResume() {
  if (isMissingResume.value || !resumeId) {
    return;
  }

  window.clearTimeout(saveTimer);
  updateResumeDocument(resumeId, resume);
}

function openTemplateChooser() {
  draftTemplateId.value = resume.templateId;
  isTemplateChooserOpen.value = true;
}

function selectDraftTemplate(templateId: ResumeTemplateId) {
  draftTemplateId.value = templateId;
}

function confirmTemplate() {
  resume.templateId = draftTemplateId.value;
  isTemplateChooserOpen.value = false;
}

function backToList() {
  saveResume();
  void router.push('/resumes');
}

function setMobilePane(pane: 'settings' | 'edit' | 'preview') {
  mobilePane.value = pane;
}

function selectSection(sectionId: ResumeSectionId) {
  activeSection.value = sectionId;
  if (isCompactLayout.value) {
    mobilePane.value = 'edit';
  }
}

function toggleSection(sectionId: ResumeSectionId) {
  if (sectionId === 'basic') {
    return;
  }

  const hiddenIndex = resume.hiddenSections.indexOf(sectionId);
  if (hiddenIndex >= 0) {
    resume.hiddenSections.splice(hiddenIndex, 1);
    return;
  }

  resume.hiddenSections.push(sectionId);
}

function removeSection(sectionId: ResumeSectionId) {
  if (sectionId === 'basic') {
    return;
  }

  resume.sectionOrder = resume.sectionOrder.filter((id) => id !== sectionId);
  resume.hiddenSections = resume.hiddenSections.filter((id) => id !== sectionId);

  if (activeSection.value === sectionId) {
    activeSection.value = resume.sectionOrder[0] ?? 'basic';
  }
}

function addSection(sectionId: ResumeSectionId) {
  if (!resume.sectionOrder.includes(sectionId)) {
    resume.sectionOrder.push(sectionId);
  }
  resume.hiddenSections = resume.hiddenSections.filter((id) => id !== sectionId);
  selectSection(sectionId);
}

function fillDemoData() {
  const demo = cloneResumeData(createDefaultResume());
  resume.templateId = demo.templateId;
  resume.sectionOrder = demo.sectionOrder;
  resume.hiddenSections = demo.hiddenSections;
  resume.theme = demo.theme;
  resume.basic = demo.basic;
  resume.education = demo.education;
  resume.workExperience = demo.workExperience;
  resume.projects = demo.projects;
  resume.skillMode = demo.skillMode;
  resume.skillItems = demo.skillItems;
  resume.skillText = demo.skillText;
  resume.summary = demo.summary;
  resume.smartOnePage = demo.smartOnePage;
}
</script>

<template>
  <main
    v-if="!isMissingResume"
    class="editor-route"
    :class="{
      'template-chooser-open': isTemplateChooserOpen,
      'is-compact': isCompactLayout,
      [`show-mobile-${mobilePane}`]: isCompactLayout,
    }"
  >
    <Transition name="template-drawer">
      <ResumeTemplateChooser
        v-if="isTemplateChooserOpen"
        :selected-template-id="draftTemplateId"
        @select-template="selectDraftTemplate"
        @confirm="confirmTemplate"
      />
    </Transition>

    <div class="app-shell">
      <div class="editor-workspace">
        <ResumeControlPanel
          :resume="resume"
          :resume-name="resumeName"
          :active-section="activeSection"
          :exporting-type="exportingType"
          :can-undo="canUndo"
          :can-redo="canRedo"
          :show-demo-fill="isDev"
          @update:active-section="selectSection"
          @toggle-section="toggleSection"
          @remove-section="removeSection"
          @add-section="addSection"
          @undo="undo"
          @redo="redo"
          @back-to-list="backToList"
          @open-template-chooser="openTemplateChooser"
          @fill-demo="fillDemoData"
          @export-pdf="exportPDF"
          @export-png="exportPNG"
          @export-jpg="exportJPG"
        />
        <ResumeFormPanel
          :resume="resume"
          :active-section="activeSection"
          @update:active-section="selectSection"
          @add-education="addEducation"
          @remove-education="removeEducation"
          @add-work-experience="addWorkExperience"
          @remove-work-experience="removeWorkExperience"
          @add-project="addProject"
          @remove-project="removeProject"
        />
      </div>
      <ResumePreviewPanel
        :pages="pages"
        :preview-blocks="previewBlocks"
        :template-id="resume.templateId"
        :page-count-label="pageCountLabel"
        :exporting-type="exportingType"
        :space-style="spaceStyle"
        :collect-page-ref="collectPageRef"
        :set-measure-ref="setMeasureRef"
      />
    </div>

    <nav v-if="isCompactLayout && !isTemplateChooserOpen" class="mobile-editor-nav">
      <n-button
        class="mobile-editor-nav-btn"
        :type="mobilePane === 'settings' ? 'primary' : 'default'"
        :secondary="mobilePane !== 'settings'"
        @click="setMobilePane('settings')"
      >
        <template #icon>
          <n-icon :component="SlidersHorizontal" />
        </template>
        配置
      </n-button>
      <n-button
        class="mobile-editor-nav-btn"
        :type="mobilePane === 'edit' ? 'primary' : 'default'"
        :secondary="mobilePane !== 'edit'"
        @click="setMobilePane('edit')"
      >
        <template #icon>
          <n-icon :component="PenLine" />
        </template>
        编辑
      </n-button>
      <n-button
        class="mobile-editor-nav-btn"
        :type="mobilePane === 'preview' ? 'primary' : 'default'"
        :secondary="mobilePane !== 'preview'"
        @click="setMobilePane('preview')"
      >
        <template #icon>
          <n-icon :component="Eye" />
        </template>
        预览
      </n-button>
    </nav>
  </main>
</template>

<style scoped lang="scss">
.editor-route {
  position: relative;
  display: grid;
  grid-template-rows: 0 100vh;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  transition: grid-template-rows 0.48s ease;

  &.template-chooser-open {
    grid-template-rows: 80vh 20vh;
  }
}

.app-shell {
  display: grid;
  grid-row: 2;
  grid-template-columns: minmax(680px, 820px) minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.editor-workspace {
  display: grid;
  grid-template-columns: minmax(240px, 280px) minmax(380px, 1fr);
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.template-chooser-open {
  .app-shell {
    min-height: 0;
    height: 100%;
    max-height: none;
    overflow: hidden;
  }

  .control-panel,
  .editor-panel,
  .preview-panel {
    min-height: 0;
    max-height: none;
    overflow: hidden;
  }

  :deep(.n-scrollbar-rail) {
    display: none;
  }

  :deep(.n-scrollbar-container) {
    overflow: hidden;
  }
}

@media (max-width: 1180px) {
  .editor-route.is-compact {
    grid-template-rows: 0 minmax(0, 1fr) auto;
    width: 100%;
    max-width: 100%;
    height: 100dvh;
    min-height: 100dvh;
    overflow: hidden;

    &.template-chooser-open {
      grid-template-rows: minmax(0, 1fr) 0 0;
    }

    &.template-chooser-open :deep(.template-drawer-enter-to),
    &.template-chooser-open :deep(.template-drawer-leave-from),
    :deep(.template-drawer-enter-to),
    :deep(.template-drawer-leave-from) {
      height: 100%;
    }
  }

  .app-shell {
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    width: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .is-compact {
    .app-shell {
      position: relative;
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr);
    }

    .editor-workspace {
      position: absolute;
      inset: 0;
      display: block;
      min-width: 0;
      min-height: 0;
    }

    .control-panel,
    .editor-panel,
    .preview-panel {
      position: absolute;
      inset: 0;
      width: auto;
      max-width: none;
      height: auto;
      min-width: 0;
      min-height: 0;
      max-height: none;
      overflow: hidden;
    }

    .control-panel,
    .editor-panel,
    .preview-panel {
      z-index: 0;
      visibility: hidden;
      pointer-events: none;
    }

    &.show-mobile-settings .control-panel,
    &.show-mobile-edit .editor-panel,
    &.show-mobile-preview .preview-panel {
      z-index: 1;
      visibility: visible;
      pointer-events: auto;
    }
  }

  .editor-panel {
    border-right: 0;
  }

  .mobile-editor-nav {
    z-index: 20;
    display: grid;
    grid-row: 3;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
    border-top: 1px solid #d7dedb;
    background: #fbfcfb;
  }

  .mobile-editor-nav-btn {
    width: 100%;
    min-width: 0;
  }
}
</style>

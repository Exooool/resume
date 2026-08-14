<script setup lang="ts">
import { Eye, PenLine } from '@lucide/vue';
import { NButton, NIcon } from 'naive-ui';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ResumeFormPanel from '../components/ResumeFormPanel.vue';
import ResumePreviewPanel from '../components/ResumePreviewPanel.vue';
import ResumeTemplateChooser from '../components/ResumeTemplateChooser.vue';
import { useResumeEditor } from '../composables/useResumeEditor';
import { createBlankResume, createDefaultResume } from '../data/defaultResume';
import type { ResumeTemplateId } from '../types';
import { cloneResumeData } from '../utils/resume';
import { getResumeDocument, updateResumeDocument } from '../utils/resumeStorage';

const COMPACT_QUERY = '(max-width: 1020px)';
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
  addEducation,
  removeEducation,
  addProject,
  removeProject,
  addSkillGroup,
  removeSkillGroup,
  setMeasureRef,
  collectPageRef,
  exportPDF,
  exportPNG,
  exportJPG,
} = useResumeEditor(storedDocument?.data ?? createBlankResume());

const isTemplateChooserOpen = ref(false);
const draftTemplateId = ref<ResumeTemplateId>(resume.templateId);
const isCompactLayout = ref(false);
const mobilePane = ref<'edit' | 'preview'>('edit');
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

function setMobilePane(pane: 'edit' | 'preview') {
  mobilePane.value = pane;
}

function fillDemoData() {
  const demo = cloneResumeData(createDefaultResume());
  resume.templateId = demo.templateId;
  resume.basic = demo.basic;
  resume.education = demo.education;
  resume.projects = demo.projects;
  resume.skillMode = demo.skillMode;
  resume.skillGroups = demo.skillGroups;
  resume.skillText = demo.skillText;
  resume.summary = demo.summary;
}
</script>

<template>
  <main
    v-if="!isMissingResume"
    class="editor-route"
    :class="{
      'template-chooser-open': isTemplateChooserOpen,
      'is-compact': isCompactLayout,
      'show-mobile-preview': isCompactLayout && mobilePane === 'preview',
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
      <ResumeFormPanel
        :resume="resume"
        :resume-name="resumeName"
        :compact="isCompactLayout"
        :show-demo-fill="isDev"
        @back-to-list="backToList"
        @open-template-chooser="openTemplateChooser"
        @fill-demo="fillDemoData"
        @add-education="addEducation"
        @remove-education="removeEducation"
        @add-project="addProject"
        @remove-project="removeProject"
        @add-skill-group="addSkillGroup"
        @remove-skill-group="removeSkillGroup"
      />
      <ResumePreviewPanel
        :pages="pages"
        :preview-blocks="previewBlocks"
        :template-id="resume.templateId"
        :page-count-label="pageCountLabel"
        :exporting-type="exportingType"
        :space-style="spaceStyle"
        :compact="isCompactLayout"
        :collect-page-ref="collectPageRef"
        :set-measure-ref="setMeasureRef"
        @export-pdf="exportPDF"
        @export-png="exportPNG"
        @export-jpg="exportJPG"
      />
    </div>

    <nav v-if="isCompactLayout && !isTemplateChooserOpen" class="mobile-editor-nav">
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

<style lang="scss">
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
  grid-template-columns: minmax(360px, 520px) minmax(0, 1fr);
  height: 100%;
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

  .editor-panel,
  .preview-panel {
    min-height: 0;
    max-height: none;
    overflow: hidden;
  }

  .n-scrollbar-rail {
    display: none;
  }

  .n-scrollbar-container {
    overflow: hidden;
  }
}

@media (max-width: 1020px) {
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

    &.template-chooser-open .template-drawer-enter-to,
    &.template-chooser-open .template-drawer-leave-from,
    .template-drawer-enter-to,
    .template-drawer-leave-from {
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

    &:not(.show-mobile-preview) .preview-panel {
      z-index: 0;
      visibility: hidden;
      pointer-events: none;
    }

    &:not(.show-mobile-preview) .editor-panel,
    &.show-mobile-preview .preview-panel {
      z-index: 1;
      visibility: visible;
      pointer-events: auto;
    }

    &.show-mobile-preview .editor-panel {
      z-index: 0;
      visibility: hidden;
      pointer-events: none;
    }
  }

  .editor-panel {
    border-right: 0;
  }

  .mobile-editor-nav {
    z-index: 20;
    display: grid;
    grid-row: 3;
    grid-template-columns: 1fr 1fr;
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

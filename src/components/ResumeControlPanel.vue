<script setup lang="ts">
import {
  ArrowLeft,
  Briefcase,
  Download,
  Eye,
  EyeOff,
  FileImage,
  FileText,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  GripVertical,
  LayoutGrid,
  Palette,
  Plus,
  Redo2,
  ScrollText,
  Trash2,
  Type,
  Undo2,
  UserRound,
  Wrench,
} from '@lucide/vue';
import {
  NButton,
  NColorPicker,
  NIcon,
  NPopover,
  NPopconfirm,
  NScrollbar,
  NSelect,
  NSwitch,
} from 'naive-ui';
import { computed } from 'vue';
import type { Component } from 'vue';
import draggable from 'vuedraggable';
import { RESUME_SECTION_IDS } from '../types';
import type { ResumeData, ResumeSectionId } from '../types';

const props = defineProps<{
  resume: ResumeData;
  resumeName: string;
  activeSection: ResumeSectionId;
  exportingType: 'pdf' | 'png' | 'jpg' | '';
  canUndo: boolean;
  canRedo: boolean;
  showDemoFill?: boolean;
}>();

const emit = defineEmits<{
  'update:active-section': [sectionId: ResumeSectionId];
  'toggle-section': [sectionId: ResumeSectionId];
  'remove-section': [sectionId: ResumeSectionId];
  'add-section': [sectionId: ResumeSectionId];
  undo: [];
  redo: [];
  'back-to-list': [];
  'open-template-chooser': [];
  'fill-demo': [];
  'export-pdf': [];
  'export-png': [];
  'export-jpg': [];
}>();

interface SectionDefinition {
  id: ResumeSectionId;
  label: string;
  icon: Component;
}

const sectionDefinitions: Record<ResumeSectionId, SectionDefinition> = {
  basic: { id: 'basic', label: '基本信息', icon: UserRound },
  education: { id: 'education', label: '教育经历', icon: GraduationCap },
  workExperience: { id: 'workExperience', label: '工作经历', icon: Briefcase },
  projects: { id: 'projects', label: '项目经历', icon: FolderKanban },
  skills: { id: 'skills', label: '技术能力', icon: Wrench },
  summary: { id: 'summary', label: '自我总结', icon: ScrollText },
};

const fontOptions = [
  {
    label: '现代黑体',
    value: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  },
  {
    label: '经典宋体',
    value: 'SimSun, "Songti SC", serif',
  },
  {
    label: '优雅楷体',
    value: 'KaiTi, "Kaiti SC", serif',
  },
  {
    label: '简洁西文',
    value: 'Inter, Arial, sans-serif',
  },
];

const LOCKED_SECTION_ID: ResumeSectionId = 'basic';

interface SectionMoveEvent {
  draggedContext: { element: SectionDefinition; index: number };
  relatedContext: { element: SectionDefinition; index: number };
  willInsertAfter?: boolean;
}

const draggableSections = computed({
  get() {
    return props.resume.sectionOrder
      .map((sectionId) => sectionDefinitions[sectionId])
      .filter(Boolean);
  },
  set(items: SectionDefinition[]) {
    props.resume.sectionOrder = items.map((item) => item.id);
  },
});

const availableSections = computed(() =>
  RESUME_SECTION_IDS.filter((sectionId) => !props.resume.sectionOrder.includes(sectionId)).map(
    (sectionId) => sectionDefinitions[sectionId],
  ),
);

function isLockedSection(sectionId: ResumeSectionId) {
  return sectionId === LOCKED_SECTION_ID;
}

function onSectionMove(event: SectionMoveEvent) {
  if (event.draggedContext.element.id === LOCKED_SECTION_ID) {
    return false;
  }

  if (event.relatedContext.index === 0 && !event.willInsertAfter) {
    return false;
  }

  return true;
}

function isHidden(sectionId: ResumeSectionId) {
  return props.resume.hiddenSections.includes(sectionId);
}
</script>

<template>
  <aside class="control-panel">
    <header class="control-header panel-header-bar">
      <n-button quaternary circle title="返回简历列表" @click="emit('back-to-list')">
        <template #icon>
          <n-icon :component="ArrowLeft" />
        </template>
      </n-button>
      <div class="control-title">
        <p class="eyebrow">Resume Editor</p>
        <h1>{{ resumeName }}</h1>
      </div>
    </header>

    <div class="control-pinned">
      <section class="control-section quick-actions-section">
        <div class="section-heading-row">
          <h2>快捷操作</h2>
        </div>
        <div class="history-actions">
          <n-button secondary :disabled="!canUndo" @click="emit('undo')">
            <template #icon><n-icon :component="Undo2" /></template>
            撤销
          </n-button>
          <n-button secondary :disabled="!canRedo" @click="emit('redo')">
            <template #icon><n-icon :component="Redo2" /></template>
            重做
          </n-button>
        </div>
        <div class="document-actions">
          <n-button secondary @click="emit('open-template-chooser')">
            <template #icon><n-icon :component="LayoutGrid" /></template>
            选择模板
          </n-button>
          <n-button
            v-if="showDemoFill"
            secondary
            type="warning"
            @click="emit('fill-demo')"
          >
            <template #icon><n-icon :component="FlaskConical" /></template>
            模拟数据
          </n-button>
        </div>
        <label class="smart-page-row">
          <span>智能压缩为一页</span>
          <n-switch v-model:value="resume.smartOnePage" size="small" />
        </label>
      </section>

      <section class="control-section export-section">
        <div class="section-heading-row">
          <h2>导出简历</h2>
        </div>
        <div class="export-actions">
          <n-button
            secondary
            :loading="exportingType === 'pdf'"
            :disabled="Boolean(exportingType)"
            @click="emit('export-pdf')"
          >
            <template #icon><n-icon :component="FileText" /></template>
            PDF
          </n-button>
          <n-button
            secondary
            :loading="exportingType === 'png'"
            :disabled="Boolean(exportingType)"
            @click="emit('export-png')"
          >
            <template #icon><n-icon :component="Download" /></template>
            PNG
          </n-button>
          <n-button
            secondary
            :loading="exportingType === 'jpg'"
            :disabled="Boolean(exportingType)"
            @click="emit('export-jpg')"
          >
            <template #icon><n-icon :component="FileImage" /></template>
            JPG
          </n-button>
        </div>
      </section>
    </div>

    <n-scrollbar class="control-scrollbar">
      <div class="control-content">
        <section class="control-section module-section">
          <div class="section-heading-row">
            <h2>简历模块</h2>
            <span>拖拽排序</span>
          </div>
          <draggable
            v-model="draggableSections"
            class="section-list"
            item-key="id"
            handle=".drag-handle:not(.is-disabled)"
            :animation="240"
            easing="cubic-bezier(0.2, 0.8, 0.2, 1)"
            ghost-class="section-item-ghost"
            chosen-class="section-item-chosen"
            drag-class="section-item-drag"
            :move="onSectionMove"
          >
            <template #item="{ element: section }">
              <div
                class="section-item"
                role="button"
                tabindex="0"
                :class="{
                  'is-active': activeSection === section.id,
                  'is-hidden': isHidden(section.id),
                  'is-fixed': isLockedSection(section.id),
                }"
                @click="emit('update:active-section', section.id)"
                @keydown.enter="emit('update:active-section', section.id)"
              >
                <n-icon
                  class="drag-handle"
                  :class="{ 'is-disabled': isLockedSection(section.id) }"
                  :component="GripVertical"
                  :title="isLockedSection(section.id) ? '基本信息不可拖拽' : '拖拽排序'"
                />
                <span class="section-icon"><n-icon :component="section.icon" /></span>
                <span class="section-name">{{ section.label }}</span>
                <span class="section-actions">
                  <button
                    type="button"
                    class="section-action"
                    :disabled="isLockedSection(section.id)"
                    :title="
                      isLockedSection(section.id)
                        ? '基本信息不可隐藏'
                        : isHidden(section.id)
                          ? '显示模块'
                          : '隐藏模块'
                    "
                    @click.stop="emit('toggle-section', section.id)"
                  >
                    <n-icon :component="isHidden(section.id) ? EyeOff : Eye" />
                  </button>
                  <button
                    v-if="isLockedSection(section.id)"
                    type="button"
                    class="section-action is-danger"
                    disabled
                    title="基本信息不可删除"
                  >
                    <n-icon :component="Trash2" />
                  </button>
                  <n-popconfirm
                    v-else
                    @positive-click="emit('remove-section', section.id)"
                  >
                    <template #trigger>
                      <button
                        type="button"
                        class="section-action is-danger"
                        title="删除模块"
                        @click.stop
                      >
                        <n-icon :component="Trash2" />
                      </button>
                    </template>
                    确定删除「{{ section.label }}」模块吗？
                  </n-popconfirm>
                </span>
              </div>
            </template>
          </draggable>

          <n-popover v-if="availableSections.length" trigger="click" placement="bottom-start">
            <template #trigger>
              <n-button dashed block class="add-section-button">
                <template #icon><n-icon :component="Plus" /></template>
                添加区块
              </n-button>
            </template>
            <div class="add-section-menu">
              <n-button
                v-for="section in availableSections"
                :key="section.id"
                text
                @click="emit('add-section', section.id)"
              >
                <template #icon><n-icon :component="section.icon" /></template>
                {{ section.label }}
              </n-button>
            </div>
          </n-popover>
        </section>

        <section class="control-section theme-section">
          <div class="section-heading-row">
            <h2>主题</h2>
            <n-icon :component="Palette" />
          </div>
          <label class="theme-field">
            <span><n-icon :component="Type" /> 字体</span>
            <n-select v-model:value="resume.theme.fontFamily" :options="fontOptions" />
          </label>
          <label class="theme-field">
            <span><n-icon :component="Palette" /> 主题色</span>
            <n-color-picker
              v-model:value="resume.theme.accentColor"
              :show-alpha="false"
              :modes="['hex']"
            />
          </label>
        </section>
      </div>
    </n-scrollbar>
  </aside>
</template>

<style scoped lang="scss">
.control-panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  border-right: 1px solid #dce3e0;
  background: #f7faf8;
}

.control-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0 14px;
  border-bottom-color: #e2e8e5;
}

.control-title {
  min-width: 0;

  h1 {
    margin: 0;
    overflow: hidden;
    color: #17252c;
    font-size: 17px;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.control-pinned {
  flex-shrink: 0;
  display: grid;
  gap: 18px;
  padding: 16px 14px;
  border-bottom: 1px solid #dde6e2;
  background: #f7faf8;
}

.control-scrollbar {
  flex: 1;
  min-height: 0;
}

.control-content {
  display: grid;
  gap: 18px;
  padding: 16px 14px 28px;
}

.control-section {
  display: grid;
  gap: 10px;
}

.quick-actions-section,
.export-section {
  gap: 10px;
}

.section-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  h2 {
    margin: 0;
    color: #22332d;
    font-size: 13px;
    font-weight: 700;
  }

  > span,
  > :deep(.n-icon) {
    color: #83918c;
    font-size: 11px;
  }
}

.history-actions,
.document-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  :deep(.n-button) {
    min-width: 0;
  }
}

.document-actions:has(:deep(.n-button:only-child)) {
  grid-template-columns: 1fr;
}

.smart-page-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 10px;
  border: 1px solid #e0e7e4;
  border-radius: 6px;
  background: #ffffff;
  color: #465650;
  font-size: 12px;
}

.export-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;

  :deep(.n-button) {
    min-width: 0;
    padding: 0 6px;
  }
}

.section-list {
  display: grid;
  gap: 8px;
}

.section-item-ghost {
  opacity: 0.45;
}

.section-item-chosen {
  border-color: #9fc3b7;
  background: #f0f7f4;
}

.section-item-drag {
  opacity: 0.92;
  box-shadow: 0 8px 20px rgba(34, 55, 47, 0.12);
}

.section-item {
  display: grid;
  grid-template-columns: 16px 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: #ffffff;
  color: #3f4f49;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.16s ease, background-color 0.16s ease, opacity 0.16s ease;

  &:hover,
  &.is-active {
    border-color: #9fc3b7;
    background: #f0f7f4;
  }

  &.is-hidden {
    opacity: 0.55;
  }
}

.drag-handle {
  color: #a8b6b1;
  cursor: grab;

  &.is-disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }
}

.section-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 5px;
  background: #edf5f1;
  color: #12715b;
  font-size: 17px;
}

.section-name {
  overflow: hidden;
  font-size: 13px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-actions {
  display: inline-flex;
  align-items: center;
  align-self: center;
  gap: 2px;
  height: 28px;
}

.section-action {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #788983;
  font-size: 15px;
  line-height: 0;
  cursor: pointer;

  :deep(.n-icon) {
    display: block;
    line-height: 0;
  }

  &:hover {
    background: #e4eeea;
    color: #12715b;
  }

  &.is-danger:hover {
    background: #fff0f0;
    color: #c13d3d;
  }

  &:disabled {
    opacity: 0.38;
    cursor: not-allowed;

    &:hover,
    &.is-danger:hover {
      background: transparent;
      color: #788983;
    }
  }
}

.add-section-button {
  margin-top: 2px;
}

.add-section-menu {
  display: grid;
  min-width: 150px;
  gap: 10px;
  padding: 4px;

  :deep(.n-button) {
    justify-content: flex-start;
  }
}

.theme-field {
  display: grid;
  gap: 6px;
  color: #52615c;
  font-size: 12px;

  > span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
}

@media (max-width: 1180px) {
  .control-panel {
    border-right: 0;
  }

  .control-pinned,
  .control-content {
    width: min(100%, 420px);
    margin: 0 auto;
    padding-left: 18px;
    padding-right: 18px;
    box-sizing: border-box;
  }

  .control-pinned {
    padding-top: 18px;
  }

  .control-content {
    padding-bottom: 32px;
  }
}
</style>

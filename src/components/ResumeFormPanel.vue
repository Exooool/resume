<script setup lang="ts">
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  GripVertical,
  ImagePlus,
  Plus,
  Trash2,
  UserRound,
} from '@lucide/vue';
import {
  NButton,
  NCard,
  NDatePicker,
  NDynamicInput,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NPopconfirm,
  NRadioButton,
  NRadioGroup,
  NScrollbar,
  NTabPane,
  NTabs,
} from 'naive-ui';
import { computed, nextTick, ref, watch } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import draggable from 'vuedraggable';
import type {
  EducationItem,
  ProjectItem,
  ResumeData,
  ResumeSectionId,
  WorkExperienceItem,
} from '../types';

const props = defineProps<{
  resume: ResumeData;
  activeSection: ResumeSectionId;
}>();

const emit = defineEmits<{
  'update:active-section': [sectionId: ResumeSectionId];
  addEducation: [];
  removeEducation: [index: number];
  addWorkExperience: [];
  removeWorkExperience: [index: number];
  addProject: [];
  removeProject: [index: number];
}>();

const skillModeOptions = [
  {
    label: '列表编辑',
    value: 'list',
  },
  {
    label: '自定义文本',
    value: 'custom',
  },
] as const;

const collapsedIds = ref<Record<string, boolean>>({});
const avatarInputRef = ref<HTMLInputElement | null>(null);
const avatarUploadError = ref('');
const educationReorderMode = ref(false);
const workReorderMode = ref(false);
const projectsReorderMode = ref(false);
const educationScrollbarRef = ref<{ scrollTo: (options: { el: HTMLElement; behavior?: ScrollBehavior }) => void } | null>(null);
const workScrollbarRef = ref<{ scrollTo: (options: { el: HTMLElement; behavior?: ScrollBehavior }) => void } | null>(null);
const projectsScrollbarRef = ref<{ scrollTo: (options: { el: HTMLElement; behavior?: ScrollBehavior }) => void } | null>(null);
const itemCardRefs = ref<Record<string, HTMLElement>>({});

const draggableEducation = computed({
  get: () => props.resume.education,
  set: (items: EducationItem[]) => {
    props.resume.education.splice(0, props.resume.education.length, ...items);
  },
});

const draggableWorkExperience = computed({
  get: () => props.resume.workExperience,
  set: (items: WorkExperienceItem[]) => {
    props.resume.workExperience.splice(0, props.resume.workExperience.length, ...items);
  },
});

const draggableProjects = computed({
  get: () => props.resume.projects,
  set: (items: ProjectItem[]) => {
    props.resume.projects.splice(0, props.resume.projects.length, ...items);
  },
});

watch(
  () => props.activeSection,
  () => {
    educationReorderMode.value = false;
    workReorderMode.value = false;
    projectsReorderMode.value = false;
  },
);

const sectionLabels: Record<ResumeSectionId, string> = {
  basic: '基本信息',
  education: '教育经历',
  workExperience: '工作经历',
  projects: '项目经历',
  skills: '技术能力',
  summary: '自我总结',
};

const activeSectionTitle = computed(() => sectionLabels[props.activeSection]);

const MAX_AVATAR_FILE_SIZE = 10 * 1024 * 1024;
const AVATAR_WIDTH = 400;
const AVATAR_HEIGHT = 500;

function isCollapsed(id: string) {
  return Boolean(collapsedIds.value[id]);
}

function toggleCollapsed(id: string) {
  collapsedIds.value[id] = !collapsedIds.value[id];
}

function setCollapsedForIds(ids: string[], collapsed: boolean) {
  const next = { ...collapsedIds.value };
  ids.forEach((id) => {
    next[id] = collapsed;
  });
  collapsedIds.value = next;
}

function collapseAll(items: Array<{ id: string }>) {
  setCollapsedForIds(
    items.map((item) => item.id),
    true,
  );
}

function expandAll(items: Array<{ id: string }>) {
  setCollapsedForIds(
    items.map((item) => item.id),
    false,
  );
}

function getEducationLabel(item: EducationItem, index: number) {
  return item.school.trim() || '学校名称';
}

function getWorkLabel(item: WorkExperienceItem, index: number) {
  return item.company.trim() || '公司名称';
}

function getProjectLabel(item: ProjectItem, index: number) {
  return item.name.trim() || '项目名称';
}

function toggleEducationReorder() {
  educationReorderMode.value = !educationReorderMode.value;
}

function toggleWorkReorder() {
  workReorderMode.value = !workReorderMode.value;
}

function toggleProjectsReorder() {
  projectsReorderMode.value = !projectsReorderMode.value;
}

function setItemCardRef(id: string, el: Element | ComponentPublicInstance | null) {
  const element =
    el instanceof HTMLElement ? el : (el as ComponentPublicInstance | null)?.$el ?? null;

  if (element instanceof HTMLElement) {
    itemCardRefs.value[id] = element;
    return;
  }

  delete itemCardRefs.value[id];
}

async function scrollToEntryItem(
  section: 'education' | 'workExperience' | 'projects',
  itemId: string,
) {
  await nextTick();
  const target = itemCardRefs.value[itemId];
  if (!target) {
    return;
  }

  const scrollbar =
    section === 'education'
      ? educationScrollbarRef.value
      : section === 'workExperience'
        ? workScrollbarRef.value
        : projectsScrollbarRef.value;

  if (scrollbar) {
    scrollbar.scrollTo({ el: target, behavior: 'smooth' });
    return;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleAddEducation() {
  emit('addEducation');
  const items = props.resume.education;
  const lastItem = items[items.length - 1];
  if (!lastItem) {
    return;
  }

  collapsedIds.value[lastItem.id] = false;
  void scrollToEntryItem('education', lastItem.id);
}

function handleAddWorkExperience() {
  emit('addWorkExperience');
  const items = props.resume.workExperience;
  const lastItem = items[items.length - 1];
  if (!lastItem) {
    return;
  }

  collapsedIds.value[lastItem.id] = false;
  void scrollToEntryItem('workExperience', lastItem.id);
}

function handleAddProject() {
  emit('addProject');
  const items = props.resume.projects;
  const lastItem = items[items.length - 1];
  if (!lastItem) {
    return;
  }

  collapsedIds.value[lastItem.id] = false;
  void scrollToEntryItem('projects', lastItem.id);
}

function chooseAvatar() {
  avatarInputRef.value?.click();
}

function updateSkillItems(items: unknown[]) {
  props.resume.skillItems.splice(
    0,
    props.resume.skillItems.length,
    ...items.map((item) => (typeof item === 'string' ? item : '')),
  );
}

function updateSkillItem(index: number, value: string) {
  props.resume.skillItems[index] = value;
}

async function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file) {
    return;
  }

  avatarUploadError.value = '';
  if (!file.type.startsWith('image/')) {
    avatarUploadError.value = '请选择有效的图片文件';
    return;
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    avatarUploadError.value = '头像图片不能超过 10 MB';
    return;
  }

  try {
    const image = await loadImage(file);
    props.resume.basic.avatar = cropAvatar(image);
  } catch {
    avatarUploadError.value = '头像读取失败，请更换图片后重试';
  }
}

function removeAvatar() {
  props.resume.basic.avatar = '';
  avatarUploadError.value = '';
}

function handleTabUpdate(value: string) {
  if (value in sectionLabels) {
    emit('update:active-section', value as ResumeSectionId);
  }
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load avatar image'));
    };
    image.src = objectUrl;
  });
}

function cropAvatar(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context || !image.naturalWidth || !image.naturalHeight) {
    throw new Error('Invalid avatar image');
  }

  canvas.width = AVATAR_WIDTH;
  canvas.height = AVATAR_HEIGHT;

  const targetRatio = AVATAR_WIDTH / AVATAR_HEIGHT;
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, AVATAR_WIDTH, AVATAR_HEIGHT);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    AVATAR_WIDTH,
    AVATAR_HEIGHT,
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}
</script>

<template>
  <aside class="editor-panel">
    <header class="form-panel-header panel-header-bar">
      <p class="eyebrow">正在编辑</p>
      <h2>{{ activeSectionTitle }}</h2>
    </header>

    <n-tabs
      type="line"
      class="editor-tabs"
      :value="activeSection"
      @update:value="handleTabUpdate"
    >
      <n-tab-pane name="basic" tab="基本信息" display-directive="show">
        <n-scrollbar class="editor-scrollbar">
          <div class="editor-tab-content">
            <n-form label-placement="top" class="form-stack">
              <n-form-item label="个人头像" class="avatar-form-item">
                <div class="avatar-editor">
                  <div
                    class="avatar-editor-preview"
                    :class="{ 'has-avatar': resume.basic.avatar }"
                    role="button"
                    tabindex="0"
                    :title="resume.basic.avatar ? '点击更换头像' : '点击上传头像'"
                    @click="chooseAvatar"
                    @keydown.enter="chooseAvatar"
                  >
                    <img
                      v-if="resume.basic.avatar"
                      :src="resume.basic.avatar"
                      alt="个人头像预览"
                    />
                    <n-icon v-else :component="UserRound" />
                    <div v-if="resume.basic.avatar" class="avatar-replace-overlay">
                      <n-icon :component="ImagePlus" />
                    </div>
                    <n-popconfirm v-if="resume.basic.avatar" @positive-click="removeAvatar">
                      <template #trigger>
                        <button
                          type="button"
                          class="avatar-remove-btn"
                          title="移除头像"
                          @click.stop
                        >
                          <n-icon :component="Trash2" />
                        </button>
                      </template>
                      确定移除当前头像吗？
                    </n-popconfirm>
                  </div>
                  <input
                    ref="avatarInputRef"
                    class="avatar-file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    @change="handleAvatarChange"
                  />
                  <p v-if="avatarUploadError" class="avatar-upload-error" role="alert">
                    {{ avatarUploadError }}
                  </p>
                </div>
              </n-form-item>
              <div class="form-grid">
                <n-form-item label="姓名">
                  <n-input v-model:value="resume.basic.name" placeholder="请输入姓名" />
                </n-form-item>
                <n-form-item label="目标岗位">
                  <n-input v-model:value="resume.basic.title" placeholder="例如 前端开发工程师" />
                </n-form-item>
                <n-form-item label="手机号">
                  <n-input v-model:value="resume.basic.phone" placeholder="请输入手机号" />
                </n-form-item>
                <n-form-item label="邮箱">
                  <n-input v-model:value="resume.basic.email" placeholder="请输入邮箱" />
                </n-form-item>
                <n-form-item label="城市">
                  <n-input v-model:value="resume.basic.location" placeholder="请输入城市" />
                </n-form-item>
                <n-form-item label="个人网站">
                  <n-input v-model:value="resume.basic.website" placeholder="https://..." />
                </n-form-item>
              </div>
              <n-form-item label="GitHub">
                <n-input v-model:value="resume.basic.github" placeholder="github.com/..." />
              </n-form-item>
            </n-form>
          </div>
        </n-scrollbar>
      </n-tab-pane>

      <n-tab-pane name="education" tab="教育经历" display-directive="show">
        <div class="entry-tab-panel">
          <div class="section-actions section-actions-pinned">
            <div
              v-if="!educationReorderMode"
              class="section-collapse-actions"
              role="group"
              aria-label="折叠控制"
            >
              <button
                type="button"
                class="section-collapse-btn"
                title="全部折叠"
                aria-label="全部折叠"
                @click="collapseAll(resume.education)"
              >
                <n-icon :component="ChevronsDownUp" />
              </button>
              <button
                type="button"
                class="section-collapse-btn"
                title="全部展开"
                aria-label="全部展开"
                @click="expandAll(resume.education)"
              >
                <n-icon :component="ChevronsUpDown" />
              </button>
            </div>
            <div class="section-actions-right">
              <n-button
                secondary
                :type="educationReorderMode ? 'primary' : 'default'"
                :disabled="!educationReorderMode && resume.education.length < 2"
                @click="toggleEducationReorder"
              >
                <template #icon>
                  <n-icon :component="ArrowUpDown" />
                </template>
                {{ educationReorderMode ? '完成' : '调整顺序' }}
              </n-button>
              <n-button
                v-if="!educationReorderMode"
                type="primary"
                secondary
                @click="handleAddEducation"
              >
                <template #icon>
                  <n-icon :component="Plus" />
                </template>
                添加教育
              </n-button>
            </div>
          </div>

          <n-scrollbar ref="educationScrollbarRef" class="editor-scrollbar entry-tab-scrollbar">
            <div class="editor-tab-content">
              <draggable
                v-if="educationReorderMode"
                v-model="draggableEducation"
                class="item-reorder-list"
                item-key="id"
                handle=".item-drag-handle"
                :animation="240"
                easing="cubic-bezier(0.2, 0.8, 0.2, 1)"
                ghost-class="item-reorder-ghost"
                chosen-class="item-reorder-chosen"
                drag-class="item-reorder-drag"
              >
                <template #item="{ element, index }">
                  <div class="item-reorder-card">
                    <n-icon class="item-drag-handle" :component="GripVertical" title="拖拽排序" />
                    <span class="item-reorder-label">{{ getEducationLabel(element, index) }}</span>
                  </div>
                </template>
              </draggable>

              <div v-else class="item-list">
                <div
                  v-for="(education, index) in resume.education"
                  :key="education.id"
                  :ref="(el) => setItemCardRef(education.id, el)"
                  class="item-card-wrap"
                >
                  <n-card
                    class="item-card"
                    :class="{ 'is-collapsed': isCollapsed(education.id) }"
                    size="small"
                  >
                <template #header>
                  <div class="item-card-title">
                    <span>{{ getEducationLabel(education, index) }}</span>
                    <n-button
                      quaternary
                      circle
                      size="small"
                      :aria-label="isCollapsed(education.id) ? '展开' : '折叠'"
                      @click="toggleCollapsed(education.id)"
                    >
                      <template #icon>
                        <n-icon
                          :component="isCollapsed(education.id) ? ChevronRight : ChevronDown"
                        />
                      </template>
                    </n-button>
                  </div>
                </template>
                <template #header-extra>
                  <n-button
                    quaternary
                    circle
                    type="error"
                    @click="emit('removeEducation', index)"
                  >
                    <template #icon>
                      <n-icon :component="Trash2" />
                    </template>
                  </n-button>
                </template>

                <n-form
                  v-if="!isCollapsed(education.id)"
                  label-placement="top"
                  class="form-stack"
                >
                  <div class="form-grid">
                    <n-form-item label="学校" class="wide-form-item">
                      <n-input v-model:value="education.school" placeholder="学校名称" />
                    </n-form-item>
                    <n-form-item label="时间" class="date-range-form-item">
                      <n-date-picker
                        v-model:formatted-value="education.period"
                        class="date-range-picker"
                        type="monthrange"
                        value-format="yyyy.MM"
                        format="yyyy.MM"
                        clearable
                        start-placeholder="开始月份"
                        end-placeholder="结束月份"
                      />
                    </n-form-item>
                    <n-form-item label="学历">
                      <n-input v-model:value="education.degree" placeholder="本科 / 硕士" />
                    </n-form-item>
                    <n-form-item label="专业">
                      <n-input v-model:value="education.major" placeholder="专业名称" />
                    </n-form-item>
                  </div>
                  <n-form-item label="城市">
                    <n-input v-model:value="education.city" placeholder="所在城市" />
                  </n-form-item>
                  <n-form-item label="补充说明">
                    <n-dynamic-input
                      v-model:value="education.details"
                      class="education-details-input"
                      placeholder="课程、成绩、奖项等"
                    >
                      <template #default="{ value, index }">
                        <n-input
                          type="textarea"
                          :value="value"
                          placeholder="课程、成绩、奖项等"
                          :autosize="{ minRows: 2, maxRows: 8 }"
                          style="width: 100%"
                          @update:value="(v) => (education.details[index] = v)"
                        />
                      </template>
                    </n-dynamic-input>
                  </n-form-item>
                </n-form>
                  </n-card>
                </div>
              </div>
            </div>
          </n-scrollbar>
        </div>
      </n-tab-pane>

      <n-tab-pane name="workExperience" tab="工作经历" display-directive="show">
        <div class="entry-tab-panel">
          <div class="section-actions section-actions-pinned">
            <div
              v-if="!workReorderMode"
              class="section-collapse-actions"
              role="group"
              aria-label="折叠控制"
            >
              <button
                type="button"
                class="section-collapse-btn"
                title="全部折叠"
                aria-label="全部折叠"
                @click="collapseAll(resume.workExperience)"
              >
                <n-icon :component="ChevronsDownUp" />
              </button>
              <button
                type="button"
                class="section-collapse-btn"
                title="全部展开"
                aria-label="全部展开"
                @click="expandAll(resume.workExperience)"
              >
                <n-icon :component="ChevronsUpDown" />
              </button>
            </div>
            <div class="section-actions-right">
              <n-button
                secondary
                :type="workReorderMode ? 'primary' : 'default'"
                :disabled="!workReorderMode && resume.workExperience.length < 2"
                @click="toggleWorkReorder"
              >
                <template #icon>
                  <n-icon :component="ArrowUpDown" />
                </template>
                {{ workReorderMode ? '完成' : '调整顺序' }}
              </n-button>
              <n-button
                v-if="!workReorderMode"
                type="primary"
                secondary
                @click="handleAddWorkExperience"
              >
                <template #icon>
                  <n-icon :component="Plus" />
                </template>
                添加工作
              </n-button>
            </div>
          </div>

          <n-scrollbar ref="workScrollbarRef" class="editor-scrollbar entry-tab-scrollbar">
            <div class="editor-tab-content">
              <draggable
                v-if="workReorderMode"
                v-model="draggableWorkExperience"
                class="item-reorder-list"
                item-key="id"
                handle=".item-drag-handle"
                :animation="240"
                easing="cubic-bezier(0.2, 0.8, 0.2, 1)"
                ghost-class="item-reorder-ghost"
                chosen-class="item-reorder-chosen"
                drag-class="item-reorder-drag"
              >
                <template #item="{ element, index }">
                  <div class="item-reorder-card">
                    <n-icon class="item-drag-handle" :component="GripVertical" title="拖拽排序" />
                    <span class="item-reorder-label">{{ getWorkLabel(element, index) }}</span>
                  </div>
                </template>
              </draggable>

              <div v-else class="item-list">
                <div
                  v-for="(work, index) in resume.workExperience"
                  :key="work.id"
                  :ref="(el) => setItemCardRef(work.id, el)"
                  class="item-card-wrap"
                >
                  <n-card
                    class="item-card"
                    :class="{ 'is-collapsed': isCollapsed(work.id) }"
                    size="small"
                  >
                <template #header>
                  <div class="item-card-title">
                    <span>{{ getWorkLabel(work, index) }}</span>
                    <n-button
                      quaternary
                      circle
                      size="small"
                      :aria-label="isCollapsed(work.id) ? '展开' : '折叠'"
                      @click="toggleCollapsed(work.id)"
                    >
                      <template #icon>
                        <n-icon
                          :component="isCollapsed(work.id) ? ChevronRight : ChevronDown"
                        />
                      </template>
                    </n-button>
                  </div>
                </template>
                <template #header-extra>
                  <n-button
                    quaternary
                    circle
                    type="error"
                    @click="emit('removeWorkExperience', index)"
                  >
                    <template #icon>
                      <n-icon :component="Trash2" />
                    </template>
                  </n-button>
                </template>

                <n-form
                  v-if="!isCollapsed(work.id)"
                  label-placement="top"
                  class="form-stack"
                >
                  <div class="form-grid">
                    <n-form-item label="公司" class="wide-form-item">
                      <n-input v-model:value="work.company" placeholder="公司名称" />
                    </n-form-item>
                    <n-form-item label="时间" class="date-range-form-item">
                      <n-date-picker
                        v-model:formatted-value="work.period"
                        class="date-range-picker"
                        type="monthrange"
                        value-format="yyyy.MM"
                        format="yyyy.MM"
                        clearable
                        start-placeholder="开始月份"
                        end-placeholder="结束月份"
                      />
                    </n-form-item>
                    <n-form-item label="职位">
                      <n-input v-model:value="work.title" placeholder="职位名称" />
                    </n-form-item>
                    <n-form-item label="城市">
                      <n-input v-model:value="work.city" placeholder="所在城市" />
                    </n-form-item>
                  </div>
                  <n-form-item label="工作描述">
                    <n-input
                      v-model:value="work.description"
                      type="textarea"
                      placeholder="简要描述公司业务、团队与岗位职责"
                      :autosize="{ minRows: 2, maxRows: 8 }"
                    />
                  </n-form-item>
                  <n-form-item label="工作内容">
                    <n-dynamic-input
                      v-model:value="work.highlights"
                      class="education-details-input"
                      placeholder="职责、业绩、项目等"
                    >
                      <template #default="{ value, index: highlightIndex }">
                        <n-input
                          type="textarea"
                          :value="value"
                          placeholder="职责、业绩、项目等"
                          :autosize="{ minRows: 2, maxRows: 8 }"
                          style="width: 100%"
                          @update:value="(v) => (work.highlights[highlightIndex] = v)"
                        />
                      </template>
                    </n-dynamic-input>
                  </n-form-item>
                </n-form>
                  </n-card>
                </div>
              </div>
            </div>
          </n-scrollbar>
        </div>
      </n-tab-pane>

      <n-tab-pane name="projects" tab="项目经历" display-directive="show">
        <div class="entry-tab-panel">
          <div class="section-actions section-actions-pinned">
            <div
              v-if="!projectsReorderMode"
              class="section-collapse-actions"
              role="group"
              aria-label="折叠控制"
            >
              <button
                type="button"
                class="section-collapse-btn"
                title="全部折叠"
                aria-label="全部折叠"
                @click="collapseAll(resume.projects)"
              >
                <n-icon :component="ChevronsDownUp" />
              </button>
              <button
                type="button"
                class="section-collapse-btn"
                title="全部展开"
                aria-label="全部展开"
                @click="expandAll(resume.projects)"
              >
                <n-icon :component="ChevronsUpDown" />
              </button>
            </div>
            <div class="section-actions-right">
              <n-button
                secondary
                :type="projectsReorderMode ? 'primary' : 'default'"
                :disabled="!projectsReorderMode && resume.projects.length < 2"
                @click="toggleProjectsReorder"
              >
                <template #icon>
                  <n-icon :component="ArrowUpDown" />
                </template>
                {{ projectsReorderMode ? '完成' : '调整顺序' }}
              </n-button>
              <n-button
                v-if="!projectsReorderMode"
                type="primary"
                secondary
                @click="handleAddProject"
              >
                <template #icon>
                  <n-icon :component="Plus" />
                </template>
                添加项目
              </n-button>
            </div>
          </div>

          <n-scrollbar ref="projectsScrollbarRef" class="editor-scrollbar entry-tab-scrollbar">
            <div class="editor-tab-content">
              <draggable
                v-if="projectsReorderMode"
                v-model="draggableProjects"
                class="item-reorder-list"
                item-key="id"
                handle=".item-drag-handle"
                :animation="240"
                easing="cubic-bezier(0.2, 0.8, 0.2, 1)"
                ghost-class="item-reorder-ghost"
                chosen-class="item-reorder-chosen"
                drag-class="item-reorder-drag"
              >
                <template #item="{ element, index }">
                  <div class="item-reorder-card">
                    <n-icon class="item-drag-handle" :component="GripVertical" title="拖拽排序" />
                    <span class="item-reorder-label">{{ getProjectLabel(element, index) }}</span>
                  </div>
                </template>
              </draggable>

              <div v-else class="item-list">
                <div
                  v-for="(project, index) in resume.projects"
                  :key="project.id"
                  :ref="(el) => setItemCardRef(project.id, el)"
                  class="item-card-wrap"
                >
                  <n-card
                    class="item-card"
                    :class="{ 'is-collapsed': isCollapsed(project.id) }"
                    size="small"
                  >
                <template #header>
                  <div class="item-card-title">
                    <span>{{ getProjectLabel(project, index) }}</span>
                    <n-button
                      quaternary
                      circle
                      size="small"
                      :aria-label="isCollapsed(project.id) ? '展开' : '折叠'"
                      @click="toggleCollapsed(project.id)"
                    >
                      <template #icon>
                        <n-icon
                          :component="isCollapsed(project.id) ? ChevronRight : ChevronDown"
                        />
                      </template>
                    </n-button>
                  </div>
                </template>
                <template #header-extra>
                  <n-button quaternary circle type="error" @click="emit('removeProject', index)">
                    <template #icon>
                      <n-icon :component="Trash2" />
                    </template>
                  </n-button>
                </template>

                <n-form
                  v-if="!isCollapsed(project.id)"
                  label-placement="top"
                  class="form-stack"
                >
                  <div class="form-grid">
                    <n-form-item label="项目名称" class="wide-form-item">
                      <n-input v-model:value="project.name" placeholder="项目名称" />
                    </n-form-item>
                    <n-form-item label="时间" class="date-range-form-item">
                      <n-date-picker
                        v-model:formatted-value="project.period"
                        class="date-range-picker"
                        type="monthrange"
                        value-format="yyyy.MM"
                        format="yyyy.MM"
                        clearable
                        start-placeholder="开始月份"
                        end-placeholder="结束月份"
                      />
                    </n-form-item>
                    <n-form-item label="角色">
                      <n-input v-model:value="project.role" placeholder="负责角色" />
                    </n-form-item>
                    <n-form-item label="技术栈">
                      <n-input v-model:value="project.stack" placeholder="Vue / TypeScript / ..." />
                    </n-form-item>
                  </div>
                  <n-form-item label="项目描述">
                    <n-input
                      v-model:value="project.description"
                      type="textarea"
                      placeholder="简要描述项目背景、目标与职责"
                      :autosize="{ minRows: 2, maxRows: 8 }"
                    />
                  </n-form-item>
                  <n-form-item label="项目亮点">
                    <n-dynamic-input
                      v-model:value="project.highlights"
                      class="education-details-input"
                      placeholder="请输入项目亮点"
                    >
                      <template #default="{ value, index: highlightIndex }">
                        <n-input
                          type="textarea"
                          :value="value"
                          placeholder="请输入项目亮点"
                          :autosize="{ minRows: 2, maxRows: 8 }"
                          style="width: 100%"
                          @update:value="(v) => (project.highlights[highlightIndex] = v)"
                        />
                      </template>
                    </n-dynamic-input>
                  </n-form-item>
                </n-form>
                  </n-card>
                </div>
              </div>
            </div>
          </n-scrollbar>
        </div>
      </n-tab-pane>

      <n-tab-pane name="skills" tab="技术能力" display-directive="show">
        <n-scrollbar class="editor-scrollbar">
          <div class="editor-tab-content">
            <n-form label-placement="top" class="skill-mode-form">
              <n-form-item label="编辑方式">
                <n-radio-group
                  v-model:value="resume.skillMode"
                  class="skill-mode-control"
                >
                  <n-radio-button
                    v-for="option in skillModeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </n-radio-button>
                </n-radio-group>
              </n-form-item>
            </n-form>

            <n-form v-if="resume.skillMode === 'list'" label-placement="top">
              <n-form-item label="技术能力">
                <n-dynamic-input
                  :value="resume.skillItems"
                  class="education-details-input"
                  placeholder="请输入技术能力"
                  :on-create="() => ''"
                  @update:value="updateSkillItems"
                >
                  <template #default="{ value, index }">
                    <n-input
                      type="textarea"
                      :value="value"
                      placeholder="请输入技术能力"
                      :autosize="{ minRows: 2, maxRows: 8 }"
                      style="width: 100%"
                      @update:value="(v) => updateSkillItem(index, v)"
                    />
                  </template>
                </n-dynamic-input>
              </n-form-item>
            </n-form>

            <n-form v-else label-placement="top">
              <n-form-item label="技术能力">
                <n-input
                  v-model:value="resume.skillText"
                  type="textarea"
                  :autosize="{ minRows: 10, maxRows: 18 }"
                  placeholder="例如：前端：Vue / TypeScript / Vite&#10;工程化：Git / CI/CD / 单元测试"
                />
              </n-form-item>
            </n-form>
          </div>
        </n-scrollbar>
      </n-tab-pane>

      <n-tab-pane name="summary" tab="自我总结" display-directive="show">
        <n-scrollbar class="editor-scrollbar">
          <div class="editor-tab-content">
            <n-form label-placement="top">
              <n-form-item label="总结内容">
                <n-input
                  v-model:value="resume.summary"
                  type="textarea"
                  :autosize="{ minRows: 10, maxRows: 18 }"
                  placeholder="请输入自我总结"
                />
              </n-form-item>
            </n-form>
          </div>
        </n-scrollbar>
      </n-tab-pane>
    </n-tabs>
  </aside>
</template>

<style scoped lang="scss">
.editor-panel {
  display: flex;
  height: 100%;
  min-width: 0;
  min-height: 0;
  max-height: none;
  flex-direction: column;
  border-right: 1px solid #d7dedb;
  background: #fbfcfb;
}

.form-panel-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 24px;

  h2 {
    margin: 0;
    color: #17252c;
    font-size: 17px;
    line-height: 1.3;
  }
}

.panel-header {
  display: flex;
  flex-shrink: 0;
  align-items: stretch;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 24px 16px;

  h1 {
    margin: 0;
    overflow: hidden;
    color: #17252c;
    font-size: 24px;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.panel-header-title {
  min-width: 0;
}

.panel-header-actions {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  min-width: 0;

  > :deep(.n-button),
  > .panel-header-action-item {
    flex: 1 1 0;
    min-width: 0;
  }

  :deep(.n-button) {
    width: 100%;
    justify-content: center;
    white-space: nowrap;
  }
}

.panel-header-action-item {
  display: flex;
}

.more-config-panel {
  min-width: 180px;
  padding: 4px 2px;
}

.smart-one-page-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #31414b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.editor-scrollbar {
  height: 100%;
  min-width: 0;
}

.entry-tab-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.entry-tab-scrollbar {
  flex: 1;
  min-height: 0;
}

.section-actions-pinned {
  flex-shrink: 0;
  margin-bottom: 0;
  padding: 16px 24px 14px;
  border-bottom: 1px solid #e2e8e5;
  background: #fbfcfb;
}

.item-card-wrap {
  scroll-margin-top: 12px;
}

.editor-tabs {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;

  > :deep(.n-tabs-nav) {
    display: none;
  }

  :deep(.n-tabs-pane-wrapper) {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  :deep(.n-tab-pane) {
    height: 100%;
    padding: 0 !important;
  }
}

.editor-tab-content {
  padding: 16px 24px 28px;
  box-sizing: border-box;
}

.form-stack {
  display: grid;
  gap: 8px;
}

.education-details-input {
  width: 100%;

  :deep(.n-dynamic-input-item) {
    align-items: flex-start;
  }

  :deep(.n-input) {
    flex: 1;
    width: 100%;
    min-width: 0;
  }

  :deep(.n-input__textarea-el) {
    font-size: var(--n-font-size);
    line-height: 1.6;
    color: var(--n-text-color);
  }
}

.avatar-form-item {
  margin-bottom: 4px;
}

.avatar-editor {
  display: grid;
  gap: 8px;
  width: fit-content;
}

.avatar-editor-preview {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: 135px;
  overflow: hidden;
  border: 1px dashed #b9c9c2;
  border-radius: 9px;
  background: #f3f7f5;
  color: #82938c;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover,
  &:focus-visible {
    border-color: #9fc3b7;
    background: #edf5f1;
    outline: none;
  }

  &.has-avatar:hover .avatar-replace-overlay,
  &.has-avatar:focus-visible .avatar-replace-overlay,
  &.has-avatar:hover .avatar-remove-btn,
  &.has-avatar:focus-visible .avatar-remove-btn {
    opacity: 1;
    pointer-events: auto;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  :deep(.n-icon) {
    font-size: 42px;
  }
}

.avatar-replace-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(15 35 28 / 48%);
  color: #fff;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;

  :deep(.n-icon) {
    font-size: 33px;
  }
}

.avatar-remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgb(255 255 255 / 92%);
  color: #d03050;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  box-shadow: 0 1px 4px rgb(15 35 28 / 16%);
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: #fff;
    transform: scale(1.06);
  }

  :deep(.n-icon) {
    font-size: 14px;
  }
}

.avatar-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.avatar-upload-error {
  margin: 0;
  color: #c23b3b;
  font-size: 12px;
  line-height: 1.5;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 12px;
}

.section-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.section-actions-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.item-reorder-list {
  display: grid;
  gap: 8px;
}

.item-reorder-card {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 12px;
  border: 1px solid #d5e3dd;
  border-radius: 8px;
  background: #ffffff;
  color: #17302c;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease,
    box-shadow 0.16s ease;
}

.item-drag-handle {
  color: #a8b6b1;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.item-reorder-label {
  overflow: hidden;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-reorder-ghost {
  opacity: 0.45;
}

.item-reorder-chosen {
  border-color: #9fc3b7;
  background: #f0f7f4;
}

.item-reorder-drag {
  opacity: 0.92;
  box-shadow: 0 8px 20px rgb(34 55 47 / 12%);
}

.section-collapse-actions {
  display: inline-flex;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid #cfd9d5;
  border-radius: 999px;
  background: #ffffff;
}

.section-collapse-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 30px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #5b6b66;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  + .section-collapse-btn {
    border-left: 1px solid #cfd9d5;
  }

  &:hover {
    background: #eef5f1;
    color: #12715b;
  }

  &:focus-visible {
    outline: 2px solid #12715b;
    outline-offset: -2px;
  }

  :deep(.n-icon) {
    font-size: 15px;
  }
}

.skill-mode-form {
  margin-bottom: 8px;
}

.skill-mode-control {
  display: flex;
  width: 100%;

  :deep(.n-radio-button) {
    flex: 1;
    text-align: center;
  }
}

.date-range-picker {
  width: 100%;

  :deep(.n-date-picker-icon),
  :deep(.n-base-clear) {
    flex: 0 0 auto;
  }

  :deep(.n-date-picker-input) {
    min-width: 0;
  }
}

.wide-form-item,
.date-range-form-item {
  grid-column: 1 / -1;
}

.item-list {
  display: grid;
  gap: 14px;
}

.item-card-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.item-card.is-collapsed {
  :deep(.n-card-header) {
    border-bottom: 0;
  }

  :deep(.n-card__content) {
    display: none;
    padding: 0;
  }
}

@media (max-width: 1020px) {
  .panel-header {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .panel-header-actions {
    width: 100%;
    flex-wrap: wrap;

    > :deep(.n-button),
    > .panel-header-action-item {
      flex: 1 1 calc(50% - 4px);
    }

    :deep(.n-button) {
      width: 100%;
    }
  }

  .editor-tabs {
    > :deep(.n-tabs-nav) {
      padding: 0 16px;
    }

    :deep(.n-tabs-nav) {
      width: 100%;
      max-width: 100%;
    }

    :deep(.n-tabs-nav-scroll-wrapper) {
      overflow-x: auto !important;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    :deep(.n-tabs-nav-scroll-content) {
      display: flex;
      flex-wrap: nowrap;
      width: max-content;
      min-width: 100%;
    }

    :deep(.n-tabs-tab) {
      flex: 0 0 auto;
      padding-left: 10px;
      padding-right: 10px;
    }

    .form-stack,
    :deep(.n-form) {
      max-width: 100%;
      min-width: 0;
    }
  }

  .editor-tab-content {
    padding: 16px 16px 24px;
  }

  :global(.editor-route.is-compact) .editor-scrollbar {
    :deep(.n-scrollbar-container),
    :deep(.n-scrollbar-content) {
      max-width: 100%;
      min-width: 0;
    }
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

}

@media (max-width: 620px) {
  .panel-header {
    padding: 16px 16px 12px;

    h1 {
      font-size: 20px;
    }
  }

  .panel-action-label {
    display: inline;
  }
}
</style>

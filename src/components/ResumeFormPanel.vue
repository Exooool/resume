<script setup lang="ts">
import { ArrowLeft, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, LayoutGrid, Plus, Trash2 } from '@lucide/vue';
import {
  NButton,
  NCard,
  NDatePicker,
  NDynamicInput,
  NDynamicTags,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NRadioButton,
  NRadioGroup,
  NScrollbar,
  NTabPane,
  NTabs,
} from 'naive-ui';
import { ref } from 'vue';
import type { ResumeData } from '../types';

defineProps<{
  resume: ResumeData;
  resumeName: string;
  compact?: boolean;
}>();

const emit = defineEmits<{
  backToList: [];
  openTemplateChooser: [];
  addEducation: [];
  removeEducation: [index: number];
  addProject: [];
  removeProject: [index: number];
  addSkillGroup: [];
  removeSkillGroup: [index: number];
}>();

const skillModeOptions = [
  {
    label: '分类编辑',
    value: 'groups',
  },
  {
    label: '自定义文本',
    value: 'custom',
  },
] as const;

const collapsedIds = ref<Record<string, boolean>>({});

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
</script>

<template>
  <aside class="editor-panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">Resume Editor</p>
        <h1>{{ resumeName }}</h1>
      </div>
      <div class="panel-header-actions">
        <n-button secondary @click="emit('backToList')">
          <template #icon>
            <n-icon :component="ArrowLeft" />
          </template>
          <span class="panel-action-label">简历列表</span>
        </n-button>
        <n-button secondary @click="emit('openTemplateChooser')">
          <template #icon>
            <n-icon :component="LayoutGrid" />
          </template>
          <span class="panel-action-label">{{ compact ? '模板' : '模板选择' }}</span>
        </n-button>
      </div>
    </header>

    <n-tabs type="line" class="editor-tabs">
      <n-tab-pane name="basic" tab="基本信息" display-directive="show">
        <n-scrollbar class="editor-scrollbar">
          <div class="editor-tab-content">
            <n-form label-placement="top" class="form-stack">
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
        <n-scrollbar class="editor-scrollbar">
          <div class="editor-tab-content">
            <div class="section-actions">
              <div class="section-collapse-actions" role="group" aria-label="折叠控制">
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
              <n-button type="primary" secondary @click="emit('addEducation')">
                <template #icon>
                  <n-icon :component="Plus" />
                </template>
                添加教育
              </n-button>
            </div>

            <div class="item-list">
              <n-card
                v-for="(education, index) in resume.education"
                :key="education.id"
                class="item-card"
                :class="{ 'is-collapsed': isCollapsed(education.id) }"
                size="small"
              >
                <template #header>
                  <div class="item-card-title">
                    <span>教育经历 {{ index + 1 }}</span>
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
                      placeholder="课程、成绩、奖项等"
                    />
                  </n-form-item>
                </n-form>
              </n-card>
            </div>
          </div>
        </n-scrollbar>
      </n-tab-pane>

      <n-tab-pane name="projects" tab="项目经历" display-directive="show">
        <n-scrollbar class="editor-scrollbar">
          <div class="editor-tab-content">
            <div class="section-actions">
              <div class="section-collapse-actions" role="group" aria-label="折叠控制">
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
              <n-button type="primary" secondary @click="emit('addProject')">
                <template #icon>
                  <n-icon :component="Plus" />
                </template>
                添加项目
              </n-button>
            </div>

            <div class="item-list">
              <n-card
                v-for="(project, index) in resume.projects"
                :key="project.id"
                class="item-card"
                :class="{ 'is-collapsed': isCollapsed(project.id) }"
                size="small"
              >
                <template #header>
                  <div class="item-card-title">
                    <span>项目经历 {{ index + 1 }}</span>
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
                  <n-form-item label="项目亮点">
                    <n-dynamic-input
                      v-model:value="project.highlights"
                      placeholder="请输入项目亮点"
                    />
                  </n-form-item>
                </n-form>
              </n-card>
            </div>
          </div>
        </n-scrollbar>
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

            <div v-if="resume.skillMode === 'groups'" class="section-actions">
              <div class="section-collapse-actions" role="group" aria-label="折叠控制">
                <button
                  type="button"
                  class="section-collapse-btn"
                  title="全部折叠"
                  aria-label="全部折叠"
                  @click="collapseAll(resume.skillGroups)"
                >
                  <n-icon :component="ChevronsDownUp" />
                </button>
                <button
                  type="button"
                  class="section-collapse-btn"
                  title="全部展开"
                  aria-label="全部展开"
                  @click="expandAll(resume.skillGroups)"
                >
                  <n-icon :component="ChevronsUpDown" />
                </button>
              </div>
              <n-button type="primary" secondary @click="emit('addSkillGroup')">
                <template #icon>
                  <n-icon :component="Plus" />
                </template>
                添加分类
              </n-button>
            </div>

            <div v-if="resume.skillMode === 'groups'" class="item-list">
              <n-card
                v-for="(group, index) in resume.skillGroups"
                :key="group.id"
                class="item-card"
                :class="{ 'is-collapsed': isCollapsed(group.id) }"
                size="small"
              >
                <template #header>
                  <div class="item-card-title">
                    <span>技能分类 {{ index + 1 }}</span>
                    <n-button
                      quaternary
                      circle
                      size="small"
                      :aria-label="isCollapsed(group.id) ? '展开' : '折叠'"
                      @click="toggleCollapsed(group.id)"
                    >
                      <template #icon>
                        <n-icon
                          :component="isCollapsed(group.id) ? ChevronRight : ChevronDown"
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
                    @click="emit('removeSkillGroup', index)"
                  >
                    <template #icon>
                      <n-icon :component="Trash2" />
                    </template>
                  </n-button>
                </template>

                <n-form
                  v-if="!isCollapsed(group.id)"
                  label-placement="top"
                  class="form-stack"
                >
                  <n-form-item label="分类名称">
                    <n-input v-model:value="group.label" placeholder="前端 / 后端 / 工具" />
                  </n-form-item>
                  <n-form-item label="技能项">
                    <n-dynamic-tags v-model:value="group.skills" />
                  </n-form-item>
                </n-form>
              </n-card>
            </div>

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

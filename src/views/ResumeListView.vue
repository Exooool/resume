<script setup lang="ts">
import { Clock, Plus, Trash2 } from '@lucide/vue';
import {
  NButton,
  NEmpty,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NPopconfirm,
} from 'naive-ui';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ResumeListThumbnail from '../components/ResumeListThumbnail.vue';
import type { ResumeDocument } from '../types';
import { createPreviewBlocks } from '../utils/resume';
import {
  createResumeDocument,
  deleteResumeDocument,
  loadResumeDocuments,
} from '../utils/resumeStorage';

const router = useRouter();
const resumes = ref<ResumeDocument[]>([]);
const showCreateModal = ref(false);
const newResumeName = ref('');

const canCreateResume = computed(() => Boolean(newResumeName.value.trim()));

const resumeCards = computed(() =>
  resumes.value.map((resume) => ({
    resume,
    blocks: createPreviewBlocks(resume.data),
  })),
);

onMounted(() => {
  refreshResumes();
});

function refreshResumes() {
  resumes.value = loadResumeDocuments();
}

function openCreateModal() {
  newResumeName.value = '';
  showCreateModal.value = true;
}

function createResume() {
  const name = newResumeName.value.trim();
  if (!name) {
    return;
  }

  const document = createResumeDocument(name);
  showCreateModal.value = false;
  void router.push(`/editor/${document.id}`);
}

function openResume(id: string) {
  void router.push(`/editor/${id}`);
}

function removeResume(id: string) {
  deleteResumeDocument(id);
  refreshResumes();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
</script>

<template>
  <main class="resume-list-page">
    <header class="resume-list-header">
      <div>
        <p class="eyebrow">Resume Library</p>
        <h1>简历列表</h1>
      </div>

      <n-button type="primary" size="large" @click="openCreateModal">
        <template #icon>
          <n-icon :component="Plus" />
        </template>
        新增简历
      </n-button>
    </header>

    <section class="resume-list-panel">
      <div v-if="resumeCards.length" class="resume-list-grid">
        <article
          v-for="{ resume, blocks } in resumeCards"
          :key="resume.id"
          class="resume-list-card"
          role="button"
          tabindex="0"
          @click="openResume(resume.id)"
          @keyup.enter="openResume(resume.id)"
        >
          <ResumeListThumbnail
            :blocks="blocks"
            :template-id="resume.data.templateId"
          />

          <div class="resume-list-card-meta">
            <div class="resume-list-card-copy">
              <h2>{{ resume.name }}</h2>
              <p>
                <n-icon :component="Clock" />
                {{ formatDate(resume.createdAt) }}
              </p>
            </div>

            <n-popconfirm @positive-click="removeResume(resume.id)">
              <template #trigger>
                <n-button
                  secondary
                  type="error"
                  size="small"
                  @click.stop
                >
                  <template #icon>
                    <n-icon :component="Trash2" />
                  </template>
                </n-button>
              </template>
              确定删除这份简历吗？
            </n-popconfirm>
          </div>
        </article>
      </div>

      <div v-else class="resume-list-empty">
        <n-empty description="还没有简历">
          <template #extra>
            <n-button type="primary" @click="openCreateModal">
              <template #icon>
                <n-icon :component="Plus" />
              </template>
              新增简历
            </n-button>
          </template>
        </n-empty>
      </div>
    </section>

    <n-modal
      v-model:show="showCreateModal"
      preset="card"
      title="新建简历"
      class="resume-create-modal"
      :bordered="false"
    >
      <n-form label-placement="top" @submit.prevent="createResume">
        <n-form-item label="简历名称">
          <n-input
            v-model:value="newResumeName"
            autofocus
            placeholder="例如：前端开发简历"
            @keyup.enter="createResume"
          />
        </n-form-item>

        <div class="resume-create-actions">
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" :disabled="!canCreateResume" @click="createResume">
            创建并编辑
          </n-button>
        </div>
      </n-form>
    </n-modal>
  </main>
</template>

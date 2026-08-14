<script setup lang="ts">
import { Clock, Plus, Trash2 } from '@lucide/vue';
import {
  NButton,
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
    </header>

    <section class="resume-list-panel">
      <div class="resume-list-grid">
        <button
          type="button"
          class="resume-create-card"
          @click="openCreateModal"
        >
          <span class="resume-create-card-icon">
            <n-icon :component="Plus" />
          </span>
          <strong>创建新简历</strong>
        </button>

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

<style lang="scss">
.resume-list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  padding: clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px);
  background: #f5f8f6;
  color: #17302c;
}

.resume-list-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: min(1280px, 100%);
  margin: 0 auto 24px;
  padding: 0 24px;

  h1 {
    margin: 0;
    color: #10251f;
    font-size: 34px;
    line-height: 1.2;
  }
}

.resume-list-panel {
  flex: 1;
  min-height: 0;
  width: min(1280px, 100%);
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #b7c9c2 transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: #b7c9c2;

    &:hover {
      background: #95ada3;
    }
  }
}

.resume-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 230px));
  justify-content: start;
  gap: 16px;
  align-content: start;
  width: 100%;
  padding: 18px 24px 40px;
  box-sizing: border-box;
}

.resume-list-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #d5e3dd;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover,
  &:focus-visible {
    border-color: #9fc4b6;
    outline: none;
    box-shadow: 0 12px 28px rgba(18, 113, 91, 0.14);
    transform: translateY(-2px);
  }
}

.resume-list-card .resume-list-card-preview {
  height: 260px !important;
  aspect-ratio: auto;
}

.resume-create-card {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 14px;
  min-height: 330px;
  padding: 24px;
  border: 1px dashed #c8d8d2;
  border-radius: 10px;
  background: #ffffff;
  color: #5f746d;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease, transform 0.2s ease;

  &:hover,
  &:focus-visible {
    border-color: #65a591;
    outline: none;
    box-shadow: 0 12px 28px rgba(18, 113, 91, 0.12);
    color: #12715b;
    transform: translateY(-2px);
  }

  strong {
    font-size: 15px;
    line-height: 1.4;
  }
}

.resume-create-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid #d4e0dc;
  border-radius: 999px;
  background: #ffffff;
  font-size: 24px;
}

.resume-list-card-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px 14px;
}

.resume-list-card-copy {
  min-width: 0;

  h2 {
    margin: 0 0 6px;
    overflow: hidden;
    color: #17252c;
    font-size: 15px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    color: #677a73;
    font-size: 12px;
  }
}

.resume-create-modal {
  width: min(420px, calc(100vw - 32px));
}

.resume-create-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 720px) {
  .resume-list-page {
    padding: 24px 16px 16px;
  }

  .resume-list-header {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 12px;
  }

  .resume-list-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(8px, 2vw, 12px);
    padding: clamp(10px, 2.5vw, 18px) clamp(12px, 4vw, 24px) clamp(28px, 5vw, 40px);
  }

  .resume-list-card .resume-list-card-preview {
    height: clamp(180px, 40vw, 260px) !important;
  }

  .resume-list-card-meta {
    gap: clamp(4px, 1.5vw, 6px);
    padding: clamp(6px, 1.8vw, 10px);
  }

  .resume-list-card-copy {
    h2 {
      font-size: 14px;
    }

    p {
      font-size: 11px;
      white-space: nowrap;
    }
  }

  .resume-create-card {
    min-height: clamp(240px, 50vw, 318px);
    padding: clamp(12px, 4vw, 16px);
  }
}

@media (max-width: 420px) {
  .resume-list-header h1 {
    font-size: 28px;
  }
}
</style>

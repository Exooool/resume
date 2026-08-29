<script setup lang="ts">
import { computed } from 'vue';
import type { PeriodRange, ResumeBlock } from '../types';

const props = defineProps<{
  block: ResumeBlock;
}>();

const contactItems = computed(() => {
  if (props.block.kind !== 'header') {
    return [];
  }

  const { phone, email, location, website, github } = props.block.basic;
  return [phone, email, location, website, github].filter(Boolean);
});

const textParagraphs = computed(() => {
  if (props.block.kind !== 'summary' && props.block.kind !== 'skillsText') {
    return [];
  }

  return props.block.text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
});

const showTopline = computed(() => {
  if (
    props.block.kind !== 'education' &&
    props.block.kind !== 'project' &&
    props.block.kind !== 'workExperience'
  ) {
    return false;
  }

  return props.block.showTopline !== false;
});

const showMeta = computed(() => {
  if (
    props.block.kind !== 'education' &&
    props.block.kind !== 'project' &&
    props.block.kind !== 'workExperience'
  ) {
    return false;
  }

  return props.block.showMeta !== false;
});

const showDescription = computed(() => {
  if (props.block.kind !== 'project' && props.block.kind !== 'workExperience') {
    return false;
  }

  return props.block.showDescription !== false && Boolean(props.block.item.description?.trim());
});

const educationDetails = computed(() => {
  if (props.block.kind !== 'education') {
    return [];
  }

  const details = props.block.item.details.filter(Boolean);
  if (!props.block.detailIndexes) {
    return details;
  }

  return props.block.detailIndexes
    .map((index) => details[index])
    .filter((detail): detail is string => Boolean(detail));
});

const workHighlights = computed(() => {
  if (props.block.kind !== 'workExperience') {
    return [];
  }

  const highlights = props.block.item.highlights.filter(Boolean);
  if (!props.block.highlightIndexes) {
    return highlights;
  }

  return props.block.highlightIndexes
    .map((index) => highlights[index])
    .filter((highlight): highlight is string => Boolean(highlight));
});

const projectHighlights = computed(() => {
  if (props.block.kind !== 'project') {
    return [];
  }

  const highlights = props.block.item.highlights.filter(Boolean);
  if (!props.block.highlightIndexes) {
    return highlights;
  }

  return props.block.highlightIndexes
    .map((index) => highlights[index])
    .filter((highlight): highlight is string => Boolean(highlight));
});

const skillItems = computed(() => {
  if (props.block.kind !== 'skills') {
    return [];
  }

  const items = props.block.items.filter(Boolean);
  if (!props.block.itemIndexes) {
    return items;
  }

  return props.block.itemIndexes
    .map((index) => items[index])
    .filter((item): item is string => Boolean(item));
});

const isEntryContinuation = computed(() => {
  if (
    props.block.kind !== 'education' &&
    props.block.kind !== 'project' &&
    props.block.kind !== 'workExperience'
  ) {
    return false;
  }

  if (props.block.kind === 'project' || props.block.kind === 'workExperience') {
    return (
      props.block.showTopline === false &&
      props.block.showMeta === false &&
      props.block.showDescription === false &&
      props.block.highlightIndexes !== undefined
    );
  }

  return props.block.showTopline === false && props.block.showMeta === false;
});

function formatPeriod(period: PeriodRange | string, fallback: string) {
  if (typeof period === 'string') {
    return period.trim() || fallback;
  }

  if (!period) {
    return fallback;
  }

  const [start, end] = period;
  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end || fallback;
}
</script>

<template>
  <article
    v-if="block.kind === 'header'"
    class="resume-block resume-header"
    :class="{ 'has-avatar': Boolean(block.basic.avatar) }"
  >
    <div class="resume-identity">
      <img
        v-if="block.basic.avatar"
        class="resume-avatar"
        :src="block.basic.avatar"
        alt="个人头像"
      />
      <div class="resume-identity-copy">
        <h1>{{ block.basic.name || '你的姓名' }}</h1>
        <p>{{ block.basic.title || '目标岗位' }}</p>
      </div>
    </div>
    <ul class="contact-list">
      <li v-for="item in contactItems" :key="item">{{ item }}</li>
    </ul>
  </article>

  <div v-else-if="block.kind === 'section'" class="resume-block section-heading">
    <span>{{ block.title }}</span>
  </div>

  <article
    v-else-if="block.kind === 'education'"
    class="resume-block entry-block"
    :class="{ 'is-continuation': isEntryContinuation }"
  >
    <div v-if="showTopline" class="entry-topline">
      <h3>{{ block.item.school || '学校名称' }}</h3>
      <time>{{ formatPeriod(block.item.period, '起止时间') }}</time>
    </div>
    <div v-if="showMeta" class="entry-meta">
      <span>{{ block.item.degree || '学历' }}</span>
      <span>{{ block.item.major || '专业' }}</span>
      <span v-if="block.item.city">{{ block.item.city }}</span>
    </div>
    <ul v-if="educationDetails.length" class="resume-list">
      <li v-for="detail in educationDetails" :key="detail">{{ detail }}</li>
    </ul>
  </article>

  <article
    v-else-if="block.kind === 'workExperience'"
    class="resume-block entry-block"
    :class="{ 'is-continuation': isEntryContinuation }"
  >
    <div v-if="showTopline" class="entry-topline">
      <h3>{{ block.item.company || '公司名称' }}</h3>
      <time>{{ formatPeriod(block.item.period, '起止时间') }}</time>
    </div>
    <div v-if="showMeta" class="entry-meta">
      <span>{{ block.item.title || '职位' }}</span>
      <span v-if="block.item.city">{{ block.item.city }}</span>
    </div>
    <p v-if="showDescription" class="entry-description">{{ block.item.description }}</p>
    <ul v-if="workHighlights.length" class="resume-list">
      <li v-for="highlight in workHighlights" :key="highlight">{{ highlight }}</li>
    </ul>
  </article>

  <article
    v-else-if="block.kind === 'project'"
    class="resume-block entry-block"
    :class="{ 'is-continuation': isEntryContinuation }"
  >
    <div v-if="showTopline" class="entry-topline">
      <h3>{{ block.item.name || '项目名称' }}</h3>
      <time>{{ formatPeriod(block.item.period, '项目时间') }}</time>
    </div>
    <div v-if="showMeta" class="entry-meta">
      <span>{{ block.item.role || '承担角色' }}</span>
      <span v-if="block.item.stack">{{ block.item.stack }}</span>
    </div>
    <p v-if="showDescription" class="entry-description">{{ block.item.description }}</p>
    <ul v-if="projectHighlights.length" class="resume-list">
      <li v-for="highlight in projectHighlights" :key="highlight">
        {{ highlight }}
      </li>
    </ul>
  </article>

  <article v-else-if="block.kind === 'skills'" class="resume-block">
    <ul v-if="skillItems.length" class="resume-list">
      <li v-for="(item, index) in skillItems" :key="`${block.id}-${index}`">{{ item }}</li>
    </ul>
  </article>

  <article v-else-if="block.kind === 'skillsText'" class="resume-block skill-text-block">
    <p v-for="paragraph in textParagraphs" :key="paragraph">{{ paragraph }}</p>
  </article>

  <article v-else class="resume-block summary-block">
    <p v-for="paragraph in textParagraphs" :key="paragraph">{{ paragraph }}</p>
  </article>
</template>

<style lang="scss" scoped>
.resume-block {
  margin-bottom: calc(18px * var(--resume-space-scale));
}

.resume-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  padding-bottom: calc(20px * var(--resume-space-scale));
  border-bottom: 2px solid #1f3a44;

  &.has-avatar {
    align-items: center;
  }

  h1 {
    margin: 0;
    color: #10181d;
    font-size: var(--resume-font-name);
    font-weight: 800;
    line-height: 1.1;
  }

  p {
    margin: calc(8px * var(--resume-space-scale)) 0 0;
    color: var(--resume-accent);
    font-size: var(--resume-font-title);
    font-weight: 700;
  }
}

.resume-identity {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.resume-identity-copy {
  min-width: 0;
}

.resume-avatar {
  flex: 0 0 auto;
  width: 76px;
  height: 95px;
  border: 1px solid #d5dfdb;
  border-radius: 4px;
  object-fit: cover;
}

.contact-list {
  display: grid;
  gap: 5px;
  min-width: 210px;
  margin: 0;
  padding: 2px 0 0;
  color: #41525b;
  font-size: var(--resume-font-contact);
  line-height: 1.45;
  list-style: none;
  text-align: right;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: calc(22px * var(--resume-space-scale));
  margin-bottom: calc(12px * var(--resume-space-scale));
  color: #13252d;
  font-size: var(--resume-font-section);
  font-weight: 800;

  &::after {
    flex: 1;
    height: 1px;
    background: #b9c6c2;
    content: '';
  }
}

.entry-block {
  color: #26343b;

  &.is-continuation {
    margin-top: 0;

    .resume-list {
      margin-top: 0;
    }
  }
}

.entry-topline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 20px;

  h3 {
    margin: 0;
    color: #17252c;
    font-size: var(--resume-font-entry);
    line-height: 1.45;
  }

  time {
    color: #60727a;
    font-size: var(--resume-font-body);
    white-space: nowrap;
  }
}

.entry-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 3px;
  color: #4c6169;
  font-size: var(--resume-font-body);
  line-height: 1.5;

  span + span::before {
    margin-right: 12px;
    color: #a8b5b1;
    content: '/';
  }
}

.entry-description {
  margin: calc(6px * var(--resume-space-scale)) 0 0;
  color: #304047;
  font-size: var(--resume-font-body);
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

.resume-list {
  display: grid;
  gap: calc(4px * var(--resume-space-scale));
  margin: calc(8px * var(--resume-space-scale)) 0 0;
  padding-left: 18px;
  color: #304047;
  font-size: var(--resume-font-body);
  line-height: 1.65;

  li {
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.skill-text-block,
.summary-block {
  display: grid;
  gap: 6px;
  margin-bottom: 7px;
  color: #304047;
  font-size: var(--resume-font-body);
  line-height: 1.75;

  p {
    margin: 0;
  }
}
</style>

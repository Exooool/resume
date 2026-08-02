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
  <article v-if="block.kind === 'header'" class="resume-block resume-header">
    <div>
      <h1>{{ block.basic.name || '你的姓名' }}</h1>
      <p>{{ block.basic.title || '目标岗位' }}</p>
    </div>
    <ul class="contact-list">
      <li v-for="item in contactItems" :key="item">{{ item }}</li>
    </ul>
  </article>

  <div v-else-if="block.kind === 'section'" class="resume-block section-heading">
    <span>{{ block.title }}</span>
  </div>

  <article v-else-if="block.kind === 'education'" class="resume-block entry-block">
    <div class="entry-topline">
      <h3>{{ block.item.school || '学校名称' }}</h3>
      <time>{{ formatPeriod(block.item.period, '起止时间') }}</time>
    </div>
    <div class="entry-meta">
      <span>{{ block.item.degree || '学历' }}</span>
      <span>{{ block.item.major || '专业' }}</span>
      <span v-if="block.item.city">{{ block.item.city }}</span>
    </div>
    <ul v-if="block.item.details.some(Boolean)" class="resume-list">
      <li v-for="detail in block.item.details.filter(Boolean)" :key="detail">{{ detail }}</li>
    </ul>
  </article>

  <article v-else-if="block.kind === 'project'" class="resume-block entry-block">
    <div class="entry-topline">
      <h3>{{ block.item.name || '项目名称' }}</h3>
      <time>{{ formatPeriod(block.item.period, '项目时间') }}</time>
    </div>
    <div class="entry-meta">
      <span>{{ block.item.role || '承担角色' }}</span>
      <span v-if="block.item.stack">{{ block.item.stack }}</span>
    </div>
    <ul v-if="block.item.highlights.some(Boolean)" class="resume-list">
      <li v-for="highlight in block.item.highlights.filter(Boolean)" :key="highlight">
        {{ highlight }}
      </li>
    </ul>
  </article>

  <article v-else-if="block.kind === 'skills'" class="resume-block skills-block">
    <div v-for="group in block.groups" :key="group.id" class="skill-row">
      <strong>{{ group.label || '技能分类' }}</strong>
      <span>{{ group.skills.filter(Boolean).join(' / ') || '技能项' }}</span>
    </div>
  </article>

  <article v-else-if="block.kind === 'skillsText'" class="resume-block skill-text-block">
    <p v-for="paragraph in textParagraphs" :key="paragraph">{{ paragraph }}</p>
  </article>

  <article v-else class="resume-block summary-block">
    <p v-for="paragraph in textParagraphs" :key="paragraph">{{ paragraph }}</p>
  </article>
</template>

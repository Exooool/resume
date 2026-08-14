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
  if (props.block.kind !== 'education' && props.block.kind !== 'project') {
    return false;
  }

  return props.block.showTopline !== false;
});

const showMeta = computed(() => {
  if (props.block.kind !== 'education' && props.block.kind !== 'project') {
    return false;
  }

  return props.block.showMeta !== false;
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

const skillGroups = computed(() => {
  if (props.block.kind !== 'skills') {
    return [];
  }

  const block = props.block;
  if (!block.groupIndexes) {
    return block.groups;
  }

  return block.groupIndexes
    .map((index) => block.groups[index])
    .filter((group): group is NonNullable<typeof group> => Boolean(group));
});

const isEntryContinuation = computed(() => {
  if (props.block.kind !== 'education' && props.block.kind !== 'project') {
    return false;
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
    <ul v-if="projectHighlights.length" class="resume-list">
      <li v-for="highlight in projectHighlights" :key="highlight">
        {{ highlight }}
      </li>
    </ul>
  </article>

  <article v-else-if="block.kind === 'skills'" class="resume-block skills-block">
    <div v-for="group in skillGroups" :key="group.id" class="skill-row">
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

<style lang="scss">
.resume-page {
  position: relative;
  width: 794px;
  height: 1123px;
  overflow: hidden;
  padding: 56px;
  background: #ffffff;
  box-shadow: 0 14px 44px rgba(25, 38, 45, 0.16);
  color: #202b31;
  font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
  --resume-space-scale: 1;
}

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
    font-size: 34px;
    font-weight: 800;
    line-height: 1.1;
  }

  p {
    margin: calc(8px * var(--resume-space-scale)) 0 0;
    color: #12715b;
    font-size: 16px;
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
  font-size: 12px;
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
  font-size: 16px;
  font-weight: 800;

  &::after {
    flex: 1;
    height: 1px;
    background: #b9c6c2;
    content: "";
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
    font-size: 15px;
    line-height: 1.45;
  }

  time {
    color: #60727a;
    font-size: 12px;
    white-space: nowrap;
  }
}

.entry-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 3px;
  color: #4c6169;
  font-size: 12px;
  line-height: 1.5;

  span + span::before {
    margin-right: 12px;
    color: #a8b5b1;
    content: "/";
  }
}

.resume-list {
  display: grid;
  gap: calc(4px * var(--resume-space-scale));
  margin: calc(8px * var(--resume-space-scale)) 0 0;
  padding-left: 18px;
  color: #304047;
  font-size: 12px;
  line-height: 1.65;
}

.skills-block {
  display: grid;
  gap: 7px;
}

.skill-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 12px;
  color: #304047;
  font-size: 12px;
  line-height: 1.65;

  strong {
    color: #17252c;
  }
}

.skill-text-block,
.summary-block {
  display: grid;
  gap: 6px;
  margin-bottom: 7px;
  color: #304047;
  font-size: 12px;
  line-height: 1.75;

  p {
    margin: 0;
  }
}

.resume-template-fresh {
  color: #26363a;

  .resume-header {
    align-items: center;
    margin: -10px -8px 20px;
    padding: 22px 24px;
    border-bottom: 0;
    background: #eef7f4;

    h1 {
      color: #12352d;
      font-size: 32px;
    }

    p {
      color: #0f7a62;
    }
  }

  .contact-list {
    color: #4b6760;
  }

  .section-heading {
    justify-content: flex-start;
    gap: 10px;
    margin-top: calc(20px * var(--resume-space-scale));
    color: #0f7a62;
    font-size: 15px;

    &::before {
      width: 6px;
      height: 18px;
      background: #0f7a62;
      content: "";
    }

    &::after {
      background: #d1e4de;
    }
  }
}

.resume-template-compact {
  padding: 46px 52px;

  .resume-block {
    margin-bottom: calc(12px * var(--resume-space-scale));
  }

  .resume-header {
    padding-bottom: 14px;

    h1 {
      font-size: 30px;
    }

    p {
      margin-top: 5px;
      font-size: 14px;
    }
  }

  .resume-avatar {
    width: 64px;
    height: 80px;
  }

  .contact-list,
  .entry-meta,
  .entry-topline time,
  .resume-list,
  .skill-row,
  .skill-text-block,
  .summary-block {
    font-size: 11px;
  }

  .section-heading {
    margin-top: calc(16px * var(--resume-space-scale));
    margin-bottom: calc(8px * var(--resume-space-scale));
    font-size: 14px;
  }

  .resume-list {
    gap: 2px;
    margin-top: 5px;
  }
}

.resume-template-sidebar {
  padding-left: 76px;

  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 22px;
    background: #12715b;
    content: "";
  }

  .resume-header {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding-bottom: 18px;
    border-bottom: 1px solid #b9c6c2;

    h1 {
      color: #10251f;
      font-size: 36px;
    }
  }

  .contact-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    min-width: 0;
    text-align: left;
  }

  .section-heading {
    gap: 10px;
    color: #10251f;

    &::before {
      width: 8px;
      height: 8px;
      background: #12715b;
      content: "";
    }
  }
}

.resume-template-slate {
  padding: 52px 58px;
  color: #293b45;

  .resume-header {
    margin: -18px -18px 24px;
    padding: 24px 22px;
    border-bottom: 3px solid #315f7d;
    background: #eef5f7;

    h1 {
      color: #19384b;
    }

    p {
      color: #315f7d;
    }
  }

  .section-heading {
    color: #315f7d;

    &::after {
      background: #c5d7df;
    }
  }

  .entry-topline h3,
  .skill-row strong {
    color: #264b62;
  }
}

.resume-template-ink {
  padding: 54px 62px;
  color: #2e3438;

  .resume-header {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding-bottom: 24px;
    border-bottom: 1px solid #111820;

    h1 {
      color: #111820;
      font-size: 40px;
      font-weight: 750;
    }

    p {
      color: #4d5960;
    }
  }

  .contact-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 14px;
    min-width: 0;
    text-align: left;
  }

  .section-heading {
    color: #111820;

    &::after {
      height: 2px;
      background: #111820;
    }
  }

  .entry-topline h3,
  .skill-row strong {
    color: #111820;
  }
}

.resume-template-cards {
  padding: 48px 54px;

  .resume-header {
    margin: -8px -8px 22px;
    padding: 22px 24px;
    border: 0;
    border-left: 6px solid #12715b;
    background: #f0f6f3;

    h1 {
      color: #173d34;
    }
  }

  .section-heading {
    gap: 0;
    margin-top: calc(18px * var(--resume-space-scale));
    margin-bottom: calc(8px * var(--resume-space-scale));
    padding: 8px 12px;
    border-radius: 4px;
    background: #eef5f2;
    color: #17644f;
    font-size: 14px;

    &::after {
      display: none;
    }
  }

  .entry-block,
  .skills-block,
  .summary-block {
    padding: 10px 12px;
    border-left: 2px solid #d5e6df;
    background: #fbfcfb;
  }

  .entry-topline h3,
  .skill-row strong {
    color: #17644f;
  }
}

.resume-template-timeline {
  padding: 52px 60px 52px 74px;

  .resume-header {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding-bottom: 20px;
    border-bottom: 1px solid #b9cfc5;

    h1 {
      color: #173d34;
    }
  }

  .contact-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 14px;
    min-width: 0;
    text-align: left;
  }

  .section-heading {
    position: relative;
    gap: 10px;
    margin-left: -24px;
    color: #17644f;

    &::before {
      width: 10px;
      height: 10px;
      border: 3px solid #ffffff;
      border-radius: 999px;
      background: #12715b;
      box-shadow: 0 0 0 1px #12715b;
      content: "";
    }

    &::after {
      background: #c5d9d0;
    }
  }

  .entry-block {
    position: relative;
    margin-left: -18px;
    padding: 2px 0 10px 28px;
    border-left: 1px solid #b9cfc5;

    &::before {
      position: absolute;
      top: 8px;
      left: -5px;
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #12715b;
      content: "";
    }
  }

  .entry-topline h3,
  .skill-row strong {
    color: #17644f;
  }
}

.resume-template-minimal {
  padding: 68px;
  color: #3f4d48;

  .resume-header {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding-bottom: 26px;
    border-bottom: 1px solid #d8e1dd;

    h1 {
      color: #24332e;
      font-size: 38px;
      font-weight: 700;
    }

    p {
      color: #6a7b74;
      font-weight: 600;
    }
  }

  .contact-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 14px;
    min-width: 0;
    text-align: left;
  }

  .resume-block {
    margin-bottom: calc(22px * var(--resume-space-scale));
  }

  .section-heading {
    margin-top: calc(28px * var(--resume-space-scale));
    margin-bottom: calc(15px * var(--resume-space-scale));
    color: #66766f;
    font-size: 13px;

    &::after {
      background: #d8e1dd;
    }
  }

  .entry-topline h3,
  .skill-row strong {
    color: #2d4038;
  }
}
</style>

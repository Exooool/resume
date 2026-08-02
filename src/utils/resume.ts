import type {
  EducationItem,
  PeriodRange,
  ProjectItem,
  ResumeBlock,
  ResumeData,
} from '../types';

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_PAGE_HEIGHT = 1123;
export const A4_PAGE_VERTICAL_PADDING = 56;
export const PREVIEW_CONTENT_HEIGHT = A4_PAGE_HEIGHT - A4_PAGE_VERTICAL_PADDING * 2;

export function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function cloneResumeData(resume: ResumeData): ResumeData {
  return JSON.parse(JSON.stringify(resume)) as ResumeData;
}

export function createPreviewBlocks(resume: ResumeData) {
  const blocks: ResumeBlock[] = [{ id: 'header', kind: 'header', basic: resume.basic }];

  const educationItems = resume.education.filter(hasEducationContent);
  if (educationItems.length) {
    blocks.push({ id: 'section-education', kind: 'section', title: '教育经历' });
    educationItems.forEach((item) => {
      blocks.push({ id: item.id, kind: 'education', item });
    });
  }

  const projectItems = resume.projects.filter(hasProjectContent);
  if (projectItems.length) {
    blocks.push({ id: 'section-projects', kind: 'section', title: '项目经历' });
    projectItems.forEach((item) => {
      blocks.push({ id: item.id, kind: 'project', item });
    });
  }

  if (resume.skillMode === 'custom') {
    const skillTextBlocks = splitTextBlocks(resume.skillText);
    if (skillTextBlocks.length) {
      blocks.push({ id: 'section-skills', kind: 'section', title: '技术能力' });
      skillTextBlocks.forEach((text, index) => {
        blocks.push({ id: `skills-text-${index}`, kind: 'skillsText', text });
      });
    }
  } else {
    const skillGroups = resume.skillGroups.filter(
      (group) => group.label.trim() || group.skills.some(Boolean),
    );
    if (skillGroups.length) {
      blocks.push({ id: 'section-skills', kind: 'section', title: '技术能力' });
      blocks.push({ id: 'skills', kind: 'skills', groups: skillGroups });
    }
  }

  const summaryBlocks = splitTextBlocks(resume.summary);
  if (summaryBlocks.length) {
    blocks.push({ id: 'section-summary', kind: 'section', title: '自我总结' });
    summaryBlocks.forEach((text, index) => {
      blocks.push({ id: `summary-${index}`, kind: 'summary', text });
    });
  }

  return blocks;
}

function hasEducationContent(item: EducationItem) {
  return hasPeriodContent(item.period) || [
    item.school,
    item.degree,
    item.major,
    item.city,
    ...item.details,
  ].some((value) => value.trim());
}

function hasProjectContent(item: ProjectItem) {
  return hasPeriodContent(item.period) || [
    item.name,
    item.role,
    item.stack,
    ...item.highlights,
  ].some((value) => value.trim());
}

function hasPeriodContent(period: PeriodRange | string) {
  if (typeof period === 'string') {
    return Boolean(period.trim());
  }

  return Boolean(period?.some((value) => value.trim()));
}

function splitTextBlocks(text: string) {
  return text
    .split('\n')
    .flatMap((paragraph) => splitLongText(paragraph.trim(), 180))
    .filter(Boolean);
}

function splitLongText(text: string, maxLength: number) {
  if (!text) {
    return [];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    const punctuationBreak = Math.max(
      remaining.lastIndexOf('。', maxLength),
      remaining.lastIndexOf('；', maxLength),
      remaining.lastIndexOf('，', maxLength),
      remaining.lastIndexOf(',', maxLength),
      remaining.lastIndexOf(' ', maxLength),
    );
    const breakAt = punctuationBreak > maxLength * 0.5 ? punctuationBreak + 1 : maxLength;

    chunks.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

import type {
  EducationItem,
  PeriodRange,
  ProjectItem,
  ResumeBlock,
  ResumeData,
  ResumeSectionId,
  ResumeTypography,
  WorkExperienceItem,
} from '../types';
import { DEFAULT_RESUME_TYPOGRAPHY, RESUME_SECTION_IDS } from '../types';

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

export function normalizeResumeTypography(value: unknown): ResumeTypography {
  const source = value && typeof value === 'object' ? (value as Partial<ResumeTypography>) : {};

  return {
    nameSize: clampTypographySize(source.nameSize, DEFAULT_RESUME_TYPOGRAPHY.nameSize, 24, 48),
    titleSize: clampTypographySize(source.titleSize, DEFAULT_RESUME_TYPOGRAPHY.titleSize, 12, 24),
    sectionSize: clampTypographySize(source.sectionSize, DEFAULT_RESUME_TYPOGRAPHY.sectionSize, 12, 24),
    entrySize: clampTypographySize(source.entrySize, DEFAULT_RESUME_TYPOGRAPHY.entrySize, 12, 20),
    bodySize: clampTypographySize(source.bodySize, DEFAULT_RESUME_TYPOGRAPHY.bodySize, 10, 16),
    contactSize: clampTypographySize(source.contactSize, DEFAULT_RESUME_TYPOGRAPHY.contactSize, 10, 16),
  };
}

function clampTypographySize(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

export function createPreviewBlocks(resume: ResumeData) {
  const blocks: ResumeBlock[] = [];
  const hiddenSections = new Set(resume.hiddenSections ?? []);
  const sectionOrder = normalizeSectionOrder(resume.sectionOrder);

  sectionOrder.forEach((sectionId) => {
    if (hiddenSections.has(sectionId)) {
      return;
    }

    appendSectionBlocks(blocks, sectionId, resume);
  });

  return blocks;
}

function normalizeSectionOrder(sectionOrder: ResumeSectionId[] | undefined): ResumeSectionId[] {
  const order = [...new Set(sectionOrder ?? RESUME_SECTION_IDS)];
  return ['basic', ...order.filter((sectionId): sectionId is ResumeSectionId => sectionId !== 'basic')];
}

function appendSectionBlocks(
  blocks: ResumeBlock[],
  sectionId: ResumeSectionId,
  resume: ResumeData,
) {
  if (sectionId === 'basic') {
    blocks.push({ id: 'header', kind: 'header', basic: resume.basic });
    return;
  }

  if (sectionId === 'education') {
    const educationItems = resume.education.filter(hasEducationContent);
    if (educationItems.length) {
      blocks.push({ id: 'section-education', kind: 'section', title: '教育经历' });
      educationItems.forEach((item) => blocks.push({ id: item.id, kind: 'education', item }));
    }
    return;
  }

  if (sectionId === 'workExperience') {
    const workItems = resume.workExperience.filter(hasWorkExperienceContent);
    if (workItems.length) {
      blocks.push({ id: 'section-workExperience', kind: 'section', title: '工作经历' });
      workItems.forEach((item) => blocks.push({ id: item.id, kind: 'workExperience', item }));
    }
    return;
  }

  if (sectionId === 'projects') {
    const projectItems = resume.projects.filter(hasProjectContent);
    if (projectItems.length) {
      blocks.push({ id: 'section-projects', kind: 'section', title: '项目经历' });
      projectItems.forEach((item) => blocks.push({ id: item.id, kind: 'project', item }));
    }
    return;
  }

  if (sectionId === 'skills') {
    if (resume.skillMode === 'custom') {
      const skillTextBlocks = splitTextBlocks(resume.skillText);
      if (skillTextBlocks.length) {
        blocks.push({ id: 'section-skills', kind: 'section', title: '技术能力' });
        skillTextBlocks.forEach((text, index) => {
          blocks.push({ id: `skills-text-${index}`, kind: 'skillsText', text });
        });
      }
      return;
    }

    const skillItems = resume.skillItems.filter((item) => item.trim());
    if (skillItems.length) {
      blocks.push({ id: 'section-skills', kind: 'section', title: '技术能力' });
      blocks.push({ id: 'skills', kind: 'skills', items: skillItems });
    }
    return;
  }

  const summaryBlocks = splitTextBlocks(resume.summary);
  if (summaryBlocks.length) {
    blocks.push({ id: 'section-summary', kind: 'section', title: '自我总结' });
    summaryBlocks.forEach((text, index) => {
      blocks.push({ id: `summary-${index}`, kind: 'summary', text });
    });
  }
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

function hasWorkExperienceContent(item: WorkExperienceItem) {
  return hasPeriodContent(item.period) || [
    item.company,
    item.title,
    item.city,
    item.description,
    ...item.highlights,
  ].some((value) => value.trim());
}

function hasProjectContent(item: ProjectItem) {
  return hasPeriodContent(item.period) || [
    item.name,
    item.role,
    item.stack,
    item.description,
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

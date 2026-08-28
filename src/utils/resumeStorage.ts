import { createBlankResume } from '../data/defaultResume';
import { RESUME_SECTION_IDS } from '../types';
import type { ProjectItem, ResumeData, ResumeDocument, ResumeSectionId, SkillEditMode } from '../types';
import { cloneResumeData, makeId } from './resume';

const STORAGE_KEY = 'resume-editor-documents-v1';

export function loadResumeDocuments() {
  const documents = readStoredDocuments();
  return documents.sort(
    (first, second) =>
      new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
  );
}

export function getResumeDocument(id: string) {
  return readStoredDocuments().find((document) => document.id === id) ?? null;
}

export function createResumeDocument(name: string) {
  const createdAt = new Date().toISOString();
  const document: ResumeDocument = {
    id: makeId('resume'),
    name,
    createdAt,
    updatedAt: createdAt,
    data: createBlankResume(),
  };

  writeStoredDocuments([document, ...readStoredDocuments()]);
  return document;
}

export function updateResumeDocument(id: string, data: ResumeData) {
  const documents = readStoredDocuments();
  const index = documents.findIndex((document) => document.id === id);
  if (index < 0) {
    return null;
  }

  const updatedAt = new Date().toISOString();
  const nextDocument: ResumeDocument = {
    ...documents[index],
    updatedAt,
    data: cloneResumeData(data),
  };

  documents.splice(index, 1, nextDocument);
  writeStoredDocuments(documents);
  return nextDocument;
}

export function deleteResumeDocument(id: string) {
  writeStoredDocuments(readStoredDocuments().filter((document) => document.id !== id));
}

function readStoredDocuments() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map(normalizeResumeDocument)
      .filter((document): document is ResumeDocument => Boolean(document));
  } catch {
    return [];
  }
}

function writeStoredDocuments(documents: ResumeDocument[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}

function normalizeResumeDocument(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Partial<ResumeDocument>;
  if (!source.id || !source.name || !source.data) {
    return null;
  }

  const createdAt = normalizeIsoDate(source.createdAt);
  const updatedAt = normalizeIsoDate(source.updatedAt);

  return {
    id: String(source.id),
    name: String(source.name),
    createdAt,
    updatedAt,
    data: normalizeResumeData(source.data),
  };
}

function normalizeResumeData(value: unknown): ResumeData {
  const fallback = createBlankResume();
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const source = value as Partial<ResumeData> & { skillGroups?: Array<{ skills?: string[] }> };
  const shouldInjectWorkExperience = !('workExperience' in source);
  const sectionOrder = normalizeSectionOrder(source.sectionOrder, shouldInjectWorkExperience);
  const hiddenSections = Array.isArray(source.hiddenSections)
    ? source.hiddenSections.filter(isResumeSectionId).filter((id) => id !== 'basic')
    : fallback.hiddenSections;
  const { skillGroups: _legacySkillGroups, ...restSource } = source;
  return {
    ...fallback,
    ...restSource,
    basic: {
      ...fallback.basic,
      ...(source.basic ?? {}),
      avatar:
        typeof source.basic?.avatar === 'string'
          ? source.basic.avatar
          : fallback.basic.avatar,
    },
    education: Array.isArray(source.education) ? source.education : fallback.education,
    workExperience: Array.isArray(source.workExperience)
      ? source.workExperience
      : fallback.workExperience,
    projects: Array.isArray(source.projects)
      ? source.projects.map((item) => normalizeProjectItem(item))
      : fallback.projects,
    skillMode: normalizeSkillMode(source.skillMode),
    skillItems: normalizeSkillItems(source, fallback.skillItems),
    skillText: typeof source.skillText === 'string' ? source.skillText : fallback.skillText,
    summary: typeof source.summary === 'string' ? source.summary : fallback.summary,
    smartOnePage: Boolean(source.smartOnePage),
    sectionOrder,
    hiddenSections,
    theme: {
      fontFamily:
        typeof source.theme?.fontFamily === 'string'
          ? source.theme.fontFamily
          : fallback.theme.fontFamily,
      accentColor:
        typeof source.theme?.accentColor === 'string'
          ? source.theme.accentColor
          : fallback.theme.accentColor,
    },
  };
}

function normalizeSectionOrder(
  value: unknown,
  injectWorkExperience = false,
): ResumeSectionId[] {
  if (!Array.isArray(value)) {
    return pinBasicSectionFirst([...RESUME_SECTION_IDS]);
  }

  const order = [...new Set(value.filter(isResumeSectionId))];
  if (injectWorkExperience && !order.includes('workExperience')) {
    const educationIndex = order.indexOf('education');
    order.splice(educationIndex >= 0 ? educationIndex + 1 : order.length, 0, 'workExperience');
  }
  return pinBasicSectionFirst(order);
}

function pinBasicSectionFirst(order: ResumeSectionId[]): ResumeSectionId[] {
  const unique = [...new Set(order)];
  if (!unique.includes('basic')) {
    unique.unshift('basic');
  }
  return ['basic', ...unique.filter((sectionId) => sectionId !== 'basic')];
}

function normalizeSkillMode(value: unknown): SkillEditMode {
  return value === 'custom' ? 'custom' : 'list';
}

function normalizeSkillItems(
  source: Partial<ResumeData> & { skillGroups?: Array<{ skills?: string[] }> },
  fallback: string[],
): string[] {
  if (Array.isArray(source.skillItems)) {
    const items = source.skillItems.map((item) => (typeof item === 'string' ? item : ''));
    return items.length ? items : [''];
  }

  if (Array.isArray(source.skillGroups)) {
    const migratedItems = source.skillGroups.flatMap((group) => {
      if (!group || typeof group !== 'object') {
        return [];
      }

      return Array.isArray(group.skills)
        ? group.skills.filter((skill): skill is string => typeof skill === 'string' && Boolean(skill.trim()))
        : [];
    });

    if (migratedItems.length) {
      return migratedItems;
    }
  }

  return fallback.length ? fallback : [''];
}

function normalizeProjectItem(value: unknown): ProjectItem {
  const item = (value && typeof value === 'object' ? value : {}) as Partial<ProjectItem>;
  return {
    id: typeof item.id === 'string' ? item.id : makeId('project'),
    name: typeof item.name === 'string' ? item.name : '',
    role: typeof item.role === 'string' ? item.role : '',
    period: Array.isArray(item.period) ? item.period : null,
    stack: typeof item.stack === 'string' ? item.stack : '',
    description: typeof item.description === 'string' ? item.description : '',
    highlights: Array.isArray(item.highlights)
      ? item.highlights.map((highlight) => (typeof highlight === 'string' ? highlight : ''))
      : [''],
  };
}

function isResumeSectionId(value: unknown): value is ResumeSectionId {
  return RESUME_SECTION_IDS.includes(value as ResumeSectionId);
}

function normalizeIsoDate(value: unknown) {
  if (typeof value === 'string' && !Number.isNaN(new Date(value).getTime())) {
    return value;
  }

  return new Date().toISOString();
}

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

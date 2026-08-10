import { createBlankResume } from '../data/defaultResume';
import type { ResumeData, ResumeDocument } from '../types';
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

  const source = value as Partial<ResumeData>;
  return {
    ...fallback,
    ...source,
    basic: {
      ...fallback.basic,
      ...(source.basic ?? {}),
      avatar:
        typeof source.basic?.avatar === 'string'
          ? source.basic.avatar
          : fallback.basic.avatar,
    },
    education: Array.isArray(source.education) ? source.education : fallback.education,
    projects: Array.isArray(source.projects) ? source.projects : fallback.projects,
    skillMode: source.skillMode === 'custom' ? 'custom' : 'groups',
    skillGroups: Array.isArray(source.skillGroups) ? source.skillGroups : fallback.skillGroups,
    skillText: typeof source.skillText === 'string' ? source.skillText : fallback.skillText,
    summary: typeof source.summary === 'string' ? source.summary : fallback.summary,
    smartOnePage: Boolean(source.smartOnePage),
  };
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

import type { ResumeData } from '../types';
import { cloneResumeData } from './resume';
import { parseResumeData } from './resumeStorage';

export const RESUME_JSON_VERSION = 1;

export interface ResumeJsonExport {
  version: number;
  name: string;
  exportedAt: string;
  data: ResumeData;
}

export function buildResumeJsonExport(name: string, data: ResumeData): ResumeJsonExport {
  return {
    version: RESUME_JSON_VERSION,
    name: name.trim() || '未命名简历',
    exportedAt: new Date().toISOString(),
    data: cloneResumeData(data),
  };
}

export function parseResumeJsonExport(raw: unknown) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('JSON 格式无效');
  }

  const source = raw as Partial<ResumeJsonExport> & { data?: unknown };

  if (source.version !== undefined && source.version !== RESUME_JSON_VERSION) {
    throw new Error(`不支持的 JSON 版本：${source.version}`);
  }

  const data = parseResumeData(source.data);
  const name =
    typeof source.name === 'string' && source.name.trim()
      ? source.name.trim()
      : data.basic.name.trim() || '导入的简历';

  return { name, data };
}

export function downloadResumeJson(name: string, data: ResumeData, fileName: string) {
  const payload = buildResumeJsonExport(name, data);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function readResumeJsonFile(file: File) {
  const text = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('JSON 文件解析失败');
  }

  return parseResumeJsonExport(parsed);
}

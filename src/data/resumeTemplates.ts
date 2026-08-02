import type { ResumeTemplateId } from '../types';

export interface ResumeTemplateOption {
  label: string;
  value: ResumeTemplateId;
  description: string;
}

export const resumeTemplateOptions: ResumeTemplateOption[] = [
  {
    label: '经典简约',
    value: 'classic',
    description: '清晰分区，适合大多数岗位',
  },
  {
    label: '清新线条',
    value: 'fresh',
    description: '浅色标题块，整体更轻盈',
  },
  {
    label: '紧凑专业',
    value: 'compact',
    description: '信息密度更高，适合内容较多',
  },
  {
    label: '侧边强调',
    value: 'sidebar',
    description: '左侧色带强化姓名和模块层次',
  },
  {
    label: '蓝灰专注',
    value: 'slate',
    description: '冷静蓝灰色块，适合技术和产品岗位',
  },
  {
    label: '墨线经典',
    value: 'ink',
    description: '黑白高对比，简历内容更利落',
  },
  {
    label: '分组卡片',
    value: 'cards',
    description: '浅色模块底纹，阅读节奏更清楚',
  },
  {
    label: '时间轴',
    value: 'timeline',
    description: '经历节点纵向串联，突出成长路径',
  },
  {
    label: '极简留白',
    value: 'minimal',
    description: '轻线条和大留白，适合简洁表达',
  },
];

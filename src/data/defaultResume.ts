import type { ResumeData } from '../types';
import { makeId } from '../utils/resume';

export function createBlankResume(): ResumeData {
  return {
    templateId: 'classic',
    basic: {
      name: '',
      title: '',
      phone: '',
      email: '',
      location: '',
      website: '',
      github: '',
    },
    education: [],
    projects: [],
    skillMode: 'groups',
    skillGroups: [],
    skillText: '',
    summary: '',
  };
}

export function createDefaultResume(): ResumeData {
  return {
    templateId: 'classic',
    basic: {
      name: '李明',
      title: '前端开发工程师',
      phone: '138 0000 0000',
      email: 'liming@example.com',
      location: '上海',
      website: 'liming.dev',
      github: 'github.com/liming',
    },
    education: [
      {
        id: makeId('edu'),
        school: '上海交通大学',
        degree: '本科',
        major: '计算机科学与技术',
        city: '上海',
        period: ['2020.09', '2024.06'],
        details: ['GPA 3.7 / 4.0，主修数据结构、操作系统、计算机网络。'],
      },
    ],
    projects: [
      {
        id: makeId('project'),
        name: '企业级简历管理平台',
        role: '前端负责人',
        period: ['2024.03', '2024.08'],
        stack: 'Vue 3 / TypeScript / Vite / Naive UI',
        highlights: [
          '负责编辑器、实时预览和导出流程，支持多模块表单与模板化渲染。',
          '抽象通用表单配置和数据校验，减少重复维护成本。',
        ],
      },
    ],
    skillMode: 'groups',
    skillGroups: [
      {
        id: makeId('skill'),
        label: '前端',
        skills: ['Vue', 'TypeScript', 'Vite', 'Naive UI'],
      },
      {
        id: makeId('skill'),
        label: '工程化',
        skills: ['Git', 'CI/CD', '单元测试', '性能优化'],
      },
    ],
    skillText:
      '前端：Vue / TypeScript / Vite / Naive UI\n工程化：Git / CI/CD / 单元测试 / 性能优化',
    summary:
      '具备扎实的前端工程能力，熟悉 Vue 技术栈和复杂表单场景，关注产品细节、代码质量与用户体验。能够独立推进从需求拆解、界面实现到交付验证的完整流程。',
  };
}

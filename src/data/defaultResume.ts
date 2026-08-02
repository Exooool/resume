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
    smartOnePage: false,
  };
}

export function createTemplateChooserSample(): ResumeData {
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
        degree: '硕士',
        major: '软件工程',
        city: '上海',
        period: ['2022.09', '2025.06'],
        details: ['研究方向：前端工程化与低代码平台。'],
      },
    ],
    projects: [
      {
        id: makeId('project'),
        name: '企业级简历管理平台',
        role: '前端负责人',
        period: ['2024.09', '2025.03'],
        stack: 'Vue 3 / TypeScript / Vite',
        highlights: [
          '负责编辑器、实时预览和导出流程。',
          '实现 A4 自动分页与多格式导出。',
        ],
      },
      {
        id: makeId('project'),
        name: '低代码表单搭建系统',
        role: '核心开发',
        period: ['2024.01', '2024.08'],
        stack: 'Vue 3 / Pinia / Element Plus',
        highlights: ['设计拖拽式表单设计器，支持联动规则配置。'],
      },
    ],
    skillMode: 'groups',
    skillGroups: [
      {
        id: makeId('skill'),
        label: '前端',
        skills: ['Vue 3', 'TypeScript', 'Vite'],
      },
      {
        id: makeId('skill'),
        label: '工程化',
        skills: ['Git', 'CI/CD', 'Vitest'],
      },
    ],
    skillText: '前端：Vue 3 / TypeScript / Vite\n工程化：Git / CI/CD / Vitest',
    summary: '熟悉 Vue 技术栈和复杂表单场景，关注代码质量与用户体验。',
    smartOnePage: false,
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
        degree: '硕士',
        major: '软件工程',
        city: '上海',
        period: ['2022.09', '2025.06'],
        details: [
          '研究方向：前端工程化与低代码平台，参与实验室开源组件库维护。',
          'GPA 3.8 / 4.0，核心课程：分布式系统、软件体系结构、人机交互。',
        ],
      },
      {
        id: makeId('edu'),
        school: '华东师范大学',
        degree: '本科',
        major: '计算机科学与技术',
        city: '上海',
        period: ['2018.09', '2022.06'],
        details: [
          'GPA 3.7 / 4.0，主修数据结构、操作系统、计算机网络、数据库系统。',
          '获得校级一等奖学金 2 次，优秀毕业生。',
        ],
      },
    ],
    projects: [
      {
        id: makeId('project'),
        name: '企业级简历管理平台',
        role: '前端负责人',
        period: ['2024.09', '2025.03'],
        stack: 'Vue 3 / TypeScript / Vite / Naive UI',
        highlights: [
          '负责编辑器、实时预览和导出流程，支持多模块表单与模板化渲染。',
          '抽象通用表单配置和数据校验，减少重复维护成本约 40%。',
          '实现 A4 自动分页与 PDF / PNG / JPG 导出，保障预览与导出一致性。',
        ],
      },
      {
        id: makeId('project'),
        name: '低代码表单搭建系统',
        role: '核心开发',
        period: ['2024.01', '2024.08'],
        stack: 'Vue 3 / Pinia / Vite / Element Plus',
        highlights: [
          '设计拖拽式表单设计器，支持 20+ 控件类型与联动规则配置。',
          '落地 JSON Schema 驱动渲染，业务方可在不发版情况下调整表单。',
          '优化大数据量表单渲染，首屏可交互时间降低约 35%。',
        ],
      },
      {
        id: makeId('project'),
        name: '电商后台运营中台',
        role: '前端开发',
        period: ['2023.03', '2023.12'],
        stack: 'Vue 3 / TypeScript / Ant Design Vue / ECharts',
        highlights: [
          '负责商品、订单、营销活动等核心模块，对接 30+ 后台接口。',
          '封装权限路由、动态菜单与通用 CRUD 页模板，提升迭代效率。',
          '搭建运营数据看板，支持多维筛选与近实时图表刷新。',
        ],
      },
      {
        id: makeId('project'),
        name: '跨端组件库与文档站',
        role: '前端开发',
        period: ['2022.06', '2023.02'],
        stack: 'Vue 3 / VitePress / Storybook / Vitest',
        highlights: [
          '参与建设内部 UI 组件库，沉淀 Button、Table、Form 等 40+ 组件。',
          '完善单元测试与视觉回归流程，核心组件覆盖率达到 85% 以上。',
          '编写使用文档与示例，推动 5 个业务线统一设计规范。',
        ],
      },
      {
        id: makeId('project'),
        name: '校园二手交易小程序',
        role: '独立开发',
        period: ['2021.09', '2022.03'],
        stack: 'uni-app / Vue 2 /云开发',
        highlights: [
          '独立完成发布、搜索、私信、订单等全流程功能。',
          '接入云存储与云函数，支持图片压缩上传与消息推送。',
          '上线首月活跃用户超过 800，完成校内试点验证。',
        ],
      },
    ],
    skillMode: 'groups',
    skillGroups: [
      {
        id: makeId('skill'),
        label: '前端框架',
        skills: ['Vue 3', 'React', 'TypeScript', 'Vite', 'Pinia'],
      },
      {
        id: makeId('skill'),
        label: 'UI 与可视化',
        skills: ['Naive UI', 'Element Plus', 'Ant Design Vue', 'ECharts'],
      },
      {
        id: makeId('skill'),
        label: '工程化',
        skills: ['Git', 'CI/CD', 'Vitest', 'ESLint', '性能优化'],
      },
      {
        id: makeId('skill'),
        label: '其他',
        skills: ['Node.js', 'RESTful API', 'Webpack', 'uni-app'],
      },
    ],
    skillText:
      '前端框架：Vue 3 / React / TypeScript / Vite / Pinia\nUI 与可视化：Naive UI / Element Plus / Ant Design Vue / ECharts\n工程化：Git / CI/CD / Vitest / ESLint / 性能优化\n其他：Node.js / RESTful API / Webpack / uni-app',
    summary:
      '具备扎实的前端工程能力，熟悉 Vue 技术栈和复杂表单、中后台、组件库等场景，关注产品细节、代码质量与用户体验。\n擅长将模糊需求拆解为可落地的技术方案，能够独立推进从需求沟通、界面实现、联调测试到交付验证的完整流程。\n近期专注于编辑器类产品、低代码搭建与工程化体系建设，重视可维护性、性能与协作效率，期待在更具挑战的业务中持续成长。',
    smartOnePage: false,
  };
}

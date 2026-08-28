import type { ResumeData } from '../types';
import { makeId } from '../utils/resume';

export function createBlankResume(): ResumeData {
  return {
    templateId: 'classic',
    sectionOrder: ['basic', 'education', 'workExperience', 'projects', 'skills', 'summary'],
    hiddenSections: [],
    theme: {
      fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      accentColor: '#12715b',
    },
    basic: {
      avatar: '',
      name: '',
      title: '',
      phone: '',
      email: '',
      location: '',
      website: '',
      github: '',
    },
    education: [],
    workExperience: [],
    projects: [],
    skillMode: 'list',
    skillItems: [''],
    skillText: '',
    summary: '',
    smartOnePage: false,
  };
}

export function createTemplateChooserSample(): ResumeData {
  return {
    templateId: 'classic',
    sectionOrder: ['basic', 'education', 'workExperience', 'projects', 'skills', 'summary'],
    hiddenSections: [],
    theme: {
      fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      accentColor: '#12715b',
    },
    basic: {
      avatar: '',
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
    workExperience: [
      {
        id: makeId('work'),
        company: '星河科技',
        title: '前端开发工程师',
        city: '上海',
        period: ['2024.07', '2025.03'],
        highlights: [
          '负责简历编辑器与导出相关功能的设计与落地。',
          '推动组件复用与表单配置化，缩短需求交付周期。',
        ],
      },
    ],
    projects: [
      {
        id: makeId('project'),
        name: '企业级简历管理平台',
        role: '前端负责人',
        period: ['2024.09', '2025.03'],
        stack: 'Vue 3 / TypeScript / Vite',
        description: '面向企业用户的简历编辑与导出产品，负责核心前端能力建设。',
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
        description: '内部低代码平台，支持拖拽搭建表单与业务页面。',
        highlights: ['设计拖拽式表单设计器，支持联动规则配置。'],
      },
    ],
    skillMode: 'list',
    skillItems: [
      '熟练掌握 Vue 3、TypeScript、Vite 等前端技术栈，具备复杂表单与中后台项目经验。',
      '熟悉 Git、CI/CD、Vitest 等工程化工具，关注代码质量与交付效率。',
    ],
    skillText: '前端：Vue 3 / TypeScript / Vite\n工程化：Git / CI/CD / Vitest',
    summary: '熟悉 Vue 技术栈和复杂表单场景，关注代码质量与用户体验。',
    smartOnePage: false,
  };
}

export function createDefaultResume(): ResumeData {
  return {
    templateId: 'classic',
    sectionOrder: ['basic', 'education', 'workExperience', 'projects', 'skills', 'summary'],
    hiddenSections: [],
    theme: {
      fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      accentColor: '#12715b',
    },
    basic: {
      avatar: '',
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
    workExperience: [
      {
        id: makeId('work'),
        company: '星河科技',
        title: '前端开发工程师',
        city: '上海',
        period: ['2024.07', '2025.08'],
        highlights: [
          '负责 B 端编辑器产品的核心页面与交互落地，覆盖表单配置、实时预览与导出链路。',
          '推动公共组件与业务模板沉淀，需求交付周期平均缩短约 25%。',
          '参与前端性能治理，首屏可交互时间降低约 30%。',
        ],
      },
      {
        id: makeId('work'),
        company: '云启互联',
        title: '前端开发实习生',
        city: '上海',
        period: ['2023.06', '2024.06'],
        highlights: [
          '参与中后台运营系统迭代，完成商品、订单等模块页面开发与联调。',
          '沉淀通用 CRUD 页模板与权限路由封装，减少重复开发成本。',
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
        description: '面向企业用户的简历编辑与导出产品，覆盖编辑、预览与多格式导出。',
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
        description: '内部低代码平台，支持拖拽搭建表单与联动规则配置。',
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
        description: '支撑电商运营的后台中台系统，覆盖商品、订单与营销模块。',
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
        description: '公司内部跨端 UI 组件库与配套文档站点。',
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
        description: '校园二手交易小程序，覆盖发布、搜索与交易闭环。',
        highlights: [
          '独立完成发布、搜索、私信、订单等全流程功能。',
          '接入云存储与云函数，支持图片压缩上传与消息推送。',
          '上线首月活跃用户超过 800，完成校内试点验证。',
        ],
      },
    ],
    skillMode: 'list',
    skillItems: [
      '熟练掌握前端开发语言（HTML、CSS、JavaScript），具备微信小程序（原生、Taro）开发经验。',
      '掌握 Vue 框架及其生态（Vuex、Vue-router 等），熟练使用 element-plus 等 UI 框架。',
      '了解 Flutter、Dart 及 GetX、Dio 等库，具备 Android 与 iOS 双端 App 开发经验。',
      '了解 Docker 使用，具备在服务器部署音视频服务（Jitsi、Rocket.Chat）的经验。',
      '了解 NodeJs、Express、PHP、C# 等后端技术，在多个独立项目中承担前后端开发。',
      '熟悉 Linux 常用命令、Python 爬虫与 Godot 开发等拓展技能。',
      '具备良好的团队协作与沟通能力，能够承担项目管理职责。',
    ],
    skillText:
      '前端框架：Vue 3 / React / TypeScript / Vite / Pinia\nUI 与可视化：Naive UI / Element Plus / Ant Design Vue / ECharts\n工程化：Git / CI/CD / Vitest / ESLint / 性能优化\n其他：Node.js / RESTful API / Webpack / uni-app',
    summary:
      '具备扎实的前端工程能力，熟悉 Vue 技术栈和复杂表单、中后台、组件库等场景，关注产品细节、代码质量与用户体验。\n擅长将模糊需求拆解为可落地的技术方案，能够独立推进从需求沟通、界面实现、联调测试到交付验证的完整流程。\n近期专注于编辑器类产品、低代码搭建与工程化体系建设，重视可维护性、性能与协作效率，期待在更具挑战的业务中持续成长。',
    smartOnePage: false,
  };
}

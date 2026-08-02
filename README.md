# 简历编辑器

一个基于 Vue 3、Vite 和 Naive UI 构建的在线简历编辑器。项目提供简历列表、表单编辑、实时 A4 预览、多模板切换、自动分页和导出功能，适合快速整理一份干净清爽的中文简历。

## 在线预览

[https://exooool.github.io/resume/](https://exooool.github.io/resume/)

## 功能特性

- 简历列表管理，支持新增、命名、继续编辑和删除
- 简历数据保存在浏览器本地，刷新后可继续编辑
- 左侧表单编辑，右侧实时预览 A4 简历
- 支持基本信息、教育经历、项目经历、技术能力、自我总结等模块
- 教育经历和项目经历支持多项新增
- 技术能力支持分类编辑和自定义文本编辑
- 多套简约模板可切换
- 内容超出 A4 高度时自动分页
- 支持导出 PDF、PNG、JPG
- GitHub Actions 自动构建并发布到 GitHub Pages

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Naive UI
- html2canvas
- jsPDF

## 本地运行

```bash
npm install
npm run dev
```

构建生产版本：

```bash
npm run build
```

## 数据存储

当前简历数据使用 `localStorage` 保存在浏览器本地。简历内容主要是 JSON 文本，体量较小，因此使用 `localStorage` 更轻量直接。后续如果加入头像、附件、历史版本等大体量数据，可以再迁移到 IndexedDB。

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  computed,
  nextTick,
  onBeforeUpdate,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { createDefaultResume } from '../data/defaultResume';
import type { ResumeBlock, ResumeData } from '../types';
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  PREVIEW_CONTENT_HEIGHT,
  cloneResumeData,
  createPreviewBlocks,
  makeId,
} from '../utils/resume';

export function useResumeEditor(initialResume: ResumeData = createDefaultResume()) {
  const resume = reactive<ResumeData>(cloneResumeData(initialResume));
  const pages = ref<ResumeBlock[][]>([]);
  const measureRef = ref<HTMLElement | null>(null);
  const pageRefs = ref<HTMLElement[]>([]);
  const exportingType = ref<'pdf' | 'png' | 'jpg' | ''>('');
  let paginationTimer = 0;

  const previewBlocks = computed(() => createPreviewBlocks(resume));
  const pageCountLabel = computed(() => `${pages.value.length || 1} 页`);

  onBeforeUpdate(() => {
    pageRefs.value = [];
  });

  onMounted(() => {
    schedulePagination();
  });

  watch(
    previewBlocks,
    () => {
      schedulePagination();
    },
    { deep: true },
  );

  watch(
    () => resume.templateId,
    () => {
      schedulePagination();
    },
  );

  function addEducation() {
    resume.education.push({
      id: makeId('edu'),
      school: '',
      degree: '',
      major: '',
      city: '',
      period: null,
      details: [''],
    });
  }

  function removeEducation(index: number) {
    resume.education.splice(index, 1);
  }

  function addProject() {
    resume.projects.push({
      id: makeId('project'),
      name: '',
      role: '',
      period: null,
      stack: '',
      highlights: [''],
    });
  }

  function removeProject(index: number) {
    resume.projects.splice(index, 1);
  }

  function addSkillGroup() {
    resume.skillGroups.push({
      id: makeId('skill'),
      label: '',
      skills: [],
    });
  }

  function removeSkillGroup(index: number) {
    resume.skillGroups.splice(index, 1);
  }

  function setMeasureRef(element: unknown) {
    if (element instanceof HTMLElement) {
      measureRef.value = element;
    }
  }

  function collectPageRef(element: unknown) {
    if (element instanceof HTMLElement) {
      pageRefs.value.push(element);
    }
  }

  function schedulePagination() {
    window.clearTimeout(paginationTimer);
    paginationTimer = window.setTimeout(() => {
      void paginatePreview();
    });
  }

  async function paginatePreview() {
    await nextTick();

    const source = measureRef.value;
    const blocks = previewBlocks.value;
    if (!source || !blocks.length) {
      pages.value = [[]];
      return;
    }

    const nodes = Array.from(source.children) as HTMLElement[];
    const heights = nodes.map(getOuterHeight);
    const nextPageSet: ResumeBlock[][] = [];
    let currentPage: ResumeBlock[] = [];
    let usedHeight = 0;

    blocks.forEach((block, index) => {
      const blockHeight = Math.ceil(heights[index] || 0);
      const nextHeight = Math.ceil(heights[index + 1] || 0);
      const shouldKeepHeadingWithNext =
        block.kind === 'section' &&
        currentPage.length > 0 &&
        usedHeight + blockHeight + nextHeight > PREVIEW_CONTENT_HEIGHT;

      if (
        currentPage.length > 0 &&
        (usedHeight + blockHeight > PREVIEW_CONTENT_HEIGHT || shouldKeepHeadingWithNext)
      ) {
        nextPageSet.push(currentPage);
        currentPage = [];
        usedHeight = 0;
      }

      currentPage.push(block);
      usedHeight += blockHeight;
    });

    if (currentPage.length) {
      nextPageSet.push(currentPage);
    }

    pages.value = nextPageSet.length ? nextPageSet : [[]];
  }

  function getOuterHeight(element: HTMLElement) {
    const style = window.getComputedStyle(element);
    return (
      element.getBoundingClientRect().height +
      parseFloat(style.marginTop || '0') +
      parseFloat(style.marginBottom || '0')
    );
  }

  async function capturePages() {
    await paginatePreview();
    await nextTick();

    const elements = pageRefs.value;
    if (!elements.length) {
      throw new Error('没有可导出的页面');
    }

    const canvases: HTMLCanvasElement[] = [];
    for (const element of elements) {
      canvases.push(
        await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        }),
      );
    }

    return canvases;
  }

  async function exportPDF() {
    await exportResume('pdf', async () => {
      const canvases = await capturePages();
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      canvases.forEach((canvas, index) => {
        if (index > 0) {
          pdf.addPage();
        }
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
      });

      pdf.save(`${fileBaseName()}.pdf`);
    });
  }

  async function exportPNG() {
    await exportImages('png');
  }

  async function exportJPG() {
    await exportImages('jpg');
  }

  async function exportImages(type: 'png' | 'jpg') {
    await exportResume(type, async () => {
      const canvases = await capturePages();

      canvases.forEach((canvas, index) => {
        const mimeType = type === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.95);
        downloadDataUrl(dataUrl, `${fileBaseName()}-${index + 1}.${type}`);
      });
    });
  }

  async function exportResume(type: 'pdf' | 'png' | 'jpg', task: () => Promise<void>) {
    if (exportingType.value) {
      return;
    }

    exportingType.value = type;
    try {
      await task();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '导出失败');
    } finally {
      exportingType.value = '';
    }
  }

  function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function fileBaseName() {
    const rawName = resume.basic.name.trim() || 'resume';
    return rawName.replace(/[\\/:*?"<>|]+/g, '-');
  }

  return {
    resume,
    pages,
    previewBlocks,
    pageCountLabel,
    exportingType,
    addEducation,
    removeEducation,
    addProject,
    removeProject,
    addSkillGroup,
    removeSkillGroup,
    setMeasureRef,
    collectPageRef,
    exportPDF,
    exportPNG,
    exportJPG,
  };
}

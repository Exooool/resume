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
  const spaceScale = ref(1);
  let paginationTimer = 0;

  const previewBlocks = computed(() => createPreviewBlocks(resume));
  const pageCountLabel = computed(() => `${pages.value.length || 1} 页`);
  const spaceStyle = computed(() => ({
    '--resume-space-scale': String(spaceScale.value),
  }));

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

  watch(
    () => resume.smartOnePage,
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
      spaceScale.value = 1;
      pages.value = [[]];
      return;
    }

    spaceScale.value = 1;
    await nextTick();

    if (resume.smartOnePage) {
      spaceScale.value = await resolveSmartSpaceScale(source);
      await nextTick();
    }

    const nodes = Array.from(source.children) as HTMLElement[];
    const nextPageSet: ResumeBlock[][] = [];
    let currentPage: ResumeBlock[] = [];
    let usedHeight = 0;
    let sliceSeq = 0;

    function pushPage() {
      if (!currentPage.length) {
        return;
      }

      nextPageSet.push(currentPage);
      currentPage = [];
      usedHeight = 0;
    }

    function appendBlock(block: ResumeBlock, height: number) {
      const blockHeight = Math.ceil(height);
      if (currentPage.length > 0 && usedHeight + blockHeight > PREVIEW_CONTENT_HEIGHT) {
        pushPage();
      }

      currentPage.push(block);
      usedHeight += blockHeight;
    }

    blocks.forEach((block, index) => {
      const node = nodes[index];
      if (!node) {
        return;
      }

      const blockHeight = getOuterHeight(node);

      if (block.kind === 'section') {
        const nextNode = nodes[index + 1];
        const nextPartHeight = nextNode
          ? Math.min(estimateFirstContentHeight(nextNode, blocks[index + 1]), 72)
          : 0;

        if (
          currentPage.length > 0 &&
          usedHeight + blockHeight + nextPartHeight > PREVIEW_CONTENT_HEIGHT
        ) {
          pushPage();
        }

        appendBlock(block, blockHeight);
        return;
      }

      if (block.kind === 'education' || block.kind === 'project') {
        paginateEntryBlock(block, node);
        return;
      }

      if (block.kind === 'skills') {
        paginateSkillsBlock(block, node);
        return;
      }

      if (block.kind === 'summary' || block.kind === 'skillsText') {
        paginateTextBlock(block, node);
        return;
      }

      appendBlock(block, blockHeight);
    });

    pushPage();
    pages.value = nextPageSet.length ? nextPageSet : [[]];

    function paginateEntryBlock(
      block: Extract<ResumeBlock, { kind: 'education' | 'project' }>,
      node: HTMLElement,
    ) {
      const parts = measureEntryParts(node);
      if (!parts.length) {
        appendBlock(block, getOuterHeight(node));
        return;
      }

      let showTopline = false;
      let showMeta = false;
      let itemIndexes: number[] = [];
      let sliceHeight = 0;

      const flushSlice = () => {
        if (!showTopline && !showMeta && itemIndexes.length === 0) {
          return;
        }

        sliceSeq += 1;
        const slicedBlock =
          block.kind === 'education'
            ? ({
                ...block,
                id: `${block.id}__${sliceSeq}`,
                showTopline,
                showMeta,
                detailIndexes: [...itemIndexes],
              } satisfies ResumeBlock)
            : ({
                ...block,
                id: `${block.id}__${sliceSeq}`,
                showTopline,
                showMeta,
                highlightIndexes: [...itemIndexes],
              } satisfies ResumeBlock);

        appendBlock(slicedBlock, sliceHeight);
        showTopline = false;
        showMeta = false;
        itemIndexes = [];
        sliceHeight = 0;
      };

      parts.forEach((part) => {
        const hasSliceContent = showTopline || showMeta || itemIndexes.length > 0;
        if (
          hasSliceContent &&
          usedHeight + sliceHeight + part.height > PREVIEW_CONTENT_HEIGHT
        ) {
          flushSlice();
          if (currentPage.length > 0 && usedHeight + part.height > PREVIEW_CONTENT_HEIGHT) {
            pushPage();
          }
        }

        if (part.type === 'topline') {
          showTopline = true;
        } else if (part.type === 'meta') {
          showMeta = true;
        } else {
          itemIndexes.push(part.index);
        }

        sliceHeight += part.height;
      });

      flushSlice();
    }

    function paginateSkillsBlock(
      block: Extract<ResumeBlock, { kind: 'skills' }>,
      node: HTMLElement,
    ) {
      const parts = measureSkillParts(node);
      if (!parts.length) {
        appendBlock(block, getOuterHeight(node));
        return;
      }

      let groupIndexes: number[] = [];
      let sliceHeight = 0;

      const flushSlice = () => {
        if (!groupIndexes.length) {
          return;
        }

        sliceSeq += 1;
        appendBlock(
          {
            ...block,
            id: `${block.id}__${sliceSeq}`,
            groupIndexes: [...groupIndexes],
          },
          sliceHeight,
        );
        groupIndexes = [];
        sliceHeight = 0;
      };

      parts.forEach((part) => {
        if (
          groupIndexes.length > 0 &&
          usedHeight + sliceHeight + part.height > PREVIEW_CONTENT_HEIGHT
        ) {
          flushSlice();
          if (currentPage.length > 0 && usedHeight + part.height > PREVIEW_CONTENT_HEIGHT) {
            pushPage();
          }
        }

        groupIndexes.push(part.index);
        sliceHeight += part.height;
      });

      flushSlice();
    }

    function paginateTextBlock(
      block: Extract<ResumeBlock, { kind: 'summary' | 'skillsText' }>,
      node: HTMLElement,
    ) {
      const parts = measureTextParts(node, block.text);
      if (parts.length <= 1) {
        appendBlock(block, getOuterHeight(node));
        return;
      }

      let texts: string[] = [];
      let sliceHeight = 0;

      const flushSlice = () => {
        if (!texts.length) {
          return;
        }

        sliceSeq += 1;
        appendBlock(
          {
            ...block,
            id: `${block.id}__${sliceSeq}`,
            text: texts.join('\n'),
          },
          sliceHeight,
        );
        texts = [];
        sliceHeight = 0;
      };

      parts.forEach((part) => {
        if (
          texts.length > 0 &&
          usedHeight + sliceHeight + part.height > PREVIEW_CONTENT_HEIGHT
        ) {
          flushSlice();
          if (currentPage.length > 0 && usedHeight + part.height > PREVIEW_CONTENT_HEIGHT) {
            pushPage();
          }
        }

        texts.push(part.text);
        sliceHeight += part.height;
      });

      flushSlice();
    }
  }

  function measureEntryParts(node: HTMLElement) {
    const style = window.getComputedStyle(node);
    const marginTop = parseFloat(style.marginTop || '0');
    const marginBottom = parseFloat(style.marginBottom || '0');
    const parts: Array<
      | { type: 'topline'; height: number }
      | { type: 'meta'; height: number }
      | { type: 'item'; index: number; height: number }
    > = [];

    const topline = node.querySelector('.entry-topline');
    if (topline instanceof HTMLElement) {
      parts.push({ type: 'topline', height: getOuterHeight(topline) });
    }

    const meta = node.querySelector('.entry-meta');
    if (meta instanceof HTMLElement) {
      parts.push({ type: 'meta', height: getOuterHeight(meta) });
    }

    Array.from(node.querySelectorAll('.resume-list > li')).forEach((item, index) => {
      if (item instanceof HTMLElement) {
        parts.push({ type: 'item', index, height: getOuterHeight(item) });
      }
    });

    if (!parts.length) {
      return parts;
    }

    parts[0].height += marginTop;
    parts[parts.length - 1].height += marginBottom;

    const list = node.querySelector('.resume-list');
    if (list instanceof HTMLElement) {
      const listStyle = window.getComputedStyle(list);
      const listExtra =
        parseFloat(listStyle.marginTop || '0') + parseFloat(listStyle.paddingTop || '0');
      const firstItem = parts.find((part) => part.type === 'item');
      if (firstItem) {
        firstItem.height += listExtra;
      }
    }

    return parts;
  }

  function measureSkillParts(node: HTMLElement) {
    const style = window.getComputedStyle(node);
    const marginTop = parseFloat(style.marginTop || '0');
    const marginBottom = parseFloat(style.marginBottom || '0');
    const parts = Array.from(node.querySelectorAll('.skill-row')).flatMap((row, index) => {
      if (!(row instanceof HTMLElement)) {
        return [];
      }

      return [{ index, height: getOuterHeight(row) }];
    });

    if (!parts.length) {
      return parts;
    }

    parts[0].height += marginTop;
    parts[parts.length - 1].height += marginBottom;
    return parts;
  }

  function measureTextParts(node: HTMLElement, text: string) {
    const paragraphs = Array.from(node.querySelectorAll('p'));
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (!paragraphs.length) {
      return [{ text, height: getOuterHeight(node) }];
    }

    const style = window.getComputedStyle(node);
    const marginTop = parseFloat(style.marginTop || '0');
    const marginBottom = parseFloat(style.marginBottom || '0');

    const parts = paragraphs.map((paragraph, index) => ({
      text: lines[index] || paragraph.textContent?.trim() || '',
      height: getOuterHeight(paragraph),
    }));

    if (!parts.length) {
      return parts;
    }

    parts[0].height += marginTop;
    parts[parts.length - 1].height += marginBottom;
    return parts.filter((part) => part.text);
  }

  function estimateFirstContentHeight(node: HTMLElement, block?: ResumeBlock) {
    if (!block) {
      return getOuterHeight(node);
    }

    if (block.kind === 'education' || block.kind === 'project') {
      const parts = measureEntryParts(node);
      return parts[0]?.height || getOuterHeight(node);
    }

    if (block.kind === 'skills') {
      const parts = measureSkillParts(node);
      return parts[0]?.height || getOuterHeight(node);
    }

    if (block.kind === 'summary' || block.kind === 'skillsText') {
      const parts = measureTextParts(node, block.text);
      return parts[0]?.height || getOuterHeight(node);
    }

    return getOuterHeight(node);
  }

  function getOuterHeight(element: HTMLElement) {
    const style = window.getComputedStyle(element);
    return (
      element.getBoundingClientRect().height +
      parseFloat(style.marginTop || '0') +
      parseFloat(style.marginBottom || '0')
    );
  }

  function measureStackedHeight(source: HTMLElement) {
    return Array.from(source.children).reduce(
      (total, node) => total + getOuterHeight(node as HTMLElement),
      0,
    );
  }

  async function resolveSmartSpaceScale(source: HTMLElement) {
    const MIN_SPACE_SCALE = 0.35;
    const naturalHeight = measureStackedHeight(source);
    if (naturalHeight <= PREVIEW_CONTENT_HEIGHT) {
      return 1;
    }

    let low = MIN_SPACE_SCALE;
    let high = 1;
    let best = MIN_SPACE_SCALE;

    for (let step = 0; step < 8; step += 1) {
      const mid = Number(((low + high) / 2).toFixed(3));
      spaceScale.value = mid;
      await nextTick();

      if (measureStackedHeight(source) <= PREVIEW_CONTENT_HEIGHT) {
        best = mid;
        low = mid;
      } else {
        high = mid;
      }
    }

    return best;
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
    spaceStyle,
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

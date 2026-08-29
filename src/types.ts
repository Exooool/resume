export interface BasicInfo {
  avatar: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  location: string;
  website: string;
  github: string;
}

export type PeriodRange = [string, string] | null;

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  major: string;
  city: string;
  period: PeriodRange;
  details: string[];
}

export interface WorkExperienceItem {
  id: string;
  company: string;
  title: string;
  city: string;
  period: PeriodRange;
  description: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  period: PeriodRange;
  stack: string;
  description: string;
  highlights: string[];
}

export type SkillEditMode = 'list' | 'custom';

export const RESUME_SECTION_IDS = [
  'basic',
  'education',
  'workExperience',
  'projects',
  'skills',
  'summary',
] as const;

export type ResumeSectionId = (typeof RESUME_SECTION_IDS)[number];

export interface ResumeTypography {
  nameSize: number;
  titleSize: number;
  sectionSize: number;
  entrySize: number;
  bodySize: number;
  contactSize: number;
}

export const DEFAULT_RESUME_TYPOGRAPHY: ResumeTypography = {
  nameSize: 34,
  titleSize: 16,
  sectionSize: 16,
  entrySize: 15,
  bodySize: 12,
  contactSize: 12,
};

export interface ResumeTheme {
  fontFamily: string;
  accentColor: string;
  typography: ResumeTypography;
}

export type ResumeTemplateId =
  | 'classic'
  | 'fresh'
  | 'compact'
  | 'sidebar'
  | 'slate'
  | 'ink'
  | 'cards'
  | 'timeline'
  | 'minimal';

export interface ResumeData {
  templateId: ResumeTemplateId;
  sectionOrder: ResumeSectionId[];
  hiddenSections: ResumeSectionId[];
  theme: ResumeTheme;
  basic: BasicInfo;
  education: EducationItem[];
  workExperience: WorkExperienceItem[];
  projects: ProjectItem[];
  skillMode: SkillEditMode;
  skillItems: string[];
  skillText: string;
  summary: string;
  smartCompressSpacing: boolean;
}

export interface ResumeDocument {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: ResumeData;
}

export type ResumeBlock =
  | { id: string; kind: 'header'; basic: BasicInfo }
  | { id: string; kind: 'section'; title: string }
  | {
      id: string;
      kind: 'education';
      item: EducationItem;
      showTopline?: boolean;
      showMeta?: boolean;
      detailIndexes?: number[];
    }
  | {
      id: string;
      kind: 'workExperience';
      item: WorkExperienceItem;
      showTopline?: boolean;
      showMeta?: boolean;
      showDescription?: boolean;
      highlightIndexes?: number[];
    }
  | {
      id: string;
      kind: 'project';
      item: ProjectItem;
      showTopline?: boolean;
      showMeta?: boolean;
      showDescription?: boolean;
      highlightIndexes?: number[];
    }
  | {
      id: string;
      kind: 'skills';
      items: string[];
      itemIndexes?: number[];
    }
  | { id: string; kind: 'skillsText'; text: string }
  | { id: string; kind: 'summary'; text: string };

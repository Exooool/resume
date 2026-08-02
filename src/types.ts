export interface BasicInfo {
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

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  period: PeriodRange;
  stack: string;
  highlights: string[];
}

export interface SkillGroup {
  id: string;
  label: string;
  skills: string[];
}

export type SkillEditMode = 'groups' | 'custom';

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
  basic: BasicInfo;
  education: EducationItem[];
  projects: ProjectItem[];
  skillMode: SkillEditMode;
  skillGroups: SkillGroup[];
  skillText: string;
  summary: string;
  smartOnePage: boolean;
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
      kind: 'project';
      item: ProjectItem;
      showTopline?: boolean;
      showMeta?: boolean;
      highlightIndexes?: number[];
    }
  | {
      id: string;
      kind: 'skills';
      groups: SkillGroup[];
      groupIndexes?: number[];
    }
  | { id: string; kind: 'skillsText'; text: string }
  | { id: string; kind: 'summary'; text: string };

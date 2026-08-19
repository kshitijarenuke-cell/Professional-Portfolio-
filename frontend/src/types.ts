export interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  order: number;
}

export interface TechItem {
  _id?: string;
  id?: string;
  name: string;
  category: string; // 'Frontend' | 'Backend' | 'Database' | 'Languages' | 'Tools' | 'Deployment'
  icon: string;
  order: number;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface AboutData {
  _id?: string;
  id?: string;
  heading: string;
  description: string;
  profileImage: string;
  resumeUrl: string;
  stats: StatItem[];
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  instagram: string;
  leetcode: string;
}

export interface ContactData {
  _id?: string;
  id?: string;
  email: string;
  phone: string;
  location: string;
  available: boolean;
  resumeUrl: string;
  socials: SocialLinks;
}

export interface MessageData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SettingsData {
  id?: string;
  projectView: 'grid' | 'list';
}

export interface DashboardStats {
  projects: number;
  skills: number;
  messages: number;
}

export type SectionId = 'hero' | 'about' | 'skills' | 'projects' | 'github' | 'journey' | 'achievements' | 'resume' | 'contact';
export type Theme = 'dark' | 'light';

export interface SkillItem {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Programming' | 'Tools';
  description: string;
  highlights: string[];
  projects: string[];
}

export interface Milestone {
  id: string;
  year: string;
  title: string;
  role: string;
  organization: string;
  location: string;
  description: string;
  achievements: string[];
  techStack: string[];
  type: 'education' | 'experience' | 'project';
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: 'certification' | 'award' | 'hackathon';
  description: string;
  skills: string[];
  credentialId?: string;
  verifyUrl?: string;
  imageUrl?: string;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  stars?: number;
  forks?: number;
  language: string;
  tags: string[];
  url: string;
  updated: string;
}

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type MaterialType = 'Book' | 'Note' | 'Lab Manual' | 'Slide' | 'Paper' | 'Thesis' | 'Question' | 'Syllabus' | 'Other';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
  createdAt: number;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  category: string;
  semester?: string;
  session?: string;
  courseCode?: string;
  fileUrl: string;
  fileName: string;
  uploaderId: string;
  uploaderName: string;
  createdAt: number;
  downloads: number;
  size: number; // in bytes
}

export interface Category {
  id: string;
  name: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'High' | 'Normal' | 'Urgent';
  createdAt: number;
  authorId: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  universityName: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  footerText: string;
  developerCredit: string;
  particleEffect: boolean;
}

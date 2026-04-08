export type DocumentType =
  | "aadhaar"
  | "birth"
  | "caste"
  | "passportPhoto"
  | "marksheet";

export type StoredDocument = {
  fileName: string;
  mimeType: string;
  size: number;
  // For beginner-friendly preview (works without Firebase):
  dataUrl: string;
};

export type Student = {
  id: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  mobile: string;
  className: string;
  aadhaar: string;
  samagraId: string;
  apaarId: string;
  documents: Partial<Record<DocumentType, StoredDocument>>;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "students_v1";

export function loadStudentsFromStorage(): Student[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Student[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStudentsToStorage(students: Student[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

export function makeId() {
  // Simple id generator for demo purposes.
  return `stu_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}


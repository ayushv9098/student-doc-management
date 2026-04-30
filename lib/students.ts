import supabase from "@/lib/supabase";

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
  dataUrl: string;
};

export type Student = {
  id: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  mobile: string;
  className: string;
  rollNumber: string;
  aadhaar: string;
  samagraId: string;
  scholarId: string;
  documents: Partial<Record<DocumentType, StoredDocument>>;
  createdAt: number;
  updatedAt: number;
};

// Supabase se saare students fetch karo
export async function loadStudentsFromSupabase(): Promise<Student[]> {
  const { data: userData } = await supabase.auth.getUser();

const { data, error } = await supabase
  .from("students")
  .select("*")
  .eq("owner_id", userData.user?.id)
  .order("id", { ascending: false });
  if (error) {
    console.error("Error loading students:", error.message);
    return [];
  }

  // Supabase columns ko Student type mein convert karo
  type StudentRow = {
    id: string | number;
    created_at?: string | null;
    updated_at?: string | null;
    full_name: string | null;
    father_name: string | null;
    mother_name: string | null;
    mobile: string | null;
    class: string | null;
    roll_number: string | null;
    aadhaar_number: string | null;
    samagra_id: string | null;
    scholar_id: string | null;
  };

  const toEpoch = (value?: string | null) => {
    if (!value) return Date.now();
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? Date.now() : parsed;
  };

  return (data as StudentRow[]).map((row) => ({
    id: String(row.id),
fullName:   row.full_name ?? "",
fatherName: row.father_name ?? "",
motherName: row.mother_name ?? "",
mobile:     row.mobile ?? "",
className:  row.class ?? "",
aadhaar:    row.aadhaar_number ?? "",
samagraId:  row.samagra_id ?? "",
scholarId:    row.scholar_id ?? "",
rollNumber: row.roll_number ?? "",
documents:  {},
createdAt:  toEpoch(row.created_at),
updatedAt:  toEpoch(row.updated_at),
  }));
}

// Purane localStorage functions — abhi bhi kaam karenge
export function loadStudentsFromStorage(): Student[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("students_v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Student[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStudentsToStorage(students: Student[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("students_v1", JSON.stringify(students));
}

export function makeId(existingIds: Iterable<string> = []) {
  const used = new Set(existingIds);
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const length = Math.random() < 0.5 ? 5 : 6;
    const min = length === 5 ? 10000 : 100000;
    const max = length === 5 ? 99999 : 999999;
    const id = String(Math.floor(Math.random() * (max - min + 1)) + min);
    if (!used.has(id)) return id;
  }
  return String(Date.now()).slice(-6);
}
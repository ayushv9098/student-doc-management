"use client";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from "@/lib/supabase";

type StudentRow = {
  id: string | number;
  full_name: string | null;
  class: string | null;
  mobile: string | null;
  roll_number: string | null;
  father_name: string | null;
  mother_name: string | null;
  aadhaar_number: string | null;
  samagra_id: string | null;
  apaar_id: string | null;
};

type StudentDocument = {
  id: string | number;
  file_name: string | null;
  file_url: string;
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200/70 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</div>
    </div>
  );
}

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [student, setStudent] = React.useState<StudentRow | null>(null);
  const [documents, setDocuments] = React.useState<StudentDocument[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      const { data: s } = await supabase.from("students").select("*").eq("id", id).single<StudentRow>();
      setStudent(s ?? null);
      const { data: d, error: docsError } = await supabase.from("student_documents").select("*").eq("student_id", id).returns<StudentDocument[]>();
      if (docsError) {
        console.error("student_documents fetch failed:", docsError.message);
      }
      setDocuments(d ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="p-6 text-sm text-zinc-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-black dark:text-white">Student Profile</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Student ID: {id}</p>
        </div>
        <Button asChild className="w-full sm:w-auto" variant="outline">
          <Link href="/students">Back</Link>
        </Button>
      </div>

      {!student ? (
        <Card>
          <CardHeader><CardTitle>Not found</CardTitle></CardHeader>
          <CardContent>Student not found.</CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{student.full_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem label="Student ID" value={String(student.id)} />
                <DetailItem label="Class" value={student.class || "—"} />
                <DetailItem label="Mobile" value={student.mobile || "—"} />
                <DetailItem label="Roll Number" value={student.roll_number || "—"} />
              </div>
              <div>
                <h2 className="mb-3 text-sm font-semibold">Family Details</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem label="Father Name" value={student.father_name || "—"} />
                  <DetailItem label="Mother Name" value={student.mother_name || "—"} />
                </div>
              </div>
              <div>
                <h2 className="mb-3 text-sm font-semibold">ID Information</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailItem label="Aadhaar" value={student.aadhaar_number || "—"} />
                  <DetailItem label="Samagra ID" value={student.samagra_id || "—"} />
                  <DetailItem label="APAAR ID" value={student.apaar_id || "—"} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 text-sm font-semibold">Documents ({documents.length})</h2>
            {documents.length === 0 ? (
              <div className="rounded-md border p-4 text-sm text-zinc-500">No documents uploaded.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {documents.map((doc) => {
                  const hasValidPath = !!doc.file_name && /^\d+\/.+/.test(doc.file_name);
                  const { data: urlData } = doc.file_name
                    ? supabase.storage.from("student-documents").getPublicUrl(doc.file_name)
                    : { data: { publicUrl: doc.file_url } };
                  const publicUrl = urlData.publicUrl || doc.file_url;
                  console.log("Student document URL check:", {
                    fileName: doc.file_name,
                    hasValidPath,
                    publicUrl,
                  });
                  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(doc.file_name ?? "");
                  return (
                    <Card key={doc.id} className="overflow-hidden">
                      <CardContent className="p-3 space-y-2">
                        {isImage ? (
                          <img src={publicUrl} alt={doc.file_name ?? "document"} className="h-40 w-full rounded-md object-cover border border-zinc-200" />
                        ) : (
                          <div className="flex h-40 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                            <span className="text-3xl">PDF</span>
                          </div>
                        )}
                        <div className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">{doc.file_name}</div>
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">View</a>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
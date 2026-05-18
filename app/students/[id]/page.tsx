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
  scholar_id: string | null;
    father_occupation: string | null;
  date_of_birth: string | null;
  caste: string | null;
  previous_school: string | null;
  address: string | null;
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

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-zinc-500 animate-pulse font-medium">Loading profile...</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Student Profile</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              ID: {id}
            </span>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/students">← Back to List</Link>
        </Button>
      </div>

      {!student ? (
        <Card className="border-dashed py-12 text-center">
          <CardContent>
            <p className="text-zinc-500">Student not found.</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/students">Go back</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
              <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Basic Information</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <DetailItem label="Full Name" value={student.full_name || "—"} />
                  <DetailItem label="Class" value={student.class || "—"} />
                  <DetailItem label="Mobile Number" value={student.mobile || "—"} />
                  <DetailItem label="Roll Number" value={student.roll_number || "—"} />
                  <DetailItem label="Scholar ID" value={student.scholar_id || "—"} />
                  <DetailItem label="Date of Birth" value={student.date_of_birth || "—"} />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
              <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Family & Additional Details</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <DetailItem label="Father's Name" value={student.father_name || "—"} />
                  <DetailItem label="Mother's Name" value={student.mother_name || "—"} />
                  <DetailItem label="Father's Occupation" value={student.father_occupation || "—"} />
                  <DetailItem label="Caste" value={student.caste || "—"} />
                </div>
                <div className="mt-6 space-y-6">
                  <DetailItem label="Previous School" value={student.previous_school || "—"} />
                  <DetailItem label="Permanent Address" value={student.address || "—"} />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
              <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">ID Documentation</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <DetailItem label="Aadhaar Number" value={student.aadhaar_number || "—"} />
                  <DetailItem label="Samagra ID" value={student.samagra_id || "—"} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents Sidebar */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Documents</h2>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                {documents.length}
              </span>
            </div>
            
            {documents.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
                <p className="text-sm text-zinc-500">No documents found.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc) => {
                  const publicUrl = doc.file_url;
                  return (
                    <Card key={doc.id} className="overflow-hidden border-zinc-200 dark:border-zinc-800">
                      <div className="group relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <img
                          src={publicUrl}
                          alt={doc.file_name || "Document"}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/400x300?text=No+Preview";
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-sm"
                          >
                            View Full
                          </a>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="mb-3 truncate text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {doc.file_name}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 flex-1 text-[10px]"
                            onClick={async () => {
                              const res = await fetch(publicUrl);
                              const blob = await res.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = doc.file_name || "document";
                              a.click();
                              window.URL.revokeObjectURL(url);
                            }}
                          >
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 flex-1 text-[10px] text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                            onClick={async () => {
                              if (!window.confirm("Delete this document?")) return;
                              try {
                                const { error } = await supabase.from("student_documents").delete().eq("id", Number(doc.id));
                                if (error) throw error;
                                if (doc.file_name?.trim()) {
                                  await supabase.storage.from("student-documents").remove([doc.file_name.trim()]);
                                }
                                setDocuments(prev => prev.filter(d => d.id !== doc.id));
                              } catch (err: any) {
                                alert(err.message);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
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
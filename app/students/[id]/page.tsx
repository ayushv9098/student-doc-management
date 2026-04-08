"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { DocumentType } from "@/lib/students";
import { loadStudentsFromStorage } from "@/lib/students";
import { formatBytes } from "@/lib/file";

const DOC_TYPES: Array<{ type: DocumentType; label: string }> = [
  { type: "aadhaar", label: "Aadhaar Card" },
  { type: "birth", label: "Birth Certificate" },
  { type: "caste", label: "Caste Certificate" },
  { type: "passportPhoto", label: "Passport Size Photo" },
  { type: "marksheet", label: "Marksheet" },
];

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [student, setStudent] = React.useState<ReturnType<typeof loadStudentsFromStorage>[number] | null>(
    null
  );

  React.useEffect(() => {
    if (!id) return;
    const students = loadStudentsFromStorage();
    const found = students.find((s) => s.id === id) ?? null;
    setStudent(found);
  }, [id]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-black dark:text-white">Student Profile</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{id}</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/students")}>
          Back
        </Button>
      </div>

      {!student ? (
        <Card>
          <CardHeader>
            <CardTitle>Not found</CardTitle>
          </CardHeader>
          <CardContent>
            Student ID not found in localStorage.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{student.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs text-zinc-500">Father Name</div>
                <div className="font-medium">{student.fatherName}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Mother Name</div>
                <div className="font-medium">{student.motherName}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Mobile</div>
                <div className="font-medium">{student.mobile}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Class</div>
                <div className="font-medium">{student.className}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Aadhaar</div>
                <div className="font-medium">{student.aadhaar || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Samagra ID</div>
                <div className="font-medium">{student.samagraId || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">APAAR ID</div>
                <div className="font-medium">{student.apaarId || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Created</div>
                <div className="font-medium">
                  {new Date(student.createdAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {DOC_TYPES.map((d) => {
              const doc = student.documents[d.type];
              return (
                <Card key={d.type}>
                  <CardHeader>
                    <CardTitle>{d.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!doc ? (
                      <div className="text-sm text-zinc-600 dark:text-zinc-300">
                        Not uploaded.
                      </div>
                    ) : doc.mimeType.startsWith("image/") ? (
                      <div className="space-y-2">
                        <img
                          src={doc.dataUrl}
                          alt={doc.fileName}
                          className="max-h-64 w-full rounded-md border border-zinc-200 object-contain dark:border-zinc-800"
                        />
                        <div className="text-xs text-zinc-500">{doc.fileName}</div>
                        <a
                          href={doc.dataUrl}
                          download={doc.fileName}
                          className="text-sm underline hover:text-zinc-700 dark:text-white/90 dark:hover:text-white"
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">{doc.fileName}</div>
                        <div className="text-xs text-zinc-500">
                          {doc.mimeType} • {formatBytes(doc.size)}
                        </div>
                        <a
                          href={doc.dataUrl}
                          download={doc.fileName}
                          className="text-sm underline hover:text-zinc-700 dark:text-white/90 dark:hover:text-white"
                        >
                          Download
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


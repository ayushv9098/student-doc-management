"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { StudentForm, type StudentFormValues } from "@/components/students/StudentForm";
import { makeId, loadStudentsFromStorage, saveStudentsToStorage } from "@/lib/students";

export default function NewStudentPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-black dark:text-white">Add Student</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Upload documents and see preview.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/students")}>
          Back
        </Button>
      </div>

      <StudentForm
        isSaving={saving}
        onSave={async (values: StudentFormValues) => {
          setSaving(true);
          try {
            const existing = loadStudentsFromStorage();
            const next = [
              {
                id: makeId(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                ...values,
              },
              ...existing,
            ];
            saveStudentsToStorage(next);
            router.push("/students");
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}


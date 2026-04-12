"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StudentForm, type StudentFormValues } from "@/components/students/StudentForm";
import supabase from "@/lib/supabase";

export default function NewStudentPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  async function handleSave(values: StudentFormValues) {
    setSaving(true);
    try {
      // Step 1: Student info save karo
      const { data: student, error } = await supabase
        .from("students")
        .insert({
          full_name:      values.fullName,
          father_name:    values.fatherName,
          mother_name:    values.motherName,
          mobile:         values.mobile,
          class:          values.className,
          aadhaar_number: values.aadhaar,
          samagra_id:     values.samagraId,
          apaar_id:       values.apaarId,
        })
        .select()
        .single();

      if (error) {
        alert("Error saving student: " + error.message);
        return;
      }

      // Step 2: Uploaded files Supabase Storage mein save karo
      const uploadedFiles = (values as any).uploadedFiles ?? [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const f = uploadedFiles[i];
        const filePath = `${student.id}/${i}_${f.fileName}`;

        // Storage mein upload (base64 se blob banao)
        const res = await fetch(f.dataUrl);
        const blob = await res.blob();

        const { error: uploadError } = await supabase.storage
          .from("student-documents")
          .upload(filePath, blob, { contentType: f.mimeType });

        if (uploadError) {
          console.error(`File ${f.fileName} upload error:`, uploadError.message);
          continue;
        }

        // Public URL lo
        const { data: urlData } = supabase.storage
          .from("student-documents")
          .getPublicUrl(filePath);

        // student_documents table mein save karo
        await supabase.from("student_documents").insert({
          student_id: student.id,
          doc_type:   f.fileName,
          file_name:  f.fileName,
          file_url:   urlData.publicUrl,
        });
      }

      alert("✅ Student saved!");
      router.push("/students");

    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setSaving(false);
    }
  }

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
      <StudentForm isSaving={saving} onSave={handleSave} />
    </div>
  );
}
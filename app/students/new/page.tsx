"use client";

import * as React from "react";
import { StudentForm, type StudentFormValues } from "@/components/students/StudentForm";
import supabase from "@/lib/supabase";
import { makeId } from "@/lib/students";

function convertToDBDate(dob: string) {
  if (!dob) return null;

  const [mm, dd, yyyy] = dob.split("-");
  return `${yyyy}-${mm}-${dd}`;
}

export default function NewStudentPage() {
  const [saving, setSaving] = React.useState(false);

  async function handleSave(values: StudentFormValues) {
    setSaving(true);
    try {
      // Step 1: Student info save karo
      const { data: userData } = await supabase.auth.getUser();
      
      const newId = makeId();

const { data: student, error } = await supabase
  .from("students")
  .insert({
    id: newId,
    full_name: values.fullName,
    father_name: values.fatherName,
    mother_name: values.motherName,
    mobile: values.mobile,
    class: values.className,
    aadhaar_number: values.aadhaar,
    samagra_id: values.samagraId,
    scholar_id: values.scholarId,
    roll_number: values.rollNumber,
  
    // 🔥 NEW
    father_occupation: values.fatherOccupation,
    date_of_birth: convertToDBDate(values.dateOfBirth),
    caste: values.caste,
    previous_school: values.previousSchool,
    address: values.address,
    owner_id: userData.user?.id,
  })
        .select()
        .single();

      if (error) {
        alert("Error saving student: " + error.message);
        return;
      }

      // Step 2: Uploaded files Supabase Storage mein save karo
      const uploadedFiles = values.uploadedFiles ?? [];

      for (const f of uploadedFiles) {
        const filePath = `${student.id}/${f.fileName}`;

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
        console.log("Supabase upload public URL:", { filePath, publicUrl: urlData.publicUrl });

        // student_documents table mein save karo
        const { error: docInsertError } = await supabase.from("student_documents").insert({
          student_id: student.id,
          file_name:  filePath,
          file_url:   urlData.publicUrl,
        });
        if (docInsertError) {
          console.error(`student_documents insert failed for ${filePath}:`, docInsertError.message);
        }
      }

      alert("✅ Student saved!");
      window.location.href = "/students";

    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-6">
      <div className="mb-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-black dark:text-white">Add Student</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Upload documents and see preview.
          </p>
        </div>
      </div>
      <StudentForm isSaving={saving} cancelHref="/students" cancelLabel="Back" onSave={handleSave} />
    </div>
  );
}
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Student } from "@/lib/students";
import { fileToDataUrl } from "@/lib/file";

const MAX_DOCS = 10;

export type UploadedFile = {
  file: File;
  dataUrl: string;
  mimeType: string;
  fileName: string;
  size: number;
};

export type StudentFormValues = Omit<Student, "id" | "documents" | "createdAt" | "updatedAt"> & {
  uploadedFiles: UploadedFile[];
};

export function StudentForm({
  initial,
  onCancel,
  cancelHref,
  cancelLabel = "Cancel",
  onSave,
  isSaving,
}: {
  initial?: Partial<Student>;
  onCancel?: () => void;
  cancelHref?: string;
  cancelLabel?: string;
  isSaving: boolean;
  onSave: (values: StudentFormValues) => Promise<void> | void;
}) {
  const errorRef = React.useRef<HTMLDivElement | null>(null);
  type FormFields = {
    fullName: string;
    fatherName: string;
    motherName: string;
    mobile: string;
    className: string;
    aadhaar: string;
    samagraId: string;
    scholarId: string;
    rollNumber: string;
    fatherOccupation: string;
    dateOfBirth: string;
    caste: string;
    previousSchool: string;
    address: string;
  };
  const [values, setValues] = React.useState({
    fullName:   initial?.fullName   ?? "",
    fatherName: initial?.fatherName ?? "",
    motherName: initial?.motherName ?? "",
    mobile:     initial?.mobile     ?? "",
    className:  initial?.className  ?? "",
    aadhaar:    initial?.aadhaar    ?? "",
    samagraId:  initial?.samagraId  ?? "",
    scholarId:    initial?.scholarId    ?? "",
    rollNumber: initial?.rollNumber ?? "",
    fatherOccupation: initial?.fatherOccupation ?? "",
    dateOfBirth: initial?.dateOfBirth ?? "",
    caste: initial?.caste ?? "",
    previousSchool: initial?.previousSchool ?? "",
    address: initial?.address ?? "",
    
  });

  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fileLoading, setFileLoading] = React.useState(false);

  const setField = (key: keyof FormFields, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  // Shared processor for both gallery + camera
  async function processFiles(files: File[], inputEl?: HTMLInputElement) {
    if (!files.length) return;
    const remaining = MAX_DOCS - uploadedFiles.length;
    if (remaining <= 0) {
      setFormError(`Maximum ${MAX_DOCS} documents allowed per student.`);
      return;
    }
    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) {
      setFormError(`Only ${remaining} more file(s) allowed. Rest ignored.`);
    } else {
      setFormError(null);
    }
    setFileLoading(true);
    try {
      const newFiles: UploadedFile[] = await Promise.all(
        toAdd.map(async (file) => {
          const dataUrl = await fileToDataUrl(file);
          return { file, dataUrl, mimeType: file.type || "application/octet-stream", fileName: file.name, size: file.size };
        })
      );
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    } catch {
      setFormError("Failed to read file. Please try again.");
    } finally {
      setFileLoading(false);
      if (inputEl) inputEl.value = "";
    }
  }

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    await processFiles(Array.from(e.target.files ?? []), e.target);
  }

  async function handleCameraChange(e: React.ChangeEvent<HTMLInputElement>) {
    await processFiles(Array.from(e.target.files ?? []), e.target);
  }

  function removeFile(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function validate() {
    if (!values.fullName.trim()) return "Full Name is required.";
    if (!values.fatherName.trim()) return "Father Name is required.";
    if (!values.mobile.trim()) return "Mobile Number is required.";
    const mobile = values.mobile.replace(/\s+/g, "");
    if (!/^\d{10}$/.test(mobile)) return "Mobile Number must be 10 digits.";
    if (values.aadhaar.trim() && !/^\d{12}$/.test(values.aadhaar.replace(/\s+/g, "")))
      return "Aadhaar Number must be 12 digits.";
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) {
      setFormError(err);
      requestAnimationFrame(() => { errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); });
      return;
    }
    setFormError(null);
    try {
      await onSave({
        ...values,
        mobile: values.mobile.replace(/\s+/g, ""),
        aadhaar: values.aadhaar.replace(/\s+/g, ""),
        uploadedFiles,
      });
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Failed to save student.";
      setFormError(message);
      requestAnimationFrame(() => { errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); });
    }
  }

  const canUploadMore = uploadedFiles.length < MAX_DOCS && !fileLoading;

  return (
    <Card className="w-full overflow-x-hidden">
      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
        

        <CardContent className="space-y-6">
          {formError ? (
            <div ref={errorRef} role="alert" aria-live="assertive"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {formError}
            </div>
          ) : null}

          {/* Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Full Name</div>
              <Input value={values.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="e.g., Rahul Sharma" />
            </label>
            <label className="space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Father Name</div>
              <Input value={values.fatherName} onChange={(e) => setField("fatherName", e.target.value)} placeholder="e.g., Ramesh Sharma" />
            </label>
            <label className="space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Mother Name</div>
              <Input value={values.motherName} onChange={(e) => setField("motherName", e.target.value)} placeholder="e.g., Sita Sharma" />
            </label>
            <label className="space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Mobile Number</div>
              <Input inputMode="numeric" value={values.mobile} onChange={(e) => setField("mobile", e.target.value)} placeholder="10 digit number" />
            </label>
            <label className="space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Class</div>
              <Input value={values.className} onChange={(e) => setField("className", e.target.value)} placeholder="e.g., 10th" />
            </label>
             <label className="space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Roll Number</div>
              <Input value={values.rollNumber} onChange={(e) => setField("rollNumber", e.target.value)} placeholder="e.g.,11112" />
            </label>
            <label className="space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Aadhaar Number</div>
              <Input inputMode="numeric" value={values.aadhaar} onChange={(e) => setField("aadhaar", e.target.value)} placeholder="12 digit (optional)" />
            </label>
            <label className="space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Samagra ID</div>
              <Input value={values.samagraId} onChange={(e) => setField("samagraId", e.target.value)} placeholder="optional" />
            </label>
            <label className="space-y-1">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Scholar id</div>
              <Input value={values.scholarId} onChange={(e) => setField("scholarId", e.target.value)} placeholder="optional" />
            </label>
            {/* NEW FIELDS */}

            <label className="space-y-1">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Father Occupation</div>
            <Input
                value={values.fatherOccupation}
                onChange={(e) => setField("fatherOccupation", e.target.value)}placeholder="optional"
            />
            </label>

<label className="space-y-1">
  <div className="text-xs font-medium  text-zinc-700 dark:text-zinc-200">Date of Birth</div>
  <Input
    type="date"
    value={values.dateOfBirth}
    onChange={(e) => setField("dateOfBirth", e.target.value)}
  />
</label>

<label className="space-y-1">
  <div className="text-xs font-medium  text-zinc-700 dark:text-zinc-200">Caste</div>
  <select
    className="w-full border rounded px-3 py-2"
    value={values.caste}
    onChange={(e) => setField("caste", e.target.value)}
  >
    <option value="">Select</option>
    <option value="SC">SC</option>
    <option value="ST">ST</option>
    <option value="OBC">OBC</option>
    <option value="General">General</option>
  </select>
</label>

<label className="space-y-1">
  <div className="text-xs font-medium  text-zinc-700 dark:text-zinc-200">Previous School</div>
  <Input
    value={values.previousSchool}
    onChange={(e) => setField("previousSchool", e.target.value)}placeholder="optional"
  />
</label>

<label className="space-y-1 lg:col-span-3">
  <div className="text-xs font-medium  text-zinc-700 dark:text-zinc-200">Address</div>
  <Input
    value={values.address}
    onChange={(e) => setField("address", e.target.value)}placeholder="optional"
  />
</label>
          </div>

          {/* Documents Upload */}
          <div className="space-y-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold">Documents</div>
              <div className="text-xs text-zinc-500">{uploadedFiles.length}/{MAX_DOCS} uploaded</div>
            </div>

            {canUploadMore ? (
              <div className="grid grid-cols-2 gap-3">

                {/* Camera Button — mobile pe rear camera seedha khulega */}
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-blue-300 bg-blue-50 px-4 py-4 text-center hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950/30 dark:hover:bg-blue-900/40">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                    {fileLoading ? "Reading…" : " Open Camera"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    disabled={fileLoading}
                    onChange={handleCameraChange}
                  />
                </label>

                {/* Gallery / File Picker */}
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 px-4 py-4 text-center hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {fileLoading ? "Reading…" : "Gallery / File"}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    disabled={fileLoading}
                    onChange={handleFilesChange}
                  />
                </label>

              </div>
            ) : (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                Maximum 10 documents uploaded.
              </div>
            )}

            {/* Preview Grid */}
            {uploadedFiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="relative min-w-0 rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
                    {f.mimeType.startsWith("image/") ? (
                      <img src={f.dataUrl} alt={f.fileName} className="h-24 w-full rounded object-cover" />
                    ) : (
                      <div className="flex h-24 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="mt-1 truncate pr-6 text-[11px] text-zinc-500">{f.fileName}</div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label="Remove file"
                      className="absolute right-1 top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="flex flex-row justify-end gap-3 border-t border-zinc-200 py-3 dark:border-zinc-800">
          {cancelHref ? (
            <Button asChild variant="outline" type="button" disabled={isSaving}>
              <Link href={cancelHref}>{cancelLabel}</Link>
            </Button>
          ) : onCancel ? (
            <Button variant="outline" onClick={onCancel} type="button" disabled={isSaving}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button disabled={isSaving} type="submit">
            {isSaving ? "Saving…" : initial ? "Update Student" : "Save Student"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
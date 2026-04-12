"use client";

import * as React from "react";
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
  onSave,
  isSaving,
}: {
  initial?: Partial<Student>;
  onCancel?: () => void;
  isSaving: boolean;
  onSave: (values: StudentFormValues) => Promise<void> | void;
}) {
  const [values, setValues] = React.useState({
    fullName:   initial?.fullName   ?? "",
    fatherName: initial?.fatherName ?? "",
    motherName: initial?.motherName ?? "",
    mobile:     initial?.mobile     ?? "",
    className:  initial?.className  ?? "",
    aadhaar:    initial?.aadhaar    ?? "",
    samagraId:  initial?.samagraId  ?? "",
    apaarId:    initial?.apaarId    ?? "",
  });

  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fileLoading, setFileLoading] = React.useState(false);

  const setField = (key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
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
          return {
            file,
            dataUrl,
            mimeType: file.type || "application/octet-stream",
            fileName: file.name,
            size: file.size,
          };
        })
      );
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    } catch {
      setFormError("Failed to read file. Please try again.");
    } finally {
      setFileLoading(false);
      e.target.value = "";
    }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initial ? "Edit Student" : "Add Student"}</CardTitle>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Fill details and upload documents. Preview loads immediately.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {formError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {formError}
          </div>
        ) : null}

        {/* Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Aadhaar Number</div>
            <Input inputMode="numeric" value={values.aadhaar} onChange={(e) => setField("aadhaar", e.target.value)} placeholder="12 digit (optional)" />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Samagra ID</div>
            <Input value={values.samagraId} onChange={(e) => setField("samagraId", e.target.value)} placeholder="optional" />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">APAAR ID</div>
            <Input value={values.apaarId} onChange={(e) => setField("apaarId", e.target.value)} placeholder="optional" />
          </label>
        </div>

        {/* Documents Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Documents</div>
            <div className="text-xs text-zinc-500">{uploadedFiles.length}/{MAX_DOCS} uploaded</div>
          </div>

          {/* Upload Button */}
          {uploadedFiles.length < MAX_DOCS ? (
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-zinc-300 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                {fileLoading ? "Reading files…" : "+ Upload photos / documents"}
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
          ) : (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
              Maximum 10 documents uploaded.
            </div>
          )}

          {/* Preview Grid */}
          {uploadedFiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="relative rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
                  {f.mimeType.startsWith("image/") ? (
                    <img
                      src={f.dataUrl}
                      alt={f.fileName}
                      className="h-24 w-full rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-24 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                      <span className="text-xs text-zinc-500">PDF</span>
                    </div>
                  )}
                  <div className="mt-1 truncate text-[11px] text-zinc-500">{f.fileName}</div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
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

      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button variant="outline" onClick={onCancel} type="button" disabled={isSaving}>Cancel</Button>
        ) : null}
        <Button
          onClick={async () => {
            const err = validate();
            if (err) { setFormError(err); return; }
            setFormError(null);
            try {
              await onSave({
                ...values,
                mobile: values.mobile.replace(/\s+/g, ""),
                aadhaar: values.aadhaar.replace(/\s+/g, ""),
                uploadedFiles,
              } as any);
            } catch (saveError) {
              const message = saveError instanceof Error ? saveError.message : "Failed to save student.";
              setFormError(message);
            }
          }}
          disabled={isSaving}
          type="button"
        >
          {isSaving ? "Saving…" : initial ? "Update Student" : "Save Student"}
        </Button>
      </CardFooter>
    </Card>
  );
}
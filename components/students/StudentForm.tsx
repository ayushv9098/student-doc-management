"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import type { DocumentType, Student, StoredDocument } from "@/lib/students";
import { fileToDataUrl } from "@/lib/file";

const DOC_TYPES: Array<{ type: DocumentType; label: string; accept: string }> = [
  { type: "aadhaar", label: "Aadhaar Card", accept: ".pdf,.jpg,.jpeg,.png,.webp" },
  { type: "birth", label: "Birth Certificate", accept: ".pdf,.jpg,.jpeg,.png,.webp" },
  { type: "caste", label: "Caste Certificate", accept: ".pdf,.jpg,.jpeg,.png,.webp" },
  { type: "passportPhoto", label: "Passport Size Photo", accept: ".jpg,.jpeg,.png,.webp" },
  { type: "marksheet", label: "Marksheet", accept: ".pdf,.jpg,.jpeg,.png,.webp" },
];

function getImageSrc(doc?: StoredDocument) {
  if (!doc) return null;
  if (!doc.mimeType) return null;
  if (doc.mimeType.startsWith("image/")) return doc.dataUrl;
  return null;
}

export type StudentFormValues = Omit<Student, "id" | "documents" | "createdAt" | "updatedAt"> & {
  documents: Partial<Record<DocumentType, StoredDocument>>;
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
  const [values, setValues] = React.useState<StudentFormValues>(() => ({
    fullName: initial?.fullName ?? "",
    fatherName: initial?.fatherName ?? "",
    motherName: initial?.motherName ?? "",
    mobile: initial?.mobile ?? "",
    className: initial?.className ?? "",
    aadhaar: initial?.aadhaar ?? "",
    samagraId: initial?.samagraId ?? "",
    apaarId: initial?.apaarId ?? "",
    documents: initial?.documents ?? {},
  }));

  const [fileBusyType, setFileBusyType] = React.useState<DocumentType | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const setField = (key: keyof StudentFormValues, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  async function handleFileChange(type: DocumentType, file: File | null) {
    if (!file) return;
    setFormError(null);
    setFileBusyType(type);
    try {
      const dataUrl = await fileToDataUrl(file);
      setValues((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [type]: {
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            dataUrl,
          },
        },
      }));
    } catch {
      setFormError("Failed to read file. Please try another file.");
    } finally {
      setFileBusyType(null);
    }
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Full Name</div>
            <Input
              value={values.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="e.g., Rahul Sharma"
            />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Father Name</div>
            <Input
              value={values.fatherName}
              onChange={(e) => setField("fatherName", e.target.value)}
              placeholder="e.g., Ramesh Sharma"
            />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Mother Name</div>
            <Input
              value={values.motherName}
              onChange={(e) => setField("motherName", e.target.value)}
              placeholder="e.g., Sita Sharma"
            />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Mobile Number</div>
            <Input
              inputMode="numeric"
              value={values.mobile}
              onChange={(e) => setField("mobile", e.target.value)}
              placeholder="10 digit number"
            />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Class</div>
            <Input
              value={values.className}
              onChange={(e) => setField("className", e.target.value)}
              placeholder="e.g., 10th"
            />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Aadhaar Number</div>
            <Input
              inputMode="numeric"
              value={values.aadhaar}
              onChange={(e) => setField("aadhaar", e.target.value)}
              placeholder="12 digit (optional)"
            />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Samagra ID</div>
            <Input
              value={values.samagraId}
              onChange={(e) => setField("samagraId", e.target.value)}
              placeholder="optional"
            />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">APAAR ID</div>
            <Input
              value={values.apaarId}
              onChange={(e) => setField("apaarId", e.target.value)}
              placeholder="optional"
            />
          </label>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Documents (upload)</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DOC_TYPES.map((d) => {
              const doc = values.documents[d.type];
              const imgSrc = getImageSrc(doc);
              return (
                <div key={d.type} className="space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        {d.label}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {doc ? `${doc.fileName}` : "Choose a file"}
                      </div>
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {fileBusyType === d.type ? "Reading…" : doc ? doc.size ? `${Math.round(doc.size/1024)} KB` : "" : ""}
                    </div>
                  </div>

                  <Input
                    type="file"
                    accept={d.accept}
                    disabled={fileBusyType !== null}
                    onChange={(e) => handleFileChange(d.type, e.target.files?.[0] ?? null)}
                    className="h-auto border-none bg-transparent p-0 shadow-none"
                  />

                  {imgSrc ? (
                    <div className="mt-1">
                      <img
                        src={imgSrc}
                        alt={d.label}
                        className="h-24 w-24 rounded-md border border-zinc-200 object-cover dark:border-zinc-800"
                      />
                    </div>
                  ) : doc ? (
                    <div className="mt-1">
                      <a
                        href={doc.dataUrl}
                        download={doc.fileName}
                        className="text-xs text-black underline hover:text-zinc-700 dark:text-white dark:hover:text-zinc-200"
                      >
                        Download/Preview
                      </a>
                      <div className="text-[11px] text-zinc-500 mt-1">{doc.mimeType}</div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button variant="outline" onClick={onCancel} type="button" disabled={isSaving}>
            Cancel
          </Button>
        ) : null}
        <Button
          onClick={async () => {
            const err = validate();
            if (err) {
              setFormError(err);
              return;
            }
            setFormError(null);
            const normalized: StudentFormValues = {
              ...values,
              mobile: values.mobile.replace(/\s+/g, ""),
              aadhaar: values.aadhaar.replace(/\s+/g, ""),
            };
            await onSave(normalized);
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


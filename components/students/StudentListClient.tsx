"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Student } from "@/lib/students";
import { loadStudentsFromSupabase } from "@/lib/students";
import supabase from "@/lib/supabase";

import { StudentForm, type StudentFormValues } from "@/components/students/StudentForm";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

const ROW_HEIGHT = 64;
const OVERSCAN = 6;

function matchesQuery(student: Student, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    student.fullName.toLowerCase().includes(q) ||
    student.fatherName.toLowerCase().includes(q) ||
    student.mobile.toLowerCase().includes(q) ||
    (student.aadhaar ?? "").toLowerCase().includes(q) ||
    (student.samagraId ?? "").toLowerCase().includes(q) ||
    (student.scholarId ?? "").toLowerCase().includes(q) ||
    student.id.toLowerCase().includes(q)
  );
}

export function StudentListClient() {
  const router = useRouter();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const [editing, setEditing] = React.useState<Student | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [savingEdit, setSavingEdit] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<Student | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [savingDelete, setSavingDelete] = React.useState(false);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState(420);
  const rowsScrollRef = React.useRef<HTMLDivElement | null>(null);

  // ✅ Supabase se students load karo
  React.useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const data = await loadStudentsFromSupabase();
        setStudents(data);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const filtered = React.useMemo(() => {
    return students
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((s) => matchesQuery(s, query));
  }, [students, query]);

  React.useEffect(() => {
    const el = rowsScrollRef.current;
    if (!el) return;
    const updateHeight = () => setViewportHeight(el.clientHeight || 420);
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    setScrollTop(0);
    rowsScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [query]);

  const visibleRange = React.useMemo(() => {
    const total = filtered.length;
    if (total === 0) return { start: 0, end: 0, topPadding: 0, bottomPadding: 0 };
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN * 2;
    const end = Math.min(total, start + visibleCount);
    return {
      start,
      end,
      topPadding: start * ROW_HEIGHT,
      bottomPadding: Math.max(0, (total - end) * ROW_HEIGHT),
    };
  }, [filtered.length, scrollTop, viewportHeight]);

  const visibleStudents = React.useMemo(
    () => filtered.slice(visibleRange.start, visibleRange.end),
    [filtered, visibleRange.end, visibleRange.start]
  );

  // ✅ Edit — Supabase mein update karo
  async function handleSaveStudent(values: StudentFormValues) {
    if (!editing) return;
    setSavingEdit(true);
  
    try {
      // student details update
      const { error } = await supabase
        .from("students")
        .update({
          full_name: values.fullName,
          father_name: values.fatherName,
          mother_name: values.motherName,
          mobile: values.mobile.replace(/\s+/g, ""),
          class: values.className,
          aadhaar_number: values.aadhaar.replace(/\s+/g, ""),
          samagra_id: values.samagraId,
          scholar_id: values.scholarId,
        })
        .eq("id", Number(editing.id));
  
      if (error) {
        alert("Update error: " + error.message);
        return;
      }
  
  
      // =========================
      // NEW PHOTOS/DOCS UPLOAD
      // =========================
      if (values.uploadedFiles?.length) {
  
        // optional old docs delete (replace old photos)
        await supabase
          .from("student_documents")
          .delete()
          .eq("student_id", editing.id);
  
  
        for (const file of values.uploadedFiles) {
  
          const filePath =
            `${editing.id}/${Date.now()}-${file.fileName}`;
  
          const blob = await fetch(file.dataUrl).then(r=>r.blob());
  
          const { error: uploadError } = await supabase.storage
            .from("student-documents")
            .upload(
               filePath,
               blob,
               {
                 upsert:true,
                 contentType:file.mimeType
               }
            );
  
          if(uploadError){
            console.log(uploadError);
            continue;
          }
  
  
          const { data:urlData } = supabase.storage
            .from("student-documents")
            .getPublicUrl(filePath);
  
  
          await supabase
            .from("student_documents")
            .insert({
               student_id: editing.id,
               doc_type:"photo",
               file_name:file.fileName,
               file_url:urlData.publicUrl
            });
        }
      }
  
  
      // local state update
      setStudents((prev)=>
        prev.map((s)=>
          s.id===editing.id
          ?{
            ...s,
            fullName: values.fullName,
            fatherName: values.fatherName,
            motherName: values.motherName,
            mobile: values.mobile,
            className: values.className,
            aadhaar: values.aadhaar,
            samagraId: values.samagraId,
            scholarId: values.scholarId,
            updatedAt: Date.now()
          }
          :s
        )
      );
  
      setEditOpen(false);
  
    } finally {
      setSavingEdit(false);
    }
  }

  // ✅ Delete — Supabase se delete karo
  async function handleDelete() {
    if (!deleteTarget) return;
    setSavingDelete(true);
    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) {
        alert("Delete error: " + error.message);
        return;
      }

      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteOpen(false);
    } finally {
      setSavingDelete(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Card className="flex h-[calc(100vh-12rem)] min-h-[420px] flex-col overflow-hidden">
        <CardHeader className="space-y-2">
          <CardTitle>Students</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Search instantly by name, mobile, Aadhaar, Samagra ID, scholar ID or student ID.
            </p>
            <div className="w-full sm:w-[340px]">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 overflow-hidden">
          {loading ? (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              Loading students…
            </div>
          ) : null}

          {!loading && filtered.length === 0 ? (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              No students found.
            </div>
          ) : null}

          {!loading && filtered.length > 0 ? (
            <div
              ref={rowsScrollRef}
              className="h-full overflow-y-auto overflow-x-hidden rounded-md border border-zinc-200 dark:border-zinc-800"
              onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
            >
              <table className="w-full table-fixed caption-bottom text-sm">
                <TableHeader className="sticky top-0 z-10 bg-white dark:bg-zinc-950">
                  <TableRow>
                  <TableHead className="w-[40%]">Full Name</TableHead>
                  <TableHead className="w-[20%]">Class</TableHead>
                  <TableHead className="w-[25%]">Scholar ID</TableHead>
                  <TableHead className="w-[15%] min-w-[80px] text-right">
                     Action
                  </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRange.topPadding > 0 ? (
                    <TableRow aria-hidden="true">
                      <TableCell colSpan={4} style={{ height: `${visibleRange.topPadding}px`, padding: 0 }} />
                    </TableRow>
                  ) : null}

                  {visibleStudents.map((s) => (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/students/${encodeURIComponent(s.id)}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate">{s.fullName}</span>
                          <span className="truncate text-[11px] text-zinc-500">{s.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="truncate">{s.className}</TableCell>
                      <TableCell className="truncate">{s.scholarId || "—"}</TableCell>
                      <TableCell
                       className="w-[80px] whitespace-nowrap text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="More actions">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditing(s); setEditOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); router.push(`/students/${encodeURIComponent(s.id)}`); }}>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-300"
                              onSelect={(e) => { e.preventDefault(); setDeleteTarget(s); setDeleteOpen(true); }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {visibleRange.bottomPadding > 0 ? (
                    <TableRow aria-hidden="true">
                      <TableCell colSpan={4} style={{ height: `${visibleRange.bottomPadding}px`, padding: 0 }} />
                    </TableRow>
                  ) : null}
                </TableBody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
            <DialogDescription>Update student details and documents.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <StudentForm
              initial={editing}
              isSaving={savingEdit}
              onSave={handleSaveStudent}
              onCancel={() => setEditOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this student?</DialogTitle>
            <DialogDescription>
              This will permanently delete the student from Supabase.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={savingDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={savingDelete}>
              {savingDelete ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
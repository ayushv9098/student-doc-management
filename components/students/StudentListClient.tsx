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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Student } from "@/lib/students";
import { loadStudentsFromStorage, saveStudentsToStorage } from "@/lib/students";

import { StudentForm, type StudentFormValues } from "@/components/students/StudentForm";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

function matchesQuery(student: Student, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    student.fullName.toLowerCase().includes(q) ||
    student.fatherName.toLowerCase().includes(q) ||
    student.mobile.toLowerCase().includes(q) ||
    (student.aadhaar ?? "").toLowerCase().includes(q) ||
    (student.samagraId ?? "").toLowerCase().includes(q) ||
    (student.apaarId ?? "").toLowerCase().includes(q) ||
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

  React.useEffect(() => {
    setLoading(true);
    try {
      setStudents(loadStudentsFromStorage());
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = React.useMemo(() => {
    return students
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((s) => matchesQuery(s, query));
  }, [students, query]);

  async function handleSaveStudent(values: StudentFormValues) {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const next: Student[] = students.map((s) =>
        s.id === editing.id
          ? {
              ...s,
              ...values,
              mobile: values.mobile.replace(/\s+/g, ""),
              aadhaar: values.aadhaar.replace(/\s+/g, ""),
              updatedAt: Date.now(),
            }
          : s
      );
      setStudents(next);
      saveStudentsToStorage(next);
      setEditOpen(false);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSavingDelete(true);
    try {
      const next = students.filter((s) => s.id !== deleteTarget.id);
      setStudents(next);
      saveStudentsToStorage(next);
      setDeleteOpen(false);
    } finally {
      setSavingDelete(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Students</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Search instantly by name, mobile, Aadhaar, Samagra ID, APAAR ID or student ID.
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

        <CardContent>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Aadhaar</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{s.fullName}</span>
                        <span className="text-[11px] text-zinc-500">
                          {s.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{s.mobile}</TableCell>
                    <TableCell>{s.className}</TableCell>
                    <TableCell>{s.aadhaar || "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="More actions">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setEditing(s);
                              setEditOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              router.push(`/students/${encodeURIComponent(s.id)}`);
                            }}
                          >
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-300"
                            onSelect={(e) => {
                              e.preventDefault();
                              setDeleteTarget(s);
                              setDeleteOpen(true);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
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
              This will remove the student and their saved previews from localStorage.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={savingDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={savingDelete}
            >
              {savingDelete ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


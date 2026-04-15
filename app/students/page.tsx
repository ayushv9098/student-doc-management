"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StudentListClient } from "@/components/students/StudentListClient";

export default function StudentsPage() {
  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-black dark:text-white">Manage Students</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Table view with instant search.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild className="w-full sm:w-auto" variant="outline">
              <Link href="/">Back</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/students/new">+ Add Student</Link>
            </Button>
          </div>
        </div>
      </div>
      <StudentListClient />
    </div>
  );
}


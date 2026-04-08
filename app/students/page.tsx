"use client";

import { Button } from "@/components/ui/button";
import { StudentListClient } from "@/components/students/StudentListClient";
import Link from "next/link";

export default function StudentsPage() {
  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-black dark:text-white">Manage Students</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Table view with instant search.
            </p>
          </div>
          <Link href="/students/new">
            <Button>+ Add Student</Button>
          </Link>
        </div>
      </div>
      <StudentListClient />
    </div>
  );
}


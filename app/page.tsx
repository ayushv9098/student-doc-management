"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadStudentsFromSupabase } from "@/lib/students";

// ✅ Student type define 
type Student = {
  id: string;
  fullName: string;
  mobile: string;
  className: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [recent, setRecent] = useState<Student[]>([]); // ✅ Type specify kiya

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
      } else {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    async function load() {
      setLoading(true);
      try {
        const students = await loadStudentsFromSupabase();
        // ✅ Ensure createdAt exists, otherwise sort by id or something
        const sorted = students.slice().sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt - a.createdAt;
          }
          return 0;
        });
        setCount(students.length);
        setRecent(
          sorted.slice(0, 20).map((s) => ({
            id: s.id,
            fullName: s.fullName,
            mobile: s.mobile,
            className: s.className,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authChecked]);

  if (!authChecked) {
    return <div className="flex h-screen items-center justify-center">Checking login...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/students">View Students</Link>
          </Button>
          <Button asChild>
            <Link href="/students/new">+ Add student</Link>
          </Button>
        </div>
      </div>

      {/* Total students card */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-h-[200px] lg:col-span-1">
          <CardHeader><CardTitle>Total Students</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="h-10 animate-pulse rounded bg-zinc-200" /> : <div className="text-4xl font-bold">{count}</div>}
          </CardContent>
        </Card>

        {/* Recent students card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Added</CardTitle>
            <p className="text-sm text-zinc-600">Latest students (scroll to view more).</p>
          </CardHeader>
          <CardContent className="pt-3">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded border bg-zinc-50" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="rounded-md border p-4 text-sm">No students yet. Click "Add" to create your first student.</div>
            ) : (
              <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {recent.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{s.fullName}</div>
                    <div className="truncate text-xs text-zinc-500">
                      {s.className} • {s.mobile}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/students/${encodeURIComponent(s.id)}`}>Open</Link>
                  </Button>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
        <div className="pt-6 text-center text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
        © 2026 Designed & Developed by
  <span className="font-medium text-zinc-400 dark:text-zinc-300 ml-1">
    AV Infra
  </span>
</div>
      </div>
    </div>
  );
}
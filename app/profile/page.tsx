"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, [router]);

  async function handleLogout() {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-zinc-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      {/* Back button */}

      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <CardTitle className="text-xl font-semibold">Profile</CardTitle>
          <p className="text-sm text-zinc-500">Manage your account details</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Avatar + Email Row - responsive */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl font-bold text-white dark:bg-white dark:text-black">
              {profile?.school_name?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="text-center sm:text-left">
              <div className="font-medium break-all">{user?.email}</div>
              <div className="text-sm text-zinc-500">Account Owner</div>
            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* Details - always vertical on mobile, grid on desktop */}
          <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
            <div>
              <label className="block text-xs font-medium uppercase text-zinc-500">School Name</label>
              <p className="mt-1 text-base font-medium break-words">{profile?.school_name || "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase text-zinc-500">Admin Name</label>
              <p className="mt-1 text-base font-medium break-words">{profile?.admin_name || "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium uppercase text-zinc-500">Email Address</label>
              <p className="mt-1 text-base font-medium break-all">{user?.email}</p>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase text-zinc-500">Member Since</label>
              <p className="mt-1 text-base font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="flex justify-end gap-3 pt-4">
    <Button onClick={handleLogout} variant="destructive">
      Sign Out
    </Button>
    <Button variant="outline" onClick={() => router.back()}>
      ← Back
    </Button>
  </div>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push("/login");
          return;
        }
        setUser(user);

        let { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code === "PGRST116") {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({ id: user.id, school_name: "", admin_name: "" })
            .select()
            .single();
          if (!insertError) data = newProfile;
          else setError("Could not create profile");
        } else if (profileError) {
          setError(profileError.message);
        }
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  async function handleLogout() {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function updateProfile(field: string, value: string) {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", user.id);
    if (error) alert("Update failed: " + error.message);
    else setProfile((prev: any) => ({ ...prev, [field]: value }));
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Loading profile...</div>;
  if (error) return <div className="p-10 text-red-600">Error: {error}</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <CardTitle className="text-xl font-semibold">Profile</CardTitle>
          <p className="text-sm text-zinc-500">Manage your account details</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl font-bold text-white">
              {profile?.school_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="text-center sm:text-left">
              <div className="font-medium break-all">{user?.email}</div>
              <div className="text-sm text-zinc-500">Account Owner</div>
            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* Details */}
          <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
            <div>
              <label className="block text-xs font-medium uppercase text-zinc-500">School Name</label>
              {profile?.school_name ? (
                <p className="mt-1 text-base font-medium break-words">{profile.school_name}</p>
              ) : (
                <div className="mt-1 flex gap-2">
                  <input type="text" placeholder="Enter school name" className="flex-1 rounded border px-2 py-1 text-sm" id="schoolInput" />
                  <Button size="sm" onClick={() => {
                    const input = document.getElementById("schoolInput") as HTMLInputElement;
                    if (input.value) updateProfile("school_name", input.value);
                  }}>Save</Button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium uppercase text-zinc-500">Admin Name</label>
              {profile?.admin_name ? (
                <p className="mt-1 text-base font-medium break-words">{profile.admin_name}</p>
              ) : (
                <div className="mt-1 flex gap-2">
                  <input type="text" placeholder="Enter admin name" className="flex-1 rounded border px-2 py-1 text-sm" id="adminInput" />
                  <Button size="sm" onClick={() => {
                    const input = document.getElementById("adminInput") as HTMLInputElement;
                    if (input.value) updateProfile("admin_name", input.value);
                  }}>Save</Button>
                </div>
              )}
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

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => router.back()}>← Back</Button>
            <Button onClick={handleLogout} variant="destructive">Sign Out</Button>
          </div>

          {/* 🏷️ BRANDING FOOTER - Created by Ayush Vishwakarma */}
          <div className="pt-6 text-center text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
          © 2026 Designed & Developed by AV Infra 
  <span className="font-medium text-zinc-400 dark:text-zinc-300 ml-1">
    AV Infra
  </span>
</div>
        </CardContent>
      </Card>
    </div>
  );
}
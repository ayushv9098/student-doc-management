"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const router = useRouter();

  const [schoolName, setSchoolName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSignup(e: any) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMsg(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setMsg("User creation failed");
      setLoading(false);
      return;
    }

    // 2. Insert profile with school_name and admin_name
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      school_name: schoolName,
      admin_name: adminName,
    });

    if (profileError) {
      console.error("Profile insert error:", profileError);
      setMsg("Account created but profile save failed. Please contact support.");
      setLoading(false);
      return;
    }

    setMsg("Account created successfully!");
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">School Signup</CardTitle>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <Input
              placeholder="School Name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
            />
            <Input
              placeholder="Admin Name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {msg && (
              <p className={`text-sm ${msg.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
                {msg}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-zinc-600">
              Already have an account?
              <a href="/login" className="ml-2 underline">Login</a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
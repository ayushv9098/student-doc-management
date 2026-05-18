"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase";

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

    // 2. Insert profile with email, password, school_name and admin_name
    // ⚠️ SECURITY WARNING: Storing plain-text passwords in a database table is NOT recommended.
    // Supabase Auth already hashes and stores passwords securely. 
    // This is being added as per your specific request.
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email: email,
      password: password, // Plain text password (Security Risk)
      school_name: schoolName,
      admin_name: adminName,
    });

    if (profileError) {
      console.error("Profile insert error:", profileError);
      setMsg("Account created but profile save failed. Please contact support.");
      setLoading(false);
      return;
    }

    setMsg("Account created! Please check your email to confirm your account before logging in.");
    // Optionally redirect to login after a delay
    setTimeout(() => {
      router.push("/login");
    }, 5000);
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
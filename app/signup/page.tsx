"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
 const router = useRouter();

 const [schoolName,setSchoolName]=useState("");
 const [adminName,setAdminName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [loading,setLoading]=useState(false);
 const [msg,setMsg]=useState("");

 async function handleSignup(e:any){
   e.preventDefault();

   setLoading(true);
   setMsg("");

   const { data,error } = await supabase.auth.signUp({
      email,
      password
   });

   if(error){
      setMsg(error.message);
      setLoading(false);
      return;
   }

   // profile save
   await supabase.from("profiles").insert({
      id:data.user?.id,
      school_name:schoolName,
      admin_name:adminName
   });

   setMsg("Account created successfully");

   setTimeout(()=>{
      router.push("/login");
   },1500);
 }

 return (
<div className="min-h-screen flex items-center justify-center px-4">
<form
onSubmit={handleSignup}
className="w-full max-w-md rounded-xl border p-6 space-y-4"
>

<h1 className="text-2xl font-bold">
School Signup
</h1>

<input
className="w-full border p-3 rounded"
placeholder="School Name"
value={schoolName}
onChange={(e)=>setSchoolName(e.target.value)}
required
/>

<input
className="w-full border p-3 rounded"
placeholder="Admin Name"
value={adminName}
onChange={(e)=>setAdminName(e.target.value)}
required
/>

<input
type="email"
className="w-full border p-3 rounded"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
required
/>

<input
type="password"
className="w-full border p-3 rounded"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>

<button
disabled={loading}
className="w-full rounded bg-black text-white p-3"
>
{loading ? "Creating..." : "Create Account"}
</button>

{msg && (
<p className="text-sm">
{msg}
</p>
)}

<p className="text-sm text-center">
Already have account?
<a href="/login" className="underline ml-2">
Login
</a>
</p>

</form>
</div>
 );
}
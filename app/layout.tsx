import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/site/Navbar";

export const metadata: Metadata = {
  title: "Student Docs",
  description: "Manage student records",
};

export default function RootLayout({
 children,
}:{
 children: React.ReactNode;
}) {
 return (
   <html lang="en" className="h-full antialiased">
     <body className="min-h-full bg-zinc-100 text-black">
       <Navbar />
       <main className="pt-16 sm:pt-20">
         {children}
       </main>
     </body>
   </html>
 );
}
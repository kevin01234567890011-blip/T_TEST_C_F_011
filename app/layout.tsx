import "./globals.css";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { getCurrentUserAndProfile } from "@/lib/auth";

export const metadata = { title: "SimpleStore", description: "A small Supabase-powered store" };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { profile } = await getCurrentUserAndProfile();
  return <html lang="en"><body><Header initialProfile={profile} /><main className="mx-auto max-w-6xl px-4 py-8">{children}</main></body></html>;
}

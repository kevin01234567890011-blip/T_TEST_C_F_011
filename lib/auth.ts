import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Profile } from "@/types/database";

export async function getCurrentUserAndProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { supabase, user: null, profile: null as Profile | null };

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (profileError) throw new Error(profileError.message);
  return { supabase, user, profile };
}

export async function requireUser() {
  const result = await getCurrentUserAndProfile();
  if (!result.user || !result.profile) redirect("/login");
  return result as typeof result & { user: NonNullable<typeof result.user>; profile: Profile };
}

export async function requireAdmin() {
  const result = await requireUser();
  if (result.profile.role !== "ADMIN") redirect("/");
  return result;
}

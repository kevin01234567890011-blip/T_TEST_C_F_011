import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Profile } from "@/types/database";

type AuthResult = {
  supabase: SupabaseClient<Database>;
  user: User | null;
  profile: Profile | null;
};

export async function getCurrentUserAndProfile(): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const user = data.user;
  if (authError || !user) return { supabase, user: null, profile: null };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(profileError.message);
  return { supabase, user, profile };
}

type RequiredAuthResult = {
  supabase: SupabaseClient<Database>;
  user: User;
  profile: Profile;
};

export async function requireUser(): Promise<RequiredAuthResult> {
  const result = await getCurrentUserAndProfile();
  if (!result.user || !result.profile) redirect("/login");
  return { supabase: result.supabase, user: result.user, profile: result.profile };
}

export async function requireAdmin(): Promise<RequiredAuthResult> {
  const result = await requireUser();
  if (result.profile.role !== "ADMIN") redirect("/");
  return result;
}

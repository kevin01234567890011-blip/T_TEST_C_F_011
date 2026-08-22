import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
export async function GET() { const { supabase } = await requireAdmin(); const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ profiles: data ?? [] }); }

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const schema = z.object({ first_name: z.string().trim().min(1).max(100), last_name: z.string().trim().min(1).max(100), phone: z.string().trim().min(1).max(30), address: z.string().trim().min(1).max(500) });

export async function PATCH(request: Request) { const { supabase, user } = await requireUser(); const body: unknown = await request.json(); const parsed = schema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: "Invalid profile data." }, { status: 400 }); const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ ok: true }); }
export async function DELETE() { const { supabase, user } = await requireUser(); const { error } = await supabase.from("profiles").delete().eq("id", user.id); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); await supabase.auth.signOut(); return NextResponse.json({ ok: true }); }

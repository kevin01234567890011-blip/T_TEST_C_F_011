import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const idSchema = z.string().uuid();
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) { const { supabase, user } = await requireUser(); const { id } = await params; if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid order id." }, { status: 400 }); const { error } = await supabase.from("orders").update({ status: "CANCELLED" }).eq("id", id).eq("user_id", user.id).eq("status", "PENDING"); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ ok: true }); }

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
const schema = z.object({ status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const { supabase } = await requireAdmin(); const id = z.string().uuid().safeParse((await params).id); if (!id.success) return NextResponse.json({ error: "Invalid order id." }, { status: 400 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid order status." }, { status: 400 }); const { error } = await supabase.from("orders").update({ status: parsed.data.status, updated_at: new Date().toISOString() }).eq("id", id.data); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ ok: true }); }

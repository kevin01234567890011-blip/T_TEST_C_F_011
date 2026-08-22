import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({ name: z.string().trim().min(1).max(200), description: z.string().trim().min(1).max(2000), price: z.coerce.number().positive().finite(), imageUrl: z.string().url().max(2000) });
export async function GET() { const { supabase } = await requireAdmin(); const { data, error } = await supabase.from("products").select("*").order("id"); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ products: data ?? [] }); }
export async function POST(request: Request) { const { supabase } = await requireAdmin(); const body: unknown = await request.json(); const parsed = schema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: "Invalid product data." }, { status: 400 }); const { data, error } = await supabase.from("products").insert({ name: parsed.data.name, description: parsed.data.description, price: parsed.data.price, image_url: parsed.data.imageUrl }).select().single(); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ product: data }); }

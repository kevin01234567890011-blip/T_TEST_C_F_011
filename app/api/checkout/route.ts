import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { CART_COOKIE, parseCart } from "@/lib/cart";

const schema = z.object({ phone: z.string().trim().min(1).max(30), address: z.string().trim().min(1).max(500) });

export async function POST(request: Request) {
  try {
    const { supabase } = await requireUser();
    const body: unknown = await request.json();
    const values = schema.parse(body);
    const cookieStore = await cookies();
    const cart = parseCart(cookieStore.get(CART_COOKIE)?.value);
    if (!cart.length) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    const validatedItems = cart.map(({ productId, quantity }) => ({ product_id: productId, quantity }));
    const { data: orderId, error } = await supabase.rpc("create_order", { p_items: validatedItems, p_phone: values.phone, p_address: values.address });
    if (error || !orderId) return NextResponse.json({ error: error?.message ?? "Order creation failed." }, { status: 400 });
    return NextResponse.json({ ok: true, orderId });
  } catch (error) {
    const message = error instanceof z.ZodError ? "Invalid checkout data." : error instanceof Error ? error.message : "Unable to place order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

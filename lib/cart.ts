import { z } from "zod";

export const CART_COOKIE = "shop_cart";

const cartItemSchema = z.object({ productId: z.coerce.number().int().positive(), quantity: z.coerce.number().int().min(1).max(99) });
const cartSchema = z.array(cartItemSchema).max(50);
export type CartItem = z.infer<typeof cartItemSchema>;

export function parseCart(value: string | undefined): CartItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    const result = cartSchema.safeParse(parsed);
    if (!result.success) return [];
    const merged = new Map<number, number>();
    for (const item of result.data) merged.set(item.productId, Math.min(99, (merged.get(item.productId) ?? 0) + item.quantity));
    return Array.from(merged, ([productId, quantity]) => ({ productId, quantity }));
  } catch { return []; }
}

export function serializeCart(items: CartItem[]) { return JSON.stringify(parseCart(JSON.stringify(items))); }

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { money } from "@/lib/format";
import { CART_COOKIE, parseCart, type CartItem } from "@/lib/cart";
import type { Product } from "@/types/database";

function readCookie(): CartItem[] {
  try {
    const raw = document.cookie.split(";").find((part) => part.trim().startsWith(`${CART_COOKIE}=`))?.split("=").slice(1).join("=");
    return parseCart(raw ? decodeURIComponent(raw) : undefined);
  } catch { return []; }
}

function saveCookie(items: CartItem[]) {
  const safe = parseCart(JSON.stringify(items));
  document.cookie = `${CART_COOKIE}=${encodeURIComponent(JSON.stringify(safe))}; Path=/; Max-Age=2592000; SameSite=Lax`;
  window.dispatchEvent(new Event("cart:changed"));
}

export function addToCart(productId: number, quantity = 1) {
  const items = readCookie();
  const existing = items.find((item) => item.productId === productId);
  if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
  else items.push({ productId, quantity: Math.min(99, Math.max(1, quantity)) });
  saveCookie(items);
  window.dispatchEvent(new Event("cart:open"));
}

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const sync = () => setCart(readCookie());
    sync();
    window.addEventListener("cart:changed", sync);
    window.addEventListener("cart:open", () => {});
    return () => window.removeEventListener("cart:changed", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const ids = cart.map((item) => item.productId);
    if (!ids.length) { setProducts([]); return; }
    const supabase = createSupabaseBrowserClient();
    void supabase.from("products").select("*").in("id", ids).then(({ data }) => setProducts((data ?? []) as Product[]));
  }, [open, cart]);

  const rows = useMemo(() => cart.map((item) => ({ item, product: products.find((product) => product.id === item.productId) })).filter((row): row is { item: CartItem; product: Product } => Boolean(row.product)), [cart, products]);
  const total = rows.reduce((sum, row) => sum + Number(row.product.price) * row.item.quantity, 0);

  function change(productId: number, quantity: number) {
    const next = cart.map((item) => item.productId === productId ? { ...item, quantity } : item).filter((item) => item.quantity > 0);
    saveCookie(next);
    setCart(next);
  }

  return <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
    <button aria-label="Close cart" className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
    <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between border-b p-5"><h2 className="text-lg font-semibold">Your cart</h2><button onClick={onClose} className="rounded px-2 py-1 text-gray-500">✕</button></div>
      <div className="flex h-[calc(100%-76px)] flex-col">
        <div className="flex-1 overflow-y-auto p-5">
          {!rows.length ? <p className="text-sm text-gray-500">Your cart is empty.</p> : <div className="space-y-4">{rows.map(({ item, product }) => <div key={product.id} className="rounded-xl border p-3">
            <div className="flex gap-3"><img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="font-medium">{product.name}</p><p className="text-sm text-gray-500">{money(product.price)} each</p></div></div>
            <div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-2"><button onClick={() => change(product.id, item.quantity - 1)} className="h-8 w-8 rounded border">−</button><span className="w-6 text-center">{item.quantity}</span><button onClick={() => change(product.id, Math.min(99, item.quantity + 1))} className="h-8 w-8 rounded border">+</button></div><button onClick={() => change(product.id, 0)} className="text-sm text-red-600">Remove</button></div>
          </div>)}</div>}
        </div>
        <div className="border-t p-5"><div className="mb-4 flex justify-between text-base font-semibold"><span>Total</span><span>{money(total)}</span></div><Link href="/checkout" onClick={onClose} className={`block rounded-xl bg-gray-900 px-4 py-3 text-center font-medium text-white ${rows.length ? "" : "pointer-events-none opacity-50"}`}>Proceed to checkout</Link></div>
      </div>
    </aside>
  </div>;
}

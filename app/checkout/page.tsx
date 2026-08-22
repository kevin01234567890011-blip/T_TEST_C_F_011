import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { parseCart, CART_COOKIE, type CartItem } from "@/lib/cart";
import { money } from "@/lib/format";
import { CheckoutForm } from "@/components/CheckoutForm";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Product } from "@/types/database";

export default async function CheckoutPage() {
  const { profile } = await requireUser();
  const cookieStore = await cookies();
  const cart = parseCart(cookieStore.get(CART_COOKIE)?.value);
  if (!cart.length) redirect("/");
  const supabase = await createSupabaseServerClient();
  const ids = cart.map((item) => item.productId);
  const { data, error } = await supabase.from("products").select("*").in("id", ids);
  if (error) throw new Error(error.message);
  const products = (data ?? []) as Product[];
  const valid = cart.filter((item) => products.some((product) => product.id === item.productId));
  const total = valid.reduce((sum, item) => sum + Number(products.find((product) => product.id === item.productId)?.price ?? 0) * item.quantity, 0);
  return <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"><section className="rounded-2xl bg-white p-6 ring-1 ring-gray-200"><h1 className="text-3xl font-bold">Checkout</h1><p className="mt-2 text-sm text-gray-500">Cash on Delivery</p><div className="mt-6"><CheckoutForm defaultPhone={profile.phone} defaultAddress={profile.address} /></div></section><aside className="h-fit rounded-2xl bg-white p-6 ring-1 ring-gray-200"><h2 className="text-xl font-semibold">Order summary</h2><div className="mt-5 space-y-4">{valid.map((item: CartItem) => { const product = products.find((row) => row.id === item.productId)!; return <div key={item.productId} className="flex justify-between gap-3 text-sm"><div><p className="font-medium">{product.name}</p><p className="text-gray-500">{item.quantity} × {money(product.price)}</p></div><span>{money(Number(product.price) * item.quantity)}</span></div>; })}</div><div className="mt-5 flex justify-between border-t pt-4 font-semibold"><span>Total</span><span>{money(total)}</span></div></aside></div>;
}

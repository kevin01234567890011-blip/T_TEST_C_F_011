import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { money } from "@/lib/format";
import type { Product } from "@/types/database";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("*").order("id");
  if (error) throw new Error(error.message);
  const products = (data ?? []) as Product[];
  return <div className="space-y-8"><section><p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">Store</p><h1 className="text-4xl font-bold tracking-tight">Everything in one place.</h1><p className="mt-2 max-w-2xl text-gray-600">Browse the products currently available from the database.</p></section><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"><Link href={`/product/${product.id}`}><img src={product.image_url} alt={product.name} className="h-56 w-full object-cover" /></Link><div className="p-5"><Link href={`/product/${product.id}`}><h2 className="text-lg font-semibold">{product.name}</h2></Link><p className="mt-2 min-h-12 text-sm text-gray-600">{product.description}</p><div className="mt-4 flex items-center justify-between"><span className="font-semibold">{money(product.price)}</span><AddToCartButton productId={product.id} /></div></div></article>)}</div></div>;
}

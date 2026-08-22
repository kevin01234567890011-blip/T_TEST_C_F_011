import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { money } from "@/lib/format";
import type { Product } from "@/types/database";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) notFound();
  const product = data as Product;
  return <div className="grid gap-8 md:grid-cols-2"><div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200"><img src={product.image_url} alt={product.name} className="h-full max-h-[600px] w-full object-cover" /></div><div className="flex flex-col justify-center"><p className="text-sm uppercase tracking-widest text-gray-500">Product</p><h1 className="mt-2 text-4xl font-bold">{product.name}</h1><p className="mt-5 text-lg leading-8 text-gray-600">{product.description}</p><p className="mt-6 text-2xl font-bold">{money(product.price)}</p><div className="mt-6"><AddToCartButton productId={product.id} /></div></div></div>;
}

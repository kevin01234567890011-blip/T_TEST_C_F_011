"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Product } from "@/types/database";

const schema = z.object({ name: z.string().trim().min(1).max(200), description: z.string().trim().min(1).max(2000), price: z.coerce.number().finite().positive(), imageUrl: z.string().url().max(2000) });
type Values = z.infer<typeof schema>;

export function AdminProductForm({ product, onDone }: { product?: Product; onDone: () => void }) {
  const [message, setMessage] = useState("");
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: product?.name ?? "", description: product?.description ?? "", price: product ? Number(product.price) : undefined, imageUrl: product?.image_url ?? "" } });
  async function submit(values: Values) {
    setMessage("");
    const response = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", { method: product ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Unable to save product.");
    onDone();
  }
  return <form onSubmit={form.handleSubmit(submit)} className="space-y-3 rounded-xl border p-4"><h3 className="font-semibold">{product ? "Edit product" : "Add product"}</h3><label>Name<input {...form.register("name")} className="mt-1 w-full rounded-lg border p-2.5" />{form.formState.errors.name && <span className="text-xs text-red-600">{form.formState.errors.name.message}</span>}</label><label>Description<textarea {...form.register("description")} className="mt-1 min-h-24 w-full rounded-lg border p-2.5" />{form.formState.errors.description && <span className="text-xs text-red-600">{form.formState.errors.description.message}</span>}</label><label>Price<input {...form.register("price")} type="number" step="0.01" className="mt-1 w-full rounded-lg border p-2.5" />{form.formState.errors.price && <span className="text-xs text-red-600">{form.formState.errors.price.message}</span>}</label><label>Image URL<input {...form.register("imageUrl")} type="url" className="mt-1 w-full rounded-lg border p-2.5" />{form.formState.errors.imageUrl && <span className="text-xs text-red-600">{form.formState.errors.imageUrl.message}</span>}</label>{message && <p className="text-sm text-red-600">{message}</p>}<div className="flex gap-2"><button disabled={form.formState.isSubmitting} className="rounded-lg bg-gray-900 px-4 py-2 text-white">Save</button>{product && <button type="button" onClick={onDone} className="rounded-lg border px-4 py-2">Cancel</button>}</div></form>;
}

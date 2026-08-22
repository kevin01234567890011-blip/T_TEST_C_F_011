"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({ phone: z.string().trim().min(1).max(30), address: z.string().trim().min(1).max(500) });
type Values = z.infer<typeof schema>;

export function CheckoutForm({ defaultPhone, defaultAddress }: { defaultPhone: string; defaultAddress: string }) {
  const [message, setMessage] = useState("");
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { phone: defaultPhone, address: defaultAddress } });
  async function submit(values: Values) {
    setMessage("");
    const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Unable to place order.");
    document.cookie = "shop_cart=[]; Path=/; Max-Age=0; SameSite=Lax";
    window.dispatchEvent(new Event("cart:changed"));
    window.location.href = `/orders?created=${encodeURIComponent(data.orderId)}`;
  }
  return <form onSubmit={form.handleSubmit(submit)} className="space-y-4"><label>Phone<input {...form.register("phone")} className="mt-1 w-full rounded-lg border p-3" />{form.formState.errors.phone && <span className="text-sm text-red-600">{form.formState.errors.phone.message}</span>}</label><label>Delivery address<textarea {...form.register("address")} className="mt-1 min-h-32 w-full rounded-lg border p-3" />{form.formState.errors.address && <span className="text-sm text-red-600">{form.formState.errors.address.message}</span>}</label><div className="rounded-xl border bg-gray-50 p-4"><p className="font-medium">Payment method</p><p className="mt-1 text-sm text-gray-600">Cash on Delivery</p></div>{message && <p className="text-sm text-red-600">{message}</p>}<button disabled={form.formState.isSubmitting} className="w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white">{form.formState.isSubmitting ? "Placing order…" : "Place order"}</button></form>;
}

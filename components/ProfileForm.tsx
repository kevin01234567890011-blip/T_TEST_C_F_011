"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Profile } from "@/types/database";

const schema = z.object({ first_name: z.string().trim().min(1).max(100), last_name: z.string().trim().min(1).max(100), phone: z.string().trim().min(1).max(30), address: z.string().trim().min(1).max(500) });
type FormValues = z.infer<typeof schema>;

export function ProfileForm({ profile }: { profile: Profile }) {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: profile });
  const onSubmit = async (values: FormValues) => { setMessage(""); const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); const data = await response.json(); setMessage(response.ok ? "Profile updated." : data.error ?? "Unable to update profile."); };
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2"><label>First name<input {...register("first_name")} className="mt-1 w-full rounded-lg border p-3" />{errors.first_name && <span className="text-sm text-red-600">{errors.first_name.message}</span>}</label><label>Last name<input {...register("last_name")} className="mt-1 w-full rounded-lg border p-3" />{errors.last_name && <span className="text-sm text-red-600">{errors.last_name.message}</span>}</label></div>
    <label>Email<input value={profile.email} disabled className="mt-1 w-full rounded-lg border bg-gray-50 p-3 text-gray-500" /></label>
    <label>Phone<input {...register("phone")} className="mt-1 w-full rounded-lg border p-3" />{errors.phone && <span className="text-sm text-red-600">{errors.phone.message}</span>}</label>
    <label>Address<textarea {...register("address")} className="mt-1 min-h-28 w-full rounded-lg border p-3" />{errors.address && <span className="text-sm text-red-600">{errors.address.message}</span>}</label>
    {message && <p className="text-sm">{message}</p>}<button disabled={isSubmitting} className="rounded-xl bg-gray-900 px-5 py-3 font-medium text-white disabled:opacity-50">{isSubmitting ? "Saving…" : "Save changes"}</button>
  </form>;
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6).max(200) });
const registerSchema = loginSchema.extend({ first_name: z.string().trim().min(1).max(100), last_name: z.string().trim().min(1).max(100), phone: z.string().trim().min(1).max(30), address: z.string().trim().min(1).max(500) });
type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const login = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const registration = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onLogin(values: LoginValues) {
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) return setMessage(error.message);
    window.location.href = "/";
  }

  async function onRegister(values: RegisterValues) {
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({ email: values.email, password: values.password });
    if (error || !data.user) return setMessage(error?.message ?? "Registration failed.");
    if (!data.session) return setMessage("Registration succeeded, but your Supabase project requires email confirmation before the customer profile can be created.");
    const { error: profileError } = await supabase.from("profiles").insert({ id: data.user.id, first_name: values.first_name, last_name: values.last_name, email: values.email, phone: values.phone, address: values.address, role: "CUSTOMER" });
    if (profileError) return setMessage(profileError.message);
    window.location.href = "/";
  }

  return <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
    <div className="mb-6 flex rounded-xl bg-gray-100 p-1"><button onClick={() => { setMode("login"); setMessage(""); }} className={`flex-1 rounded-lg px-3 py-2 text-sm ${mode === "login" ? "bg-white shadow" : "text-gray-500"}`}>Login</button><button onClick={() => { setMode("register"); setMessage(""); }} className={`flex-1 rounded-lg px-3 py-2 text-sm ${mode === "register" ? "bg-white shadow" : "text-gray-500"}`}>Register</button></div>
    {mode === "login" ? <form onSubmit={login.handleSubmit(onLogin)} className="space-y-4"><label>Email<input {...login.register("email")} type="email" className="mt-1 w-full rounded-lg border p-3" />{login.formState.errors.email && <span className="text-sm text-red-600">{login.formState.errors.email.message}</span>}</label><label>Password<input {...login.register("password")} type="password" className="mt-1 w-full rounded-lg border p-3" />{login.formState.errors.password && <span className="text-sm text-red-600">{login.formState.errors.password.message}</span>}</label><button disabled={login.formState.isSubmitting} className="w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white">{login.formState.isSubmitting ? "Signing in…" : "Sign in"}</button></form> : <form onSubmit={registration.handleSubmit(onRegister)} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><label>First name<input {...registration.register("first_name")} className="mt-1 w-full rounded-lg border p-3" />{registration.formState.errors.first_name && <span className="text-sm text-red-600">{registration.formState.errors.first_name.message}</span>}</label><label>Last name<input {...registration.register("last_name")} className="mt-1 w-full rounded-lg border p-3" />{registration.formState.errors.last_name && <span className="text-sm text-red-600">{registration.formState.errors.last_name.message}</span>}</label></div><label>Email<input {...registration.register("email")} type="email" className="mt-1 w-full rounded-lg border p-3" />{registration.formState.errors.email && <span className="text-sm text-red-600">{registration.formState.errors.email.message}</span>}</label><label>Password<input {...registration.register("password")} type="password" className="mt-1 w-full rounded-lg border p-3" />{registration.formState.errors.password && <span className="text-sm text-red-600">{registration.formState.errors.password.message}</span>}</label><label>Phone<input {...registration.register("phone")} className="mt-1 w-full rounded-lg border p-3" />{registration.formState.errors.phone && <span className="text-sm text-red-600">{registration.formState.errors.phone.message}</span>}</label><label>Address<textarea {...registration.register("address")} className="mt-1 min-h-24 w-full rounded-lg border p-3" />{registration.formState.errors.address && <span className="text-sm text-red-600">{registration.formState.errors.address.message}</span>}</label><button disabled={registration.formState.isSubmitting} className="w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white">{registration.formState.isSubmitting ? "Creating account…" : "Create customer account"}</button></form>}
    {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
  </div>;
}

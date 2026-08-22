"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { CartDrawer } from "@/components/CartDrawer";
import type { Profile } from "@/types/database";

export function Header({ initialProfile }: { initialProfile: Profile | null }) {
  const [profile, setProfile] = useState(initialProfile);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) { setProfile(null); return; }
      const { data: nextProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      setProfile(nextProfile as Profile | null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const read = () => {
      try {
        const raw = document.cookie.split(";").find((part) => part.trim().startsWith("shop_cart="))?.split("=").slice(1).join("=");
        const items = raw ? JSON.parse(decodeURIComponent(raw)) as Array<{ quantity: number }> : [];
        setCartCount(Array.isArray(items) ? items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) : 0);
      } catch { setCartCount(0); }
    };
    read();
    window.addEventListener("cart:changed", read);
    return () => window.removeEventListener("cart:changed", read);
  }, []);

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return <>
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">SimpleStore</Link>
        <nav className="flex items-center gap-3 text-sm">
          {profile ? <>
            <Link href={`/user/${profile.id}`} className="rounded-lg px-3 py-2 hover:bg-gray-100">Profile</Link>
            <Link href="/orders" className="rounded-lg px-3 py-2 hover:bg-gray-100">Orders</Link>
            {profile.role === "ADMIN" && <Link href="/admin" className="rounded-lg px-3 py-2 hover:bg-gray-100">Admin</Link>}
            <button onClick={logout} className="rounded-lg border border-gray-300 px-3 py-2">Logout</button>
          </> : <Link href="/login" className="rounded-lg border border-gray-300 px-3 py-2">Login</Link>}
          <button onClick={() => setCartOpen(true)} className="rounded-lg bg-gray-900 px-3 py-2 text-white">Cart ({cartCount})</button>
        </nav>
      </div>
    </header>
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
  </>;
}

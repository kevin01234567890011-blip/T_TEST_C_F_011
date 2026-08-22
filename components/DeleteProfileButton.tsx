"use client";

import { useState } from "react";

export function DeleteProfileButton() {
  const [message, setMessage] = useState("");
  async function remove() {
    if (!window.confirm("Delete your application profile permanently?")) return;
    const response = await fetch("/api/profile", { method: "DELETE" });
    const data = await response.json();
    if (response.ok) window.location.href = "/login"; else setMessage(data.error ?? "Unable to delete profile.");
  }
  return <div><button onClick={remove} className="rounded-xl border border-red-300 px-5 py-3 font-medium text-red-600">Delete application profile</button>{message && <p className="mt-2 text-sm text-red-600">{message}</p>}</div>;
}

import { notFound, redirect } from "next/navigation";
import { DeleteProfileButton } from "@/components/DeleteProfileButton";
import { ProfileForm } from "@/components/ProfileForm";
import { requireUser } from "@/lib/auth";

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, profile } = await requireUser();
  const { id } = await params;
  if (id !== user.id) notFound();
  return <div className="mx-auto max-w-2xl space-y-8"><section><p className="text-sm text-gray-500">Your account</p><h1 className="mt-1 text-3xl font-bold">Profile</h1></section><div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"><ProfileForm profile={profile} /></div><div className="rounded-2xl border border-red-200 bg-white p-6"><h2 className="font-semibold">Delete application profile</h2><p className="mt-1 mb-4 text-sm text-gray-600">This deletes your application profile using the existing RLS-authorized profile operation. Your Supabase Auth account is not modified.</p><DeleteProfileButton /></div></div>;
}

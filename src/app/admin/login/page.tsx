import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="grid flex-1 place-items-center bg-jungle-950 px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo light />
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <h1 className="font-display text-2xl font-semibold text-jungle-950">Admin sign in</h1>
          <p className="mt-1 mb-6 text-sm text-ink/60">Manage tours, destinations and site content.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

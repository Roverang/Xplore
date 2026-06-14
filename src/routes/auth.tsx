import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";

import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { signIn, signUp } from "@/lib/api/platform.functions";
import { storeSession } from "@/lib/app-session";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in - Xplore" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const result =
        mode === "signin"
          ? await signIn({
              data: {
                email: String(form.get("email") || ""),
                password: String(form.get("password") || ""),
              },
            })
          : await signUp({
              data: {
                name: String(form.get("name") || ""),
                email: String(form.get("email") || ""),
                password: String(form.get("password") || ""),
                interests: String(form.get("interests") || "")
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean),
                skills: String(form.get("skills") || "")
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean),
              },
            });
      storeSession(result);
      if (mode === "signup") {
        localStorage.setItem("xplore_onboarding_pending", "true");
      }
      await navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="px-6 lg:px-10 py-10 max-w-3xl mx-auto">
          <section className="surface-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
                {mode === "signin" ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              </span>
              <div>
                <h1 className="font-display text-2xl font-extrabold">
                  {mode === "signin" ? "Sign in to Xplore" : "Create your Xplore account"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Demo accounts: ansh@nitj.ac.in / student123, admin@nitj.ac.in / admin123
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 rounded-full bg-secondary p-1">
              <button
                onClick={() => setMode("signin")}
                className={`rounded-full py-2 text-sm font-semibold ${mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`rounded-full py-2 text-sm font-semibold ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <input name="name" required placeholder="Full name" className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm" />
              )}
              <input name="email" required type="email" placeholder="Campus email" className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm" />
              <input name="password" required type="password" placeholder="Password" className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm" />
              {mode === "signup" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <input name="interests" placeholder="Interests, comma separated" className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm" />
                  <input name="skills" placeholder="Skills, comma separated" className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm" />
                </div>
              )}
              {error && <p className="rounded-xl bg-destructive/10 text-destructive p-3 text-sm">{error}</p>}
              <button disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                {loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

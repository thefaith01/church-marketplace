"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "MEMBER",
    churchReferenceName: "",
    churchReferenceCity: "",
    churchReferencePerson: "",
    churchReferenceLetter: null as File | null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null) body.append(k, v as any);
    });
    const res = await fetch("/api/auth/signup", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  const inp =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const btn =
    "w-full rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50";

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold text-blue-700">Create your account</h1>
      <p className="mt-1 text-sm text-gray-400">Step {step} of 2</p>

      <form
        onSubmit={
          step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit
        }
        className="mt-6 space-y-4"
      >
        {step === 1 && (
          <>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Full name
              </span>
              <input
                required
                className={`mt-1 ${inp}`}
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Email address
              </span>
              <input
                required
                type="email"
                className={`mt-1 ${inp}`}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Password
              </span>
              <input
                required
                type="password"
                minLength={8}
                className={`mt-1 ${inp}`}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </label>
            <div>
              <span className="text-sm font-medium text-gray-700">
                I am joining as a...
              </span>
              <div className="mt-2 flex gap-4">
                {(["MEMBER", "PROVIDER"] as const).map((r) => (
                  <label
                    key={r}
                    className={`flex-1 cursor-pointer rounded-lg border-2 p-4 text-center text-sm font-medium transition
                      ${
                        form.role === r
                          ? "border-blue-700 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-500"
                      }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value={r}
                      checked={form.role === r}
                      onChange={() => set("role", r)}
                    />
                    {r === "MEMBER" ? "👤 Member" : "🔧 Provider"}
                    <p className="mt-1 text-xs font-normal text-gray-400">
                      {r === "MEMBER"
                        ? "I want to hire providers"
                        : "I want to offer services"}
                    </p>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className={btn}>
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              We need your church details so an admin can verify you. You can
              update these later from your dashboard.
            </div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Church name
              </span>
              <input
                className={`mt-1 ${inp}`}
                value={form.churchReferenceName}
                onChange={(e) => set("churchReferenceName", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Church city
              </span>
              <input
                className={`mt-1 ${inp}`}
                value={form.churchReferenceCity}
                onChange={(e) => set("churchReferenceCity", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Reference person (pastor or elder)
              </span>
              <input
                className={`mt-1 ${inp}`}
                value={form.churchReferencePerson}
                onChange={(e) =>
                  set("churchReferencePerson", e.target.value)
                }
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Reference letter (optional, PDF or image)
              </span>
              <input
                type="file"
                accept=".pdf,image/*"
                className="mt-1 text-sm"
                onChange={(e) =>
                  set("churchReferenceLetter", e.target.files?.[0] ?? null)
                }
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
              >
                ← Back
              </button>
              <button type="submit" disabled={loading} className={`flex-1 ${btn}`}>
                {loading ? "Creating account…" : "Create account"}
              </button>
            </div>
          </>
        )}
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Already a member?{" "}
        <a href="/login" className="text-blue-700 underline">
          Log in
        </a>
      </p>
    </div>
  );
}

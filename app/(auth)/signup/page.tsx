"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ui, Arch } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "MEMBER",
    churchId: "",
    inviteCode: "",
    churchReferenceName: "",
    churchReferenceCity: "",
    churchReferencePerson: "",
    churchReferenceLetter: null as File | null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [churches, setChurches] = useState<{ id: string; name: string; city: string | null }[]>([]);

  useEffect(() => {
    fetch("/api/churches")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setChurches(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const church = params.get("church");
    const code = params.get("code");
    setForm((f) => ({
      ...f,
      ...(church ? { churchId: church } : {}),
      ...(code ? { inviteCode: code } : {}),
    }));
  }, []);

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
    router.refresh();
  }

  const joiningChurch = churches.find((c) => c.id === form.churchId);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-[24px] border border-line bg-paper p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Arch />
          <span className="font-display text-xl font-extrabold text-ink">cmm</span>
        </div>
        <h1 className="mt-5 font-display text-[28px] font-bold tracking-[-0.02em] text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Step {step} of 2</p>

        <form
          onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}
          className="mt-6 space-y-4"
        >
          {step === 1 && (
            <>
              <label className="block">
                <span className={ui.label}>Full name</span>
                <input required className={ui.input} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
              </label>
              <label className="block">
                <span className={ui.label}>Email address</span>
                <input required type="email" className={ui.input} value={form.email} onChange={(e) => set("email", e.target.value)} />
              </label>
              <label className="block">
                <span className={ui.label}>Password</span>
                <input required type="password" minLength={8} className={ui.input} value={form.password} onChange={(e) => set("password", e.target.value)} />
              </label>
              <div>
                <span className={ui.label}>I am joining as a…</span>
                <div className="mt-2 flex gap-3">
                  {(["MEMBER", "PROVIDER"] as const).map((r) => (
                    <label
                      key={r}
                      className={`flex-1 cursor-pointer rounded-2xl border-2 p-4 text-center text-sm font-semibold transition
                        ${form.role === r ? "border-clay bg-chip text-clay-dark" : "border-line text-muted"}`}
                    >
                      <input type="radio" className="sr-only" value={r} checked={form.role === r} onChange={() => set("role", r)} />
                      {r === "MEMBER" ? "👤 Member" : "🔧 Provider"}
                      <p className="mt-1 text-xs font-normal text-faint">
                        {r === "MEMBER" ? "I want to hire providers" : "I want to offer services"}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className={`w-full ${ui.btnPrimary}`}>Continue →</button>
            </>
          )}

          {step === 2 && (
            <>
              {joiningChurch && (
                <div className="rounded-xl bg-[#E9F0E9] p-3 text-sm text-[#2E5740]">
                  You&rsquo;re joining <strong>{joiningChurch.name}</strong>. A church leader will
                  confirm your membership.
                </div>
              )}
              <div className="rounded-xl bg-[#F4E7CE] p-3 text-sm text-[#8A6420]">
                We need your church details so an admin can verify you. You can update these later from your dashboard.
              </div>
              {churches.length > 0 && (
                <label className="block">
                  <span className={ui.label}>Select your church (if listed)</span>
                  <select className={ui.input} value={form.churchId} onChange={(e) => set("churchId", e.target.value)}>
                    <option value="">Not listed / enter manually</option>
                    {churches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.city ? ` — ${c.city}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="block">
                <span className={ui.label}>Church name</span>
                <input className={ui.input} value={form.churchReferenceName} onChange={(e) => set("churchReferenceName", e.target.value)} />
              </label>
              <label className="block">
                <span className={ui.label}>Church city</span>
                <input className={ui.input} value={form.churchReferenceCity} onChange={(e) => set("churchReferenceCity", e.target.value)} />
              </label>
              <label className="block">
                <span className={ui.label}>Reference person (pastor or elder)</span>
                <input className={ui.input} value={form.churchReferencePerson} onChange={(e) => set("churchReferencePerson", e.target.value)} />
              </label>
              <label className="block">
                <span className={ui.label}>Reference letter (optional, PDF or image)</span>
                <input type="file" accept=".pdf,image/*" className="mt-1 block text-sm text-muted" onChange={(e) => set("churchReferenceLetter", e.target.files?.[0] ?? null)} />
              </label>
              {error && <p className="text-sm text-clay-dark">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className={`flex-1 ${ui.btnGhost}`}>← Back</button>
                <button type="submit" disabled={loading} className={`flex-1 ${ui.btnPrimary}`}>
                  {loading ? "Creating…" : "Create account"}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already a member?{" "}
          <a href="/login" className={ui.link}>Log in</a>
        </p>
      </div>
    </div>
  );
}

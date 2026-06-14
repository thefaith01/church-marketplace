"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/components/ui";

export function RequestForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    serviceArea: "",
    budget: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string | null }[]>([]);
  const [customCat, setCustomCat] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCategories(d))
      .catch(() => {});
  }, []);

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/service-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(d.error || "Something went wrong");
      setLoading(false);
      return;
    }
    router.push(`/requests/${d.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className={ui.label}>What do you need?</span>
        <input required className={ui.input} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Childminder for two mornings a week" />
      </label>
      <label className="block">
        <span className={ui.label}>Category</span>
        {categories.length > 0 ? (
          <>
            <select
              className={ui.input}
              value={customCat ? "__other__" : form.category}
              onChange={(e) => {
                if (e.target.value === "__other__") {
                  setCustomCat(true);
                  update("category", "");
                } else {
                  setCustomCat(false);
                  update("category", e.target.value);
                }
              }}
            >
              <option value="">Select a category (optional)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon ? `${c.icon} ` : ""}
                  {c.name}
                </option>
              ))}
              <option value="__other__">Other (please specify)</option>
            </select>
            {customCat && (
              <input
                className={`${ui.input} mt-2`}
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="Please specify"
              />
            )}
          </>
        ) : (
          <input className={ui.input} value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="e.g. Family & Care" />
        )}
      </label>
      <label className="block">
        <span className={ui.label}>Details</span>
        <textarea required rows={5} className={ui.input} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe what you're looking for, timing, and anything providers should know." />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={ui.label}>Area (optional)</span>
          <input className={ui.input} value={form.serviceArea} onChange={(e) => update("serviceArea", e.target.value)} placeholder="e.g. Croydon" />
        </label>
        <label className="block">
          <span className={ui.label}>Budget (optional)</span>
          <input className={ui.input} value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="e.g. £15/hr" />
        </label>
      </div>
      {error && <p className="text-sm text-clay-dark">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className={ui.btnPrimary}>
          {loading ? "Posting…" : "Post request"}
        </button>
        <a href="/requests" className={ui.btnGhost}>Cancel</a>
      </div>
    </form>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/components/ui";
import { ImageUpload } from "@/components/ImageUpload";

export default function CreateListingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    pricingType: "QUOTE",
    indicativePrice: "",
    serviceArea: "",
    availabilityNotes: "",
    isFreeHelp: false,
    imageUrl: "",
  });

  const [categories, setCategories] = useState<{ id: string; name: string; icon: string | null }[]>([]);
  const [customCat, setCustomCat] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCategories(d))
      .catch(() => {});
  }, []);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }
    router.push("/my-listings");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-[32px] font-bold tracking-[-0.02em] text-ink">Create a listing</h1>
      <p className="mt-1 text-sm text-muted">Describe the service you offer to church members.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className={ui.label}>Title</span>
          <input required className={ui.input} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Reliable home plumbing" />
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
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon ? `${c.icon} ` : ""}
                    {c.name}
                  </option>
                ))}
                <option value="__other__">Other…</option>
              </select>
              {customCat && (
                <input
                  className={`${ui.input} mt-2`}
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  placeholder="New category"
                />
              )}
            </>
          ) : (
            <input required className={ui.input} value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="e.g. Plumbing" />
          )}
        </label>
        <label className="block">
          <span className={ui.label}>Description</span>
          <textarea required rows={5} className={ui.input} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe what you offer, your experience, and what's included." />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={ui.label}>Pricing type</span>
            <select className={ui.input} value={form.pricingType} onChange={(e) => update("pricingType", e.target.value)}>
              <option value="QUOTE">Quote</option>
              <option value="HOURLY">Hourly</option>
              <option value="FIXED">Fixed</option>
            </select>
          </label>
          <label className="block">
            <span className={ui.label}>Indicative price</span>
            <input className={ui.input} value={form.indicativePrice} onChange={(e) => update("indicativePrice", e.target.value)} placeholder="e.g. £50/hr or From £200" />
          </label>
        </div>
        <label className="block">
          <span className={ui.label}>Service area</span>
          <input className={ui.input} value={form.serviceArea} onChange={(e) => update("serviceArea", e.target.value)} placeholder="e.g. North Croydon" />
        </label>
        <label className="block">
          <span className={ui.label}>Availability notes</span>
          <input className={ui.input} value={form.availabilityNotes} onChange={(e) => update("availabilityNotes", e.target.value)} placeholder="e.g. Weekends and evenings" />
        </label>

        <div>
          <span className={ui.label}>Photo (optional)</span>
          <div className="mt-1">
            <ImageUpload value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
          </div>
        </div>

        <label className="flex items-center gap-2.5 rounded-xl border border-line bg-paper p-3">
          <input
            type="checkbox"
            checked={form.isFreeHelp}
            onChange={(e) => setForm((f) => ({ ...f, isFreeHelp: e.target.checked }))}
          />
          <span className="text-sm text-muted">
            This is free community help (acts of service), not a paid service
          </span>
        </label>

        {error && <p className="text-sm text-clay-dark">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className={ui.btnPrimary}>
            {loading ? "Creating…" : "Create listing"}
          </button>
          <a href="/my-listings" className={ui.btnGhost}>Cancel</a>
        </div>
      </form>
    </div>
  );
}

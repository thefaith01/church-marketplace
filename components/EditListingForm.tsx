"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/components/ui";

type Listing = {
  id: string;
  title: string;
  category: string;
  description: string;
  pricingType: string;
  indicativePrice: string | null;
  serviceArea: string | null;
  availabilityNotes: string | null;
  status: string;
  isFreeHelp: boolean;
};

export function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: listing.title,
    category: listing.category,
    description: listing.description,
    pricingType: listing.pricingType,
    indicativePrice: listing.indicativePrice ?? "",
    serviceArea: listing.serviceArea ?? "",
    availabilityNotes: listing.availabilityNotes ?? "",
    status: listing.status,
    isFreeHelp: listing.isFreeHelp,
  });

  const [categories, setCategories] = useState<{ id: string; name: string; icon: string | null }[]>([]);
  const [customCat, setCustomCat] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setCategories(d);
          if (listing.category && !d.some((c: any) => c.name === listing.category)) {
            setCustomCat(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    router.push("/my-listings");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className={ui.label}>Title</span>
        <input required className={ui.input} value={form.title} onChange={(e) => update("title", e.target.value)} />
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
                placeholder="Category"
              />
            )}
          </>
        ) : (
          <input required className={ui.input} value={form.category} onChange={(e) => update("category", e.target.value)} />
        )}
      </label>
      <label className="block">
        <span className={ui.label}>Description</span>
        <textarea required rows={5} className={ui.input} value={form.description} onChange={(e) => update("description", e.target.value)} />
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
          <span className={ui.label}>Status</span>
          <select className={ui.input} value={form.status} onChange={(e) => update("status", e.target.value)}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className={ui.label}>Indicative price</span>
        <input className={ui.input} value={form.indicativePrice} onChange={(e) => update("indicativePrice", e.target.value)} />
      </label>
      <label className="block">
        <span className={ui.label}>Service area</span>
        <input className={ui.input} value={form.serviceArea} onChange={(e) => update("serviceArea", e.target.value)} />
      </label>
      <label className="block">
        <span className={ui.label}>Availability notes</span>
        <input className={ui.input} value={form.availabilityNotes} onChange={(e) => update("availabilityNotes", e.target.value)} />
      </label>

      <label className="flex items-center gap-2.5 rounded-xl border border-line bg-paper p-3">
        <input
          type="checkbox"
          checked={form.isFreeHelp}
          onChange={(e) => setForm((f) => ({ ...f, isFreeHelp: e.target.checked }))}
        />
        <span className="text-sm text-muted">Free community help (acts of service), not a paid service</span>
      </label>

      {error && <p className="text-sm text-clay-dark">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className={ui.btnPrimary}>
          {loading ? "Saving…" : "Save changes"}
        </button>
        <a href="/my-listings" className={ui.btnGhost}>Cancel</a>
      </div>
    </form>
  );
}

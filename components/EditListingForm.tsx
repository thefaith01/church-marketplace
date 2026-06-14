"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  });

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

  const inp =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Title</span>
        <input
          required
          className={inp}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Category</span>
        <input
          required
          className={inp}
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Description</span>
        <textarea
          required
          rows={5}
          className={inp}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Pricing type</span>
          <select
            className={inp}
            value={form.pricingType}
            onChange={(e) => update("pricingType", e.target.value)}
          >
            <option value="QUOTE">Quote</option>
            <option value="HOURLY">Hourly</option>
            <option value="FIXED">Fixed</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <select
            className={inp}
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          Indicative price
        </span>
        <input
          className={inp}
          value={form.indicativePrice}
          onChange={(e) => update("indicativePrice", e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Service area</span>
        <input
          className={inp}
          value={form.serviceArea}
          onChange={(e) => update("serviceArea", e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          Availability notes
        </span>
        <input
          className={inp}
          value={form.availabilityNotes}
          onChange={(e) => update("availabilityNotes", e.target.value)}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-800"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
        <a
          href="/my-listings"
          className="rounded-md border px-5 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

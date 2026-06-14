"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  });

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

  const inp =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Create a Listing</h1>
      <p className="text-gray-500 text-sm mt-1">
        Describe the service you offer to church members.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Title</span>
          <input
            required
            className={inp}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Reliable home plumbing"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Category</span>
          <input
            required
            className={inp}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="e.g. Plumbing"
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
            placeholder="Describe what you offer, your experience, and what's included."
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
            <span className="text-sm font-medium text-gray-700">
              Indicative price
            </span>
            <input
              className={inp}
              value={form.indicativePrice}
              onChange={(e) => update("indicativePrice", e.target.value)}
              placeholder="e.g. $50/hr or From $200"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Service area</span>
          <input
            className={inp}
            value={form.serviceArea}
            onChange={(e) => update("serviceArea", e.target.value)}
            placeholder="e.g. North Dallas"
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
            placeholder="e.g. Weekends and evenings"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-800"
          >
            {loading ? "Creating…" : "Create listing"}
          </button>
          <a
            href="/my-listings"
            className="rounded-md border px-5 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}

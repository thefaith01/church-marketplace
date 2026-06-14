import Link from "next/link";

export function ListingCard({ listing }: { listing: any }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
      <span className="inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700">
        {listing.category}
      </span>
      <h3 className="mt-2 font-semibold text-gray-900">{listing.title}</h3>
      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
        {listing.description}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{listing.serviceArea}</span>
        <span>{listing.pricingType}</span>
      </div>
      {listing.indicativePrice && (
        <p className="mt-1 text-sm font-medium text-gray-700">
          {listing.indicativePrice}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {listing.provider?.profile?.fullName}
        </span>
        <Link
          href={`/listings/${listing.id}`}
          className="rounded-md bg-blue-700 px-3 py-1 text-xs font-medium text-white hover:bg-blue-800"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

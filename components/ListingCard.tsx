import Link from "next/link";
import { Badge } from "@/components/ui";

export function ListingCard({ listing }: { listing: any }) {
  return (
    <div className="rounded-[18px] border border-line bg-paper p-5 shadow-sm transition hover:shadow-md">
      <Badge>{listing.category}</Badge>
      <h3 className="mt-2 font-display text-[17px] font-bold text-ink">{listing.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{listing.description}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-faint">
        <span>{listing.serviceArea}</span>
        <span>{listing.pricingType}</span>
      </div>
      {listing.indicativePrice && (
        <p className="mt-1 font-display text-sm font-bold text-ink">{listing.indicativePrice}</p>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-[#EFE7D6] pt-3">
        <span className="text-sm text-[#5A4F40]">{listing.provider?.profile?.fullName}</span>
        <Link
          href={`/listings/${listing.id}`}
          className="rounded-full bg-clay px-3.5 py-1.5 text-xs font-semibold text-paper no-underline hover:bg-clay-dark"
        >
          View details
        </Link>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Container, PageHeader, Card } from "@/components/ui";
import TestimonialForm from "@/components/TestimonialForm";

export default async function TestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: { listing: true, provider: { include: { profile: true } }, testimonial: true },
  });
  if (!booking || booking.requesterId !== user.id) redirect("/manage");
  if (booking.status !== "COMPLETED") redirect("/manage");

  const providerName = booking.provider.profile?.fullName || "your provider";

  return (
    <Container size="narrow">
      <PageHeader
        eyebrow="Booking complete"
        title="Leave a testimonial"
        subtitle={`Optional: share how "${booking.listing.title}" went.`}
      />
      <Card>
        {booking.testimonial ? (
          <div>
            <p className="font-display font-bold text-ink">Thank you</p>
            <p className="mt-1 text-sm text-muted">
              You&rsquo;ve already left a testimonial for this booking. It appears once a moderator
              approves it.
            </p>
            <a href="/manage" className="mt-3 inline-block font-semibold text-clay no-underline">
              Back to bookings →
            </a>
          </div>
        ) : (
          <TestimonialForm bookingId={booking.id} providerName={providerName} />
        )}
      </Card>
    </Container>
  );
}

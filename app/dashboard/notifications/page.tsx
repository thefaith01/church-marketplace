import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Container, PageHeader, Card } from "@/components/ui";
import PushToggle from "@/components/PushToggle";
import NotificationPreferencesForm from "@/components/NotificationPreferencesForm";

export default async function NotificationSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const p = await prisma.notificationPreference.findUnique({ where: { userId: user.id } });

  const initial = {
    messagesEmail: p?.messagesEmail ?? true,
    messagesPush: p?.messagesPush ?? true,
    bookingsEmail: p?.bookingsEmail ?? true,
    bookingsPush: p?.bookingsPush ?? true,
    verificationEmail: p?.verificationEmail ?? true,
    verificationPush: p?.verificationPush ?? true,
    requestsEmail: p?.requestsEmail ?? true,
    requestsPush: p?.requestsPush ?? true,
  };

  return (
    <Container size="narrow">
      <PageHeader title="Notification settings" subtitle="Choose how we reach you." />

      <Card>
        <p className="font-display font-bold text-ink">Browser push</p>
        <p className="mt-1 text-sm text-muted">
          Turn on push to get alerts on this device even when the site is closed. You can enable it on
          each device you use.
        </p>
        <div className="mt-4">
          <PushToggle />
        </div>
      </Card>

      <div className="mt-5">
        <Card>
          <p className="font-display font-bold text-ink">What to notify me about</p>
          <p className="mt-1 text-sm text-muted">Toggle email and push for each kind of update.</p>
          <div className="mt-4">
            <NotificationPreferencesForm initial={initial} />
          </div>
        </Card>
      </div>
    </Container>
  );
}

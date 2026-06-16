import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Container, PageHeader, EmptyState } from "@/components/ui";
import MarkAllRead from "@/components/MarkAllRead";

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <Container size="narrow">
      <MarkAllRead />
      <PageHeader title="Notifications" subtitle="Recent activity on your account." />

      <div className="space-y-2">
        {items.map((n) => {
          const inner = (
            <div
              className={`rounded-2xl border border-line bg-paper p-4 ${
                !n.readAt ? "border-l-4 border-l-clay" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-display font-bold text-ink">{n.title}</p>
                <span className="shrink-0 text-xs text-faint">{timeAgo(n.createdAt)}</span>
              </div>
              {n.body && <p className="mt-1 text-sm text-muted">{n.body}</p>}
            </div>
          );
          return n.linkUrl ? (
            <a key={n.id} href={n.linkUrl} className="block no-underline">
              {inner}
            </a>
          ) : (
            <div key={n.id}>{inner}</div>
          );
        })}
      </div>

      {items.length === 0 && (
        <EmptyState icon="🔔" title="No notifications yet" hint="Activity on your account will show up here." />
      )}

      <div className="mt-6 text-sm">
        <a href="/dashboard/notifications" className="font-semibold text-clay no-underline">
          Notification settings →
        </a>
      </div>
    </Container>
  );
}

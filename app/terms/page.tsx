export const metadata = { title: "Terms of Use · Church Member Marketplace" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-[34px] font-bold tracking-[-0.02em] text-ink">Terms of Use</h1>
      <p className="mt-2 text-sm text-faint">Please read these terms before using the marketplace.</p>

      <div className="mt-8 space-y-6 text-[15px] leading-[1.65] text-muted">
        <section>
          <h2 className="font-display text-lg font-bold text-ink">Who can use the marketplace</h2>
          <p className="mt-1">
            Access to listings, messaging, and bookings is limited to members verified through a
            participating church. By using the marketplace you confirm you are a genuine member of a
            local church and will use it in keeping with Christian character and integrity.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink">Bookings and payments</h2>
          <p className="mt-1">
            The marketplace helps members and providers find one another and agree terms. Payment is
            arranged directly between you and the other party, off-platform. We are not a party to any
            agreement, do not process payments, and are not responsible for the quality, safety, or
            outcome of any service. Agree details clearly and only pay when you are comfortable.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink">Acceptable use</h2>
          <p className="mt-1">
            Do not post false, misleading, unlawful, or harmful content; do not harass other members;
            and do not misrepresent your church membership. Admins may remove listings, deactivate
            accounts, or revoke verification at their discretion.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink">Disputes</h2>
          <p className="mt-1">
            If something goes wrong, stop the conversation, avoid further payment, and contact your
            church leadership or a Platform Admin. Disputes are best resolved within the accountability
            of your church community.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink">Changes</h2>
          <p className="mt-1">
            We may update these terms as the marketplace grows. Continued use means you accept the
            current version.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm">
        <a href="/" className="font-semibold text-clay hover:underline">← Back to home</a>
      </p>
    </div>
  );
}

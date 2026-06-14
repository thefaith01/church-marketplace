export const metadata = { title: "Privacy · Church Member Marketplace" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-[34px] font-bold tracking-[-0.02em] text-ink">Privacy</h1>
      <p className="mt-2 text-sm text-faint">How we handle your information.</p>

      <div className="mt-8 space-y-6 text-[15px] leading-[1.65] text-muted">
        <section>
          <h2 className="font-display text-lg font-bold text-ink">What we collect</h2>
          <p className="mt-1">
            We collect only what's needed to run the marketplace: your name, email, chosen role, church
            details, and any bio or listings you create. Booking requests and messages are stored so you
            and the other party can keep track of conversations. If you upload a reference document, it
            is stored privately and only shown to admins for verification.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink">How we use it</h2>
          <p className="mt-1">
            Your information is used to verify your church connection, show your profile and listings to
            other verified members, and let people contact you. We do not sell your data or show it
            outside the private marketplace.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink">Who can see what</h2>
          <p className="mt-1">
            Verified members can see your name, church, bio, and listings. Church contact details you
            provide for verification are visible only to Platform Admins. Reference documents are never
            public; admins view them through short-lived secure links.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink">Email</h2>
          <p className="mt-1">
            We send transactional emails (verification, booking responses, new messages, and admin
            notices). These support the service rather than marketing.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink">Your choices</h2>
          <p className="mt-1">
            You can update your details from your dashboard at any time. To remove your account or data,
            contact a Platform Admin.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm">
        <a href="/" className="font-semibold text-clay hover:underline">← Back to home</a>
      </p>
    </div>
  );
}

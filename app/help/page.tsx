export const metadata = { title: "Help & FAQ · Church Member Marketplace" };

const faqs = [
  {
    q: "How do I get verified?",
    a: "Sign up, then add your church on your dashboard (Edit church / verification). Select your church if it's listed, or share reference details. An admin or a leader from your church confirms your membership, and the marketplace unlocks.",
  },
  {
    q: "Why can't I see listings yet?",
    a: "Browsing, messaging, and bookings unlock only after your church connection is confirmed. Until then you can update your details and wait for approval.",
  },
  {
    q: "How do bookings work?",
    a: "Open a listing, send a booking request with details and a preferred date, and the provider accepts or declines. You can message back and forth, and mark a job as done once it's complete.",
  },
  {
    q: "How do payments work?",
    a: "Payment is arranged directly between you and the provider, off-platform, in whatever way suits you both. The marketplace does not handle money.",
  },
  {
    q: "What is a service request?",
    a: "If you can't find what you need, post a request describing it. Providers in that category can respond with a message. You can close the request once it's handled.",
  },
  {
    q: "How do I offer my services?",
    a: "Sign up as a Provider (or switch later), then create a listing from My Listings. You can also offer free help as an act of service.",
  },
  {
    q: "Something looks wrong. How do I report it?",
    a: "Use the Report link on any listing or provider profile. Admins review reports and can deactivate accounts, listings, or churches.",
  },
  {
    q: "Who do I contact for help?",
    a: "Reach out to your church's point person or a Platform Admin. Many issues are best handled within your church community.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-[34px] font-bold tracking-[-0.02em] text-ink">Help &amp; FAQ</h1>
      <p className="mt-2 text-sm text-faint">Answers to the most common questions.</p>

      <div className="mt-8 space-y-6">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-[18px] border border-line bg-paper p-5">
            <h2 className="font-display text-base font-bold text-ink">{f.q}</h2>
            <p className="mt-1 text-[15px] leading-[1.6] text-muted">{f.a}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm">
        <a href="/about" className="font-semibold text-clay hover:underline">More about us →</a>
      </p>
    </div>
  );
}

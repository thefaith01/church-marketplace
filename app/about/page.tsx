import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "About Us · Church Member Marketplace",
  description:
    "A Christian marketplace grounded in local church community. Find and hire verified Christian providers, or offer your own services to fellow believers.",
};

const steps = [
  {
    icon: "📧",
    title: "Sign up with your email",
    body: "Create an account as a Member or Provider using your email and a secure password.",
  },
  {
    icon: "⛪",
    title: "Link to your church",
    body: "Select your church from our list or share basic reference details so an admin can confirm your connection.",
  },
  {
    icon: "🔎",
    title: "Browse, search, and connect",
    body: "Once verified, explore services, read clear descriptions, and message providers in a simple inbox.",
  },
  {
    icon: "📅",
    title: "Request and coordinate bookings",
    body: "Send booking requests, agree terms directly with each other, and coordinate in a way that suits you both.",
  },
];

const audiences = [
  {
    title: "For members",
    points: [
      "Browse services from trusted providers in your church and partner churches.",
      "Use simple search and filters to find the right person for home, family, or professional needs.",
      "Send private messages to discuss availability, details, and next steps.",
      "Create booking requests that keep job details clear for everyone.",
    ],
  },
  {
    title: "For providers",
    points: [
      "Create clear, text-based listings describing your services, pricing style, and availability.",
      "Receive messages and booking requests directly from verified church members.",
      "Manage which listings are Active or Inactive as your availability changes.",
      "Serve in a context where trust is grounded in shared faith and community.",
    ],
  },
  {
    title: "For platform admins",
    points: [
      "Link users to churches and confirm verification so access stays gated to real members.",
      "Maintain simple records of churches, users, and listings in clean, table-based views.",
      "Deactivate churches or listings that are no longer appropriate.",
      "Help your community steward trust, safety, and clarity as it grows.",
    ],
  },
];

const faqs = [
  {
    q: "How is my information used?",
    a: "We collect only what's needed to run the marketplace: your name, email, role, and church information. Booking requests and messages are stored so you and your provider can keep track of conversations. We never sell your data, and church contact details are only visible to admins for verification.",
  },
  {
    q: "Who counts as a church member?",
    a: "Membership here means formal membership of a local church, where individuals are accountable to its leadership through recognised pastoral oversight. If you help lead your church, you can work with an admin to decide how your congregation defines participation.",
  },
  {
    q: "How do you handle safety?",
    a: "There are no public ratings or reviews. Admins can deactivate users, churches, or listings that violate expectations, and local church leaders can follow up offline. If something feels off, stop the conversation, avoid payment, and contact your admin.",
  },
  {
    q: "Can our church join later?",
    a: "Yes. Members can sign up now and share church reference details. An admin can create and activate your church record once leadership is ready. Smaller congregations, multi-site churches, and networks can all take part.",
  },
];

export default async function AboutPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold">
            A Christian marketplace grounded in local church community
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Find and hire verified Christian providers from churches across the
            marketplace, or offer your own services to a community built on
            faith and accountability.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full bg-blue-500/40 px-4 py-1">
              Church-based verification
            </span>
            <span className="rounded-full bg-blue-500/40 px-4 py-1">
              Private, members-only access
            </span>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Supporting one another through our work
          </h2>
          <p className="mt-4 text-gray-600">
            Church Member Marketplace exists for Christians who want their
            spending to support fellow believers. Instead of paying anonymous
            providers, members can work with skilled tradespeople and
            professionals whose livelihoods support families, churches, and
            local communities.
          </p>
          <p className="mt-3 text-gray-600">
            Everyone here is a verified member of a Christian church, giving you
            a foundation of trust before the first conversation. Trust is built
            on church community, not algorithm ratings.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            How it works
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {steps.map((s, i) => (
              <div key={s.title} className="flex gap-4">
                <div className="text-3xl">{s.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {i + 1}. {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Built for members, providers, and admins
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {audiences.map((a) => (
              <div
                key={a.title}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-blue-700">{a.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {a.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Why verification matters
          </h2>
          <p className="mt-4 text-gray-600">
            We keep core marketplace features private so you always know you're
            connecting with verified Christian providers, not strangers from the
            open internet. Browsing listings, viewing provider details, and
            sending messages or booking requests all unlock only after an admin
            confirms your church connection.
          </p>
          <p className="mt-3 text-gray-600">
            Verification is simple and human. Platform admins review new
            signups, link them to churches, and set verification status. No
            algorithms, just clear records and accountable oversight. Most
            churches choose a point person who can confirm membership or regular
            attendance in a way that fits their context.
          </p>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Common questions
          </h2>
          <div className="mt-8 space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-gray-800">{f.q}</h3>
                <p className="mt-1 text-sm text-gray-600">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">
            A faith-based marketplace where every provider is church-verified
          </h2>
          <p className="mt-3 text-blue-100">
            Not just anyone from the internet. Accountable, and grounded in real
            church relationships.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {user ? (
              <>
                <Link
                  href="/listings"
                  className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Browse Services
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-md border-2 border-white px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Sign Up to Get Verified
                </Link>
                <Link
                  href="/login"
                  className="rounded-md border-2 border-white px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Log In Instead
                </Link>
              </>
            )}
          </div>
          <p className="mt-6 text-sm text-blue-200">
            Questions about privacy, verification, or eligibility? Reach out to
            your church's point person or a Platform Admin.
          </p>
        </div>
      </section>
    </div>
  );
}

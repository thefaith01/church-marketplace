import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-5xl font-bold">Church Member Marketplace</h1>
          <p className="mt-4 text-xl text-blue-100">
            Hire trusted Christian providers. Verified by your church community.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/signup"
              className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-blue-700 hover:bg-blue-50"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-md border-2 border-white px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">👤</div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your account and tell us about your church
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-2">Get Verified</h3>
              <p className="text-gray-600">
                Church admins verify your membership
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">
                Browse services and book trusted providers
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-gray-600 mb-8">
            Trust built on church community, not algorithm ratings
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 text-left">
              <h4 className="font-semibold mb-2">🛡 Church Verified</h4>
              <p className="text-gray-600">
                All members are verified by their church community
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-left">
              <h4 className="font-semibold mb-2">💬 Direct Messaging</h4>
              <p className="text-gray-600">
                Communicate directly with providers before booking
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-left">
              <h4 className="font-semibold mb-2">🙏 Community</h4>
              <p className="text-gray-600">
                Support Christian businesses and fellow believers
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-left">
              <h4 className="font-semibold mb-2">📋 Easy Booking</h4>
              <p className="text-gray-600">
                Simple request process and booking management
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <Link
            href="/signup"
            className="inline-block rounded-md bg-blue-700 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-800"
          >
            Join Now
          </Link>
        </div>
      </section>
    </div>
  );
}

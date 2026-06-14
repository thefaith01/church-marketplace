import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900">
        Page not found
      </h2>
      <p className="mt-2 text-gray-600">Sorry, we could not find the page you were looking for.</p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-blue-700 px-6 py-2 text-white font-medium hover:bg-blue-800"
      >
        Go back home
      </Link>
    </div>
  );
}

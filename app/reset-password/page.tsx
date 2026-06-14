"use client";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Password reset email delivery is not yet wired up. We acknowledge the
    // request without revealing whether an account exists, and an admin can
    // assist directly in the meantime.
    setSubmitted(true);
  }

  const inp =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold text-blue-700">Reset password</h1>

      {submitted ? (
        <div className="mt-6 rounded-md bg-blue-50 p-4 text-sm text-blue-900">
          If an account exists for <strong>{email}</strong>, we'll follow up with
          reset instructions. Self-serve reset emails are coming soon — for now,
          contact your Platform Admin if you need help regaining access.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <p className="text-sm text-gray-500">
            Enter your email and we'll help you get back into your account.
          </p>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              required
              type="email"
              className={inp}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Send reset instructions
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-gray-500">
        <a href="/login" className="text-blue-700 underline">
          Back to log in
        </a>
      </p>
    </div>
  );
}

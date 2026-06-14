export function VerificationGate({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-lg mt-20 rounded-xl border border-amber-300 bg-amber-50 p-8 text-center">
      <div className="text-4xl mb-3">🔒</div>
      <h3 className="text-lg font-semibold text-amber-900">{title}</h3>
      <p className="mt-2 text-amber-800 text-sm">
        You must be verified to access this. Add your church details and a
        reference document so an admin can confirm your connection.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <a
          href="/dashboard/edit-church"
          className="inline-block rounded-md bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Update church details
        </a>
        <a
          href="/dashboard"
          className="inline-block rounded-md border px-5 py-2 text-sm font-medium hover:bg-white"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

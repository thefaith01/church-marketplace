export function VerificationGate({ title }: { title: string }) {
  return (
    <div className="mx-auto mt-20 max-w-lg rounded-[24px] border border-[#E8D3A6] bg-[#F4E7CE] p-8 text-center">
      <div className="mb-3 text-4xl">🔒</div>
      <h3 className="font-display text-xl font-bold text-[#5A4214]">{title}</h3>
      <p className="mt-2 text-sm text-[#7A6230]">
        You must be verified to access this. Add your church details and a
        reference document so an admin can confirm your connection.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <a
          href="/dashboard/edit-church"
          className="inline-flex items-center rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-paper no-underline hover:bg-clay-dark"
        >
          Update church details
        </a>
        <a
          href="/dashboard"
          className="inline-flex items-center rounded-full border-[1.5px] border-[#D8C9AE] px-5 py-2.5 text-sm font-semibold text-ink no-underline hover:bg-chip"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

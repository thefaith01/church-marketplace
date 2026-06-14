import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { Container, PageHeader, EmptyState, ui } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function AdminCategoriesPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <Container>
      <PageHeader title="Manage categories" subtitle="Service categories members choose from when listing." />

      <div className="rounded-[18px] border border-line bg-paper p-5 shadow-sm">
        <h2 className="font-display font-bold text-ink">Add a category</h2>
        <form action="/api/admin/categories" method="POST" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <input name="name" required placeholder="Name (e.g. Plumbing)" className={`${ui.input} mt-0`} />
          <input name="icon" placeholder="Icon (emoji)" className={`${ui.input} mt-0 sm:w-28`} />
          <input name="sortOrder" type="number" placeholder="Order" className={`${ui.input} mt-0 sm:w-24`} />
          <button type="submit" className={ui.btnPrimary}>Add</button>
        </form>
      </div>

      <div className="mt-6 space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-[14px] border border-line bg-paper p-3">
            <span className="text-sm font-medium text-ink">
              {c.icon ? `${c.icon} ` : ""}
              {c.name}
              <span className="ml-2 text-xs text-faint">/{c.slug}</span>
            </span>
            <form action={`/api/admin/categories/${c.id}/delete`} method="POST">
              <button type="submit" className="rounded-full border-[1.5px] border-[#E2C3B6] px-3 py-1 text-xs font-semibold text-clay-dark hover:bg-[#F3E1D9]">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <EmptyState icon="🗂" title="No categories yet" hint="Add the first one above. Until then, providers type a category freely." />
      )}
    </Container>
  );
}

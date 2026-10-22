import { desc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db, hasDatabase, schema } from "@/lib/db";
import type { OrderStatus } from "@/lib/db/schema";
import { formatPrice } from "@/lib/format";
import { catalogueTodos } from "@/lib/catalogue/readiness";
import { revalidatePath } from "next/cache";
import Link from "next/link";

const statuses: OrderStatus[] = ["paid", "fulfilled", "cancelled", "refunded", "withdrawn"];
const badge: Record<OrderStatus, string> = {
  paid: "bg-paper",
  fulfilled: "bg-[#d6ead9]",
  cancelled: "bg-line",
  refunded: "bg-blush",
  withdrawn: "bg-blush",
};

async function setStatus(form: FormData) {
  "use server";
  // The proxy guards /admin, but server actions are POSTs to this same path, so they are covered too.
  const id = Number(form.get("id"));
  const status = String(form.get("status")) as OrderStatus;
  if (!Number.isInteger(id) || !statuses.includes(status)) return;
  await db().update(schema.orders).set({ status, updatedAt: new Date() }).where(eq(schema.orders.id, id));
  revalidatePath("/admin");
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  await connection();
  const todos = catalogueTodos();
  const filter = (await searchParams).status;

  if (!hasDatabase()) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl">Orders</h1>
        <p className="mt-4">No database connected yet. Add a Neon database in Vercel → Storage.</p>
      </main>
    );
  }

  const rows = await db().query.orders.findMany({
    where: typeof filter === "string" && statuses.includes(filter as OrderStatus) ? eq(schema.orders.status, filter as OrderStatus) : undefined,
    orderBy: desc(schema.orders.createdAt),
    limit: 200,
    with: { items: true },
  });

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-3xl">Orders</h1>
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link href="/admin" className="rounded-pill border border-line px-3 py-1">All</Link>
          {statuses.map((s) => (
            <a key={s} href={`/admin?status=${s}`} className={`rounded-pill border px-3 py-1 ${filter === s ? "border-onion" : "border-line"}`}>
              {s}
            </a>
          ))}
        </nav>
      </div>

      {todos.length > 0 && (
        <details className="mt-4 rounded-soft bg-paper p-3 text-sm">
          <summary className="cursor-pointer font-semibold">{todos.length} catalogue placeholders block live payments</summary>
          <ul className="mt-2 list-disc pl-5">
            {todos.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </details>
      )}

      {rows.length === 0 ? (
        <p className="mt-10 text-muted">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b-2 border-onion">
              <tr>
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Items</th>
                <th className="py-2 pr-3">Ship to</th>
                <th className="py-2 pr-3 text-right">Total</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((o) => (
                <tr key={o.id} className="align-top">
                  <td className="py-3 pr-3 font-semibold">
                    {o.number}
                    {o.isRenewal && <span className="ml-1 text-xs font-normal text-muted">renewal</span>}
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap">
                    {new Intl.DateTimeFormat("nl-BE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Brussels" }).format(o.createdAt)}
                  </td>
                  <td className="py-3 pr-3">
                    {o.name}
                    <br />
                    <a href={`mailto:${o.email}`} className="text-muted underline">{o.email}</a>
                  </td>
                  <td className="py-3 pr-3">
                    {o.items.map((i) => (
                      <div key={i.id}>
                        {i.quantity} × {i.name}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 pr-3 text-xs">
                    {[o.shippingAddress?.line1, `${o.shippingAddress?.postalCode ?? ""} ${o.shippingAddress?.city ?? ""}`, o.shippingAddress?.country]
                      .filter((x) => x && x.trim())
                      .join(", ")}
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums">{formatPrice(o.totalCents, "nl")}</td>
                  <td className="py-3">
                    <form action={setStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={o.id} />
                      <label className="sr-only" htmlFor={`s-${o.id}`}>Status of {o.number}</label>
                      <select id={`s-${o.id}`} name="status" defaultValue={o.status} className={`rounded-soft border border-line px-2 py-1 ${badge[o.status]}`}>
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button type="submit" className="rounded-pill bg-onion px-3 py-1 text-flesh">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

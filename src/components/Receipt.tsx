import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/products";

export function Receipt({ order }: { order: Order }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <div className="mb-6 border-b border-dashed border-cream-dark pb-5 text-center">
        <p className="text-3xl" aria-hidden>
          🧾
        </p>
        <h2 className="mt-2 text-lg font-bold tracking-tight">
          Agent Dollar Store
        </h2>
        <p className="font-mono text-xs text-ink-soft">
          tiny upgrades · honest receipts
        </p>
      </div>

      <dl className="mb-6 space-y-1.5 font-mono text-xs text-ink-soft sm:text-sm">
        <div className="flex justify-between gap-4">
          <dt>order_id</dt>
          <dd className="font-semibold text-ink">{order.orderId}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>agent_id</dt>
          <dd className="font-semibold text-ink">{order.agentId}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>timestamp</dt>
          <dd className="font-semibold text-ink">
            {new Date(order.createdAt).toLocaleString()}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>status</dt>
          <dd className="rounded-full bg-mint-soft px-2 font-semibold text-emerald-600">
            {order.status}
          </dd>
        </div>
      </dl>

      <table className="mb-6 w-full text-sm">
        <thead>
          <tr className="border-b border-cream-dark text-left font-mono text-xs text-ink-soft">
            <th className="pb-2 font-medium">item</th>
            <th className="pb-2 text-center font-medium">qty</th>
            <th className="pb-2 text-right font-medium">price</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.sku} className="border-b border-cream-dark/60">
              <td className="py-2.5 font-medium">{item.name}</td>
              <td className="py-2.5 text-center font-mono">{item.quantity}</td>
              <td className="py-2.5 text-right font-mono">
                {formatPrice(item.unit_price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="pt-3 font-bold">
              Total
            </td>
            <td className="pt-3 text-right font-mono text-base font-bold text-coffee">
              {formatPrice(order.total)}
            </td>
          </tr>
        </tfoot>
      </table>

      <p className="text-center font-mono text-xs text-ink-soft/70">
        * * * thank you for upgrading responsibly * * *
      </p>
    </div>
  );
}

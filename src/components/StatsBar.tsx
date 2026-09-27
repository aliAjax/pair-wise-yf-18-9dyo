import type { EvaluatedStone, OrderAllocation } from "../rules/sorting";

interface Props {
  stones: EvaluatedStone[];
  orders: OrderAllocation[];
}

export default function StatsBar({ stones, orders }: Props) {
  const count = (status: string) => stones.filter((s) => s.status === status).length;
  const unallocated = orders.reduce((sum, o) => sum + o.unallocated, 0);

  const items = [
    { label: "到货总数", value: stones.length, tone: "total" },
    { label: "待核对", value: count("待核对"), tone: "pending" },
    { label: "待镶嵌（已放行）", value: count("待镶嵌"), tone: "released" },
    { label: "待换货", value: count("待换货"), tone: "exchange" },
    { label: "订单未分配镶位", value: unallocated, tone: "gap" },
  ];

  return (
    <section className="stats">
      {items.map((item) => (
        <article key={item.label} className={`stat stat-${item.tone}`}>
          <small>{item.label}</small>
          <strong>{item.value}</strong>
        </article>
      ))}
    </section>
  );
}

import type { OrderAllocation } from "../rules/sorting";

interface Props {
  orders: OrderAllocation[];
}

export default function OrderBoard({ orders }: Props) {
  return (
    <section className="panel">
      <div className="heading">
        <div>
          <p>订单清单</p>
          <h2>镶位分配</h2>
        </div>
        <span className="muted-note">仅「待镶嵌」的石头可占镶位；待核对与待换货均不计入</span>
      </div>
      <div className="order-grid">
        {orders.map((o) => (
          <article key={o.orderNo} className="order-card">
            <header>
              <strong>{o.orderNo}</strong>
              <span>{o.item}</span>
            </header>
            <p className="spec">
              {o.shape} · {o.carat.toFixed(2)}ct ± {o.caratTolerance.toFixed(2)} · 需求{" "}
              {o.qty} 颗
            </p>
            <div className="order-counts">
              <div className="ok">
                <small>已放行</small>
                <b>{o.allocated.length}</b>
              </div>
              <div className="warn">
                <small>待换货</small>
                <b>{o.exchangeStones.length}</b>
              </div>
              <div className={o.unallocated > 0 ? "bad" : "ok"}>
                <small>未分配</small>
                <b>{o.unallocated}</b>
              </div>
            </div>
            {o.allocated.length > 0 && (
              <div className="chips">
                {o.allocated.map((s) => (
                  <span key={s.key} className="chip" title={`${s.parcelNo} · ${s.carat.toFixed(2)}ct`}>
                    {s.id}
                  </span>
                ))}
              </div>
            )}
            {o.exchangeStones.length > 0 && (
              <p className="note warn-text">
                待换货：{o.exchangeStones.map((s) => `${s.id}（${s.parcelNo}）`).join("、")}
                ，原记录保留，待供应商补货
              </p>
            )}
            {o.pendingCount > 0 && (
              <p className="note muted">另有 {o.pendingCount} 颗规格匹配的石头挂在待核对，暂不占位</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

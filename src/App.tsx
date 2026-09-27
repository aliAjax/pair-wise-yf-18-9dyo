import { Fragment, useMemo, useState } from "react";
import "./styles.css";
import type { Gem, GemStage } from "./types";
import { STAGE_LABEL } from "./types";
import { checkIdentity, countOrder } from "./rules";
import { usePersistentGems, usePersistentOrders } from "./storage";
import GemFormModal, { type GemFormData } from "./components/GemFormModal";
import DispatchModal from "./components/DispatchModal";

const STAGES: GemStage[] = ["arrived", "ready", "released", "exchange"];

function nowIso() {
  return new Date().toISOString();
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function App() {
  const [gems, setGems, resetSeed] = usePersistentGems();
  const orders = usePersistentOrders();

  const [pkgFilter, setPkgFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Gem | null>(null);
  const [dispatching, setDispatching] = useState<Gem | null>(null);

  const packages = useMemo(
    () => Array.from(new Set(gems.map((g) => g.packageNo))).sort(),
    [gems]
  );

  const identityMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof checkIdentity>>();
    for (const g of gems) map.set(g.id, checkIdentity(g, gems));
    return map;
  }, [gems]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return gems.filter((g) => {
      if (pkgFilter !== "all" && g.packageNo !== pkgFilter) return false;
      if (stageFilter !== "all" && g.stage !== stageFilter) return false;
      if (orderFilter !== "all" && g.orderId !== orderFilter) return false;
      if (
        kw &&
        ![g.stoneNo, g.certNo, g.girdleCode, g.note, g.packageNo]
          .join(" ")
          .toLowerCase()
          .includes(kw)
      )
        return false;
      return true;
    });
  }, [gems, pkgFilter, stageFilter, orderFilter, keyword]);

  const stats = useMemo(() => {
    const s = { arrived: 0, ready: 0, released: 0, exchange: 0, carat: 0 };
    for (const g of gems) {
      s[g.stage] += 1;
      s.carat += g.carat;
    }
    return s;
  }, [gems]);

  // ── 存档操作 ─────────────────────────────────────────────────────

  const appendHistory = (g: Gem, action: string, detail?: string): Gem => ({
    ...g,
    history: [...g.history, { at: nowIso(), action, detail }],
  });

  const addGem = (data: GemFormData) => {
    const nextNo =
      gems.reduce((max, g) => {
        const n = Number(g.id.replace(/^G/, ""));
        return Number.isFinite(n) ? Math.max(max, n) : max;
      }, 0) + 1;
    const gem: Gem = {
      ...data,
      id: `G${String(nextNo).padStart(3, "0")}`,
      stage: "arrived",
      orderId: null,
      history: [{ at: nowIso(), action: "到货登记", detail: data.note }],
    };
    setGems((list) => [...list, gem]);
    setFormOpen(false);
  };

  const editGem = (data: GemFormData) => {
    if (!editing) return;
    setGems((list) =>
      list.map((g) =>
        g.id === editing.id
          ? appendHistory(
              { ...g, ...data },
              "编辑登记",
              "修正包裹/编号/腰码/证书/参数等字段，原记录保留"
            )
          : g
      )
    );
    setEditing(null);
  };

  const confirmDispatch = (orderId: string, pass: boolean) => {
    if (!dispatching) return;
    const order = orders.find((o) => o.id === orderId);
    setGems((list) =>
      list.map((g) => {
        if (g.id !== dispatching.id) return g;
        if (pass) {
          return appendHistory(
            { ...g, stage: "released", orderId },
            g.stage === "ready" ? `放行 ${orderId}` : "核对通过",
            g.stage === "ready"
              ? `派至 ${orderId}，占镶位`
              : `证书/腰码/编号一致；尺寸、色级合格，放行 ${orderId}（${order?.title ?? ""}）`
          );
        }
        return appendHistory(
          { ...g, stage: "exchange", orderId },
          `派石 ${orderId} 不达标记换货`,
          "尺寸超公差或颜色等级不足；原记录保留，换货石不占订单数量"
        );
      })
    );
    setDispatching(null);
  };

  const recall = (gem: Gem) => {
    setGems((list) =>
      list.map((g) =>
        g.id === gem.id
          ? appendHistory(
              { ...g, stage: "ready" },
              "撤回放行",
              `退出 ${gem.orderId ?? ""} 镶位，回到待镶嵌`
            )
          : g
      )
    );
  };

  const takeBackExchange = (gem: Gem) => {
    setGems((list) =>
      list.map((g) =>
        g.id === gem.id
          ? appendHistory(
              { ...g, stage: "ready" },
              "换货收回",
              "供应商补石/重新核对后回到待镶嵌，换货记录保留"
            )
          : g
      )
    );
  };

  const restoreSeed = () => {
    if (window.confirm("恢复出厂预置三包数据？浏览器中当前的分拣记录将被覆盖。")) {
      resetSeed();
      setPkgFilter("all");
      setStageFilter("all");
      setOrderFilter("all");
      setKeyword("");
    }
  };

  // ── 页面 ─────────────────────────────────────────────────────────

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="kicker">珠宝镶嵌工作室 · 收货区</p>
          <h1>到货分拣台</h1>
          <p className="subtitle">
            供应商裸石包到货先核身份（证书号 / 腰码 / 跨包编号），再按订单质量派石；
            异常留待核对，不达标走换货，原记录全程保留。
          </p>
        </div>
        <div className="topbar-actions">
          <button onClick={restoreSeed}>恢复预置三包</button>
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            + 新到裸石登记
          </button>
        </div>
      </header>

      <section className="stat-bar">
        <div className="stat">
          <small>在库裸石</small>
          <strong>
            {gems.length}
            <em>颗 / {packages.length} 包</em>
          </strong>
        </div>
        <div className="stat warn">
          <small>待核对</small>
          <strong>
            {stats.arrived}
            <em>颗，不占镶位</em>
          </strong>
        </div>
        <div className="stat ok">
          <small>待镶嵌</small>
          <strong>{stats.ready}</strong>
        </div>
        <div className="stat good">
          <small>已放行镶位</small>
          <strong>{stats.released}</strong>
        </div>
        <div className="stat danger">
          <small>换货中</small>
          <strong>
            {stats.exchange}
            <em>颗，不占数量</em>
          </strong>
        </div>
        <div className="stat">
          <small>在库总克拉</small>
          <strong>
            {stats.carat.toFixed(2)}
            <em>ct</em>
          </strong>
        </div>
      </section>

      <section className="order-board">
        <div className="section-title">
          <h2>订单清单</h2>
          <span>点击订单卡片可按订单筛选石表</span>
        </div>
        <div className="order-cards">
          {orders.map((o) => {
            const c = countOrder(o, gems);
            const active = orderFilter === o.id;
            return (
              <button
                key={o.id}
                className={`order-card ${active ? "active" : ""}`}
                onClick={() =>
                  setOrderFilter((v) => (v === o.id ? "all" : o.id))
                }
              >
                <div className="order-card-head">
                  <b>{o.id}</b>
                  <span className={`slot ${c.full ? "full" : ""}`}>
                    {c.released}/{o.need} 镶位
                  </span>
                </div>
                <p>{o.title}</p>
                <div className="order-spec-line">
                  {o.shape} · {o.targetSize}mm ±{o.toleranceMm} · ≥{o.minColor}
                </div>
                <div className="order-counts">
                  <span className="cnt-good">已放行 {c.released}</span>
                  <span className="cnt-danger">待换货 {c.exchange}</span>
                  <span className="cnt-mute">未分配 {c.unassigned}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bench">
        <div className="filters">
          <label>
            <span>包裹</span>
            <select
              value={pkgFilter}
              onChange={(e) => setPkgFilter(e.target.value)}
            >
              <option value="all">全部包裹</option>
              {packages.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>状态</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="all">全部状态</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>订单</span>
            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
            >
              <option value="all">全部订单</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} · {o.title}
                </option>
              ))}
            </select>
          </label>
          <label className="search">
            <span>搜索</span>
            <input
              placeholder="编号 / 证书号 / 腰码 / 备注"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </label>
        </div>

        <div className="table-wrap">
          <table className="stone-table">
            <thead>
              <tr>
                <th>包裹 / 编号</th>
                <th>形状</th>
                <th>克拉</th>
                <th>尺寸(mm)</th>
                <th>颜色</th>
                <th>净度</th>
                <th>证书号 / 腰码</th>
                <th>状态</th>
                <th className="ops-col">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => {
                const issues = identityMap.get(g.id) ?? [];
                const order = orders.find((o) => o.id === g.orderId);
                const locked = g.stage === "released" || g.stage === "exchange";
                return (
                  <Fragment key={g.id}>
                    <tr
                      className={`stone-row stage-${g.stage} ${expanded === g.id ? "open" : ""}`}
                      onClick={() =>
                        setExpanded((v) => (v === g.id ? null : g.id))
                      }
                    >
                      <td>
                        <div className="stone-id">
                          <b>{g.stoneNo}</b>
                          <span>{g.packageNo}</span>
                        </div>
                        {issues.length > 0 && (
                          <div className="badges">
                            {issues.map((i) => (
                              <span key={i.code} className="badge bad" title={i.detail}>
                                {i.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>{g.shape}</td>
                      <td>{g.carat.toFixed(2)}</td>
                      <td>
                        {g.length}×{g.width}
                      </td>
                      <td>{g.color}</td>
                      <td>{g.clarity}</td>
                      <td>
                        <div className="cert-cell">
                          <span>{g.certNo || "—"}</span>
                          <span className={g.girdleCode ? "" : "missing"}>
                            腰码 {g.girdleCode || "缺失"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`stage-tag ${g.stage}`}>
                          {STAGE_LABEL[g.stage]}
                        </span>
                        {order && (
                          <span className="order-link">{order.id}</span>
                        )}
                      </td>
                      <td className="ops-col" onClick={(e) => e.stopPropagation()}>
                        <div className="row-ops">
                          {(g.stage === "arrived" || g.stage === "ready") && (
                            <button
                              className="mini primary"
                              onClick={() => setDispatching(g)}
                            >
                              {g.stage === "arrived" ? "核对派石" : "放行派石"}
                            </button>
                          )}
                          {g.stage === "released" && (
                            <button className="mini" onClick={() => recall(g)}>
                              撤回放行
                            </button>
                          )}
                          {g.stage === "exchange" && (
                            <button
                              className="mini"
                              onClick={() => takeBackExchange(g)}
                            >
                              换货收回
                            </button>
                          )}
                          <button
                            className="mini"
                            disabled={locked}
                            title={
                              locked
                                ? "已放行/换货记录锁定，原记录保留不可改"
                                : "编辑登记"
                            }
                            onClick={() => setEditing(g)}
                          >
                            编辑
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded === g.id && (
                      <tr className="detail-row">
                        <td colSpan={9}>
                          <div className="detail-grid">
                            <div>
                              <h4>备注</h4>
                              <p>{g.note || "（无）"}</p>
                            </div>
                            <div>
                              <h4>身份核对</h4>
                              {issues.length ? (
                                <ul className="detail-issues">
                                  {issues.map((i) => (
                                    <li key={i.code} className="bad">
                                      {i.label}：{i.detail}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="ok-text">
                                  证书唯一、腰码齐全、编号无跨包重复
                                </p>
                              )}
                            </div>
                            <div className="history">
                              <h4>流转记录（原记录保留）</h4>
                              <ol>
                                {g.history
                                  .slice()
                                  .reverse()
                                  .map((h, i) => (
                                    <li key={i}>
                                      <time>{formatTime(h.at)}</time>
                                      <b>{h.action}</b>
                                      {h.detail && <span>{h.detail}</span>}
                                    </li>
                                  ))}
                              </ol>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty">
                    当前筛选下没有裸石记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="foot-note">
        数据仅保存在本浏览器 localStorage；规则见 <code>src/rules.ts</code>，预置存档见{" "}
        <code>src/archive.ts</code>，页面见 <code>src/App.tsx</code>，三者分开维护。
      </footer>

      {formOpen && (
        <GemFormModal
          initial={null}
          packages={packages}
          onClose={() => setFormOpen(false)}
          onSave={addGem}
        />
      )}
      {editing && (
        <GemFormModal
          initial={editing}
          packages={packages}
          onClose={() => setEditing(null)}
          onSave={editGem}
        />
      )}
      {dispatching && (
        <DispatchModal
          gem={dispatching}
          orders={orders}
          gems={gems}
          onClose={() => setDispatching(null)}
          onConfirm={confirmDispatch}
        />
      )}
    </main>
  );
}

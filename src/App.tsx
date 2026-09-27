import { useEffect, useMemo, useState } from "react";
import { ORDERS, PARCELS } from "./data/archive";
import {
  allocateOrders,
  evaluateParcels,
  type EvaluatedStone,
} from "./rules/sorting";
import StatsBar from "./components/StatsBar";
import FilterBar, { type StatusFilter } from "./components/FilterBar";
import StoneTable from "./components/StoneTable";
import OrderBoard from "./components/OrderBoard";
import "./styles.css";

// 数据只存浏览器：人工核对结果保存在 localStorage，刷新/重开不丢
const STORAGE_KEY = "gem-sorting-desk.approved.v1";

function loadApproved(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export default function App() {
  const [approved, setApproved] = useState<Set<string>>(loadApproved);
  const [parcelFilter, setParcelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...approved]));
  }, [approved]);

  const stones = useMemo(() => evaluateParcels(PARCELS, approved), [approved]);
  const orders = useMemo(() => allocateOrders(ORDERS, stones), [stones]);

  const visibleStones = stones.filter(
    (s) =>
      (parcelFilter === "ALL" || s.parcelNo === parcelFilter) &&
      (statusFilter === "ALL" || s.status === statusFilter),
  );

  const handleApprove = (stone: EvaluatedStone) => {
    const message = [
      `确认核对通过 ${stone.id}（${stone.parcelNo}）？`,
      "",
      "该石头存在以下问题：",
      ...stone.reasons.map((r) => `· ${r}`),
      "",
      "通过后若质量合格将转为「待镶嵌」并占用订单镶位。",
    ].join("\n");
    if (window.confirm(message)) {
      setApproved((prev) => new Set(prev).add(stone.key));
    }
  };

  const handleRevoke = (stone: EvaluatedStone) => {
    setApproved((prev) => {
      const next = new Set(prev);
      next.delete(stone.key);
      return next;
    });
  };

  const handleReset = () => {
    if (window.confirm("清空浏览器中保存的全部人工核对记录，恢复到货初始状态？")) {
      setApproved(new Set());
    }
  };

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p>珠宝镶嵌 · 收货质检</p>
          <h1>到货分拣台</h1>
          <span>
            供应商裸石到包后先登记核对：证书重号、腰码缺失、编号跨包重复的石头留在待核对，不占订单镶位；
            核对通过转待镶嵌；尺寸超公差或色级不足的标记换货，原记录保留。数据仅保存在本浏览器。
          </span>
        </div>
      </header>

      <StatsBar stones={stones} orders={orders} />

      <FilterBar
        parcelNos={PARCELS.map((p) => p.parcelNo)}
        parcelFilter={parcelFilter}
        statusFilter={statusFilter}
        onParcelChange={setParcelFilter}
        onStatusChange={setStatusFilter}
        onReset={handleReset}
      />

      <StoneTable stones={visibleStones} onApprove={handleApprove} onRevoke={handleRevoke} />

      <OrderBoard orders={orders} />
    </main>
  );
}

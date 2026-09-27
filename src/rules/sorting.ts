// ============================================================
// 规则：收货核对与质量判定逻辑（只改规则时只动这个文件）
//
// 状态机：
//   待核对 —— 证书重号 / 腰码缺失 / 编号跨包重复，未人工放行前不占订单镶位
//   待镶嵌 —— 核对通过（或无核对问题），已放行，可占订单镶位
//   待换货 —— 尺寸超出公差或颜色等级不足，原记录保留，不占订单数量
// ============================================================

import type { OrderSpec, Parcel, StoneRecord } from "../data/archive";

export const RULES = {
  /** 尺寸公差（mm），以标准长边/直径为基准 */
  dimensionToleranceMm: 0.2,
  /** 颜色等级底线，低于该等级即换货 */
  minColorGrade: "H",
  colorScale: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"],
  /** 查标准尺寸表时允许的克拉偏差 */
  caratMatchTolerance: 0.15,
  /** 形状 → 克拉 → 标准长边/直径（mm） */
  standardSizes: {
    圆形: { "1.00": 6.5, "0.50": 5.1 },
    椭圆形: { "0.70": 6.8 },
    梨形: { "0.50": 7.0 },
    垫形: { "1.50": 6.6 },
    公主方: { "0.90": 5.5 },
  } as Record<string, Record<string, number>>,
};

export type StoneStatus = "待核对" | "待镶嵌" | "待换货";

export const STATUS_LIST: StoneStatus[] = ["待核对", "待镶嵌", "待换货"];

export interface EvaluatedStone extends StoneRecord {
  parcelNo: string;
  supplier: string;
  arrived: string;
  /** 包裹号 + 编号，唯一标识一颗石头（编号可能跨包重复） */
  key: string;
  status: StoneStatus;
  reasons: string[];
  /** 是否经人工核对放行 */
  manualApproved: boolean;
}

export interface OrderAllocation extends OrderSpec {
  allocated: EvaluatedStone[];
  exchangeStones: EvaluatedStone[];
  /** 规格匹配但仍挂在待核对的石头数量（提示用，不占位） */
  pendingCount: number;
  unallocated: number;
}

export function stoneKey(parcelNo: string, id: string): string {
  return `${parcelNo}|${id}`;
}

function parseSize(size: string): number[] {
  return size
    .split(/[×xX*]/)
    .map((part) => Number(part.trim()))
    .filter((n) => !Number.isNaN(n));
}

/** 按形状 + 克拉查标准尺寸，查不到返回 null（不做尺寸判定） */
function findStandardSize(shape: string, carat: number): number | null {
  const table = RULES.standardSizes[shape];
  if (!table) return null;
  let best: number | null = null;
  let bestDiff = Infinity;
  for (const key of Object.keys(table)) {
    const diff = Math.abs(Number(key) - carat);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = table[key];
    }
  }
  return best !== null && bestDiff <= RULES.caratMatchTolerance ? best : null;
}

/** 对全部到货包裹跑核对 + 质量判定，返回带状态的石头清单 */
export function evaluateParcels(
  parcels: Parcel[],
  approved: ReadonlySet<string>,
): EvaluatedStone[] {
  const flat = parcels.flatMap((p) =>
    p.stones.map((s) => ({
      ...s,
      parcelNo: p.parcelNo,
      supplier: p.supplier,
      arrived: p.arrived,
    })),
  );

  // 全量统计：证书号出现次数、编号出现在哪些包裹
  const certCount = new Map<string, number>();
  const idParcels = new Map<string, Set<string>>();
  for (const s of flat) {
    if (s.cert) certCount.set(s.cert, (certCount.get(s.cert) ?? 0) + 1);
    const set = idParcels.get(s.id) ?? new Set<string>();
    set.add(s.parcelNo);
    idParcels.set(s.id, set);
  }

  return flat.map((s) => {
    const key = stoneKey(s.parcelNo, s.id);

    // ---- 核对问题（留待核对，不占镶位）----
    const reviewReasons: string[] = [];
    const certHits = s.cert ? (certCount.get(s.cert) ?? 0) : 0;
    if (s.cert && certHits > 1) {
      reviewReasons.push(`证书重号：${s.cert} 共出现 ${certHits} 次`);
    }
    if (!s.girdle.trim()) {
      reviewReasons.push("腰码缺失");
    }
    const parcelsForId = idParcels.get(s.id);
    if (parcelsForId && parcelsForId.size > 1) {
      reviewReasons.push(`编号跨包重复：${[...parcelsForId].join("、")}`);
    }

    const manualApproved = approved.has(key);
    if (reviewReasons.length > 0 && !manualApproved) {
      return { ...s, key, status: "待核对", reasons: reviewReasons, manualApproved };
    }

    // ---- 质量判定（核对通过或无核对问题）----
    const qualityReasons: string[] = [];
    const std = findStandardSize(s.shape, s.carat);
    if (std !== null) {
      const dims = parseSize(s.size);
      // 圆形量两条直径，异形只比对长边（标准表按长边/直径登记）
      const faceDims = s.shape === "圆形" ? dims.slice(0, 2) : dims.slice(0, 1);
      const worst = faceDims.length ? Math.max(...faceDims.map((d) => Math.abs(d - std))) : 0;
      if (worst > RULES.dimensionToleranceMm) {
        qualityReasons.push(
          `尺寸超出公差：标准 ${std.toFixed(2)}±${RULES.dimensionToleranceMm}mm，实测 ${s.size}，偏差 ${worst.toFixed(2)}mm`,
        );
      }
    }
    const colorIdx = RULES.colorScale.indexOf(s.color);
    const minIdx = RULES.colorScale.indexOf(RULES.minColorGrade);
    if (colorIdx === -1 || colorIdx > minIdx) {
      qualityReasons.push(`颜色等级不足：${s.color} 低于 ${RULES.minColorGrade}`);
    }

    if (qualityReasons.length > 0) {
      return { ...s, key, status: "待换货", reasons: qualityReasons, manualApproved };
    }
    return { ...s, key, status: "待镶嵌", reasons: [], manualApproved };
  });
}

/** 订单派石：只有待镶嵌的石头能占镶位；待换货/待核对不计入已放行 */
export function allocateOrders(
  orders: OrderSpec[],
  stones: EvaluatedStone[],
): OrderAllocation[] {
  const released = stones
    .filter((s) => s.status === "待镶嵌")
    .sort((a, b) => a.parcelNo.localeCompare(b.parcelNo) || a.id.localeCompare(b.id));
  const used = new Set<string>();

  return orders.map((order) => {
    const matches = (s: EvaluatedStone) =>
      s.shape === order.shape && Math.abs(s.carat - order.carat) <= order.caratTolerance;

    const allocated: EvaluatedStone[] = [];
    for (const s of released) {
      if (allocated.length >= order.qty) break;
      if (used.has(s.key) || !matches(s)) continue;
      used.add(s.key);
      allocated.push(s);
    }

    return {
      ...order,
      allocated,
      exchangeStones: stones.filter((s) => s.status === "待换货" && matches(s)),
      pendingCount: stones.filter((s) => s.status === "待核对" && matches(s)).length,
      unallocated: order.qty - allocated.length,
    };
  });
}

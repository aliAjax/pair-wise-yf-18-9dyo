// 分拣规则层 —— 所有判定规则集中在这里维护，页面与存档不写规则
// 修改规则（公差、色级顺序、放行条件）只改本文件

import type {
  ColorGrade,
  Gem,
  GemShape,
  Order,
  OrderCounts,
} from "./types";

export const SHAPES: GemShape[] = ["圆形", "椭圆", "梨形", "祖母绿切"];

export const COLOR_GRADES: ColorGrade[] = [
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "优",
  "良",
  "中",
  "差",
];

export const CLARITY_GRADES = [
  "FL",
  "IF",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
  "SI2",
  "I1",
  "I2",
  "I3",
] as const;

// 色级数值：数字越小等级越高。钻石 D-Z 与彩宝 优良中差 两套标尺不可互比
const COLOR_RANK: Record<ColorGrade, number> = {
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  H: 5,
  I: 6,
  J: 7,
  K: 8,
  L: 9,
  M: 10,
  N: 11,
  优: 1,
  良: 2,
  中: 3,
  差: 4,
};

export function compareColor(gemColor: ColorGrade, min: ColorGrade): boolean {
  // 钻石字母色级与彩宝汉字色级属于不同标尺，不能直接比较，退回不通过
  const gemNumeric = "A" <= gemColor && gemColor <= "Z";
  const minNumeric = "A" <= min && min <= "Z";
  if (gemNumeric !== minNumeric) return false;
  return COLOR_RANK[gemColor] <= COLOR_RANK[min];
}

export function sizeInTolerance(gem: Gem, order: Order): boolean {
  const range = orderToleranceRange(order);
  return (
    gem.length >= range.lengthMin &&
    gem.length <= range.lengthMax &&
    gem.width >= range.widthMin &&
    gem.width <= range.widthMax
  );
}

export function orderToleranceRange(order: Order) {
  const t = order.toleranceMm;
  return {
    lengthMin: round1(order.targetLength - t),
    lengthMax: round1(order.targetLength + t),
    widthMin: round1(order.targetWidth - t),
    widthMax: round1(order.targetWidth + t),
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

// ── 身份核对（证书号 / 腰码 / 跨包编号）─────────────────────────────
// 规则：证书重号、腰码缺失、编号跨包重复 → 留在待核对，不能占订单镶位

export type IdentityIssueCode =
  | "cert_duplicate"
  | "girdle_missing"
  | "stone_no_cross_package";

export interface IdentityIssue {
  code: IdentityIssueCode;
  label: string;
  detail: string;
}

export function checkIdentity(gem: Gem, all: Gem[]): IdentityIssue[] {
  const issues: IdentityIssue[] = [];

  if (!gem.girdleCode.trim()) {
    issues.push({
      code: "girdle_missing",
      label: "腰码缺失",
      detail: "未找到腰棱激光镭射码，无法与证书对应",
    });
  }

  if (gem.certNo.trim()) {
    const certHit = all.find(
      (g) => g.id !== gem.id && g.certNo.trim() === gem.certNo.trim()
    );
    if (certHit) {
      issues.push({
        code: "cert_duplicate",
        label: "证书重号",
        detail: `证书号 ${gem.certNo} 与 ${certHit.packageNo} 包 ${certHit.stoneNo} 重复`,
      });
    }
  } else {
    issues.push({
      code: "cert_duplicate",
      label: "证书号缺失",
      detail: "证书号为空",
    });
  }

  const sameNo = all.filter(
    (g) => g.id !== gem.id && g.stoneNo.trim() === gem.stoneNo.trim()
  );
  const crossPackage = sameNo.some((g) => g.packageNo !== gem.packageNo);
  if (crossPackage) {
    const other = sameNo
      .filter((g) => g.packageNo !== gem.packageNo)
      .map((g) => `${g.packageNo} 包 ${g.stoneNo}`)
      .join("、");
    issues.push({
      code: "stone_no_cross_package",
      label: "编号跨包重复",
      detail: `编号 ${gem.stoneNo} 同时出现在其他包裹：${other}`,
    });
  }

  return issues;
}

// ── 订单匹配（形状 / 尺寸公差 / 颜色等级）──────────────────────────

export type QualityIssueCode = "shape_mismatch" | "size" | "color";

export interface QualityIssue {
  code: QualityIssueCode;
  label: string;
  detail: string;
}

export function checkQuality(gem: Gem, order: Order): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (gem.shape !== order.shape) {
    issues.push({
      code: "shape_mismatch",
      label: "形状不符",
      detail: `订单要求 ${order.shape}，实物为 ${gem.shape}`,
    });
  }

  if (!sizeInTolerance(gem, order)) {
    const range = orderToleranceRange(order);
    issues.push({
      code: "size",
      label: "尺寸超公差",
      detail: `要求 ${order.targetSize}mm ±${order.toleranceMm}（${range.lengthMin}~${range.lengthMax} × ${range.widthMin}~${range.widthMax}），实测 ${gem.length}×${gem.width}mm`,
    });
  }

  if (!compareColor(gem.color, order.minColor)) {
    issues.push({
      code: "color",
      label: "颜色等级不足",
      detail: `订单最低接受 ${order.minColor} 色级，实物为 ${gem.color}`,
    });
  }

  return issues;
}

// ── 订单数量统计 ────────────────────────────────────────────────────

export function countOrder(order: Order, gems: Gem[]): OrderCounts {
  const linked = gems.filter((g) => g.orderId === order.id);
  const released = linked.filter((g) => g.stage === "released").length;
  const exchange = linked.filter((g) => g.stage === "exchange").length;
  return {
    released,
    exchange,
    unassigned: Math.max(0, order.need - released),
    full: released >= order.need,
  };
}

// 判定一颗宝石能否放行到指定订单：身份无异常、质量合格、订单还有镶位
export function releaseEvaluation(
  gem: Gem,
  order: Order,
  gems: Gem[]
): { identity: IdentityIssue[]; quality: QualityIssue[]; full: boolean } {
  return {
    identity: checkIdentity(gem, gems),
    quality: checkQuality(gem, order),
    full: countOrder(order, gems).full,
  };
}

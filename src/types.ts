// 数据类型定义 —— 页面、规则、存档共用的契约

export type GemStage = "arrived" | "ready" | "released" | "exchange";

export const STAGE_LABEL: Record<GemStage, string> = {
  arrived: "待核对",
  ready: "待镶嵌",
  released: "已放行",
  exchange: "换货中",
};

export type GemShape = "圆形" | "椭圆" | "梨形" | "祖母绿切";

// D-Z 钻石色级（字母越靠前等级越高），以及彩宝等级
export type ColorGrade =
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "优"
  | "良"
  | "中"
  | "差";

export type ClarityGrade =
  | "FL"
  | "IF"
  | "VVS1"
  | "VVS2"
  | "VS1"
  | "VS2"
  | "SI1"
  | "SI2"
  | "I1"
  | "I2"
  | "I3";

export interface Gem {
  id: string;
  packageNo: string; // 包裹号（供应商寄来的裸石包）
  stoneNo: string; // 编号（供应商批号）
  girdleCode: string; // 腰码（激光镭射编号），空串视为缺失
  shape: GemShape;
  carat: number;
  length: number; // mm，直径或长径
  width: number; // mm，直径或短径
  color: ColorGrade;
  clarity: ClarityGrade;
  certNo: string; // 证书号
  stage: GemStage;
  orderId: string | null; // 派石/换货指向的订单
  note: string;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  at: string; // ISO 时间
  action: string;
  detail?: string;
}

export interface Order {
  id: string;
  title: string;
  shape: GemShape;
  targetSize: string; // 规格描述，如 6.0×4.0
  targetLength: number;
  targetWidth: number;
  toleranceMm: number; // 单边公差 mm
  minColor: ColorGrade; // 最低接受色级
  need: number; // 需求数量（镶位）
}

export interface OrderCounts {
  released: number; // 已放行、占用镶位
  exchange: number; // 换货中（不占镶位）
  unassigned: number; // 未分配数量 = need - released，下限 0
  full: boolean;
}

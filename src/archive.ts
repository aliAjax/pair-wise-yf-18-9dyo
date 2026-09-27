// 存档层 —— 预置数据与存档维护入口，与规则、页面分开
// 预置三包到库裸石（PK2609A / PK2609B / PK2609C）及四张在产订单
// 页面运行时数据在浏览器 localStorage，本文件只提供出厂存档

import type { Gem, GemShape, Order } from "./types";

const NOW = "2026-09-27T09:30:00.000Z";

export const SEED_ORDERS: Order[] = [
  {
    id: "ORD-2401",
    title: "蓝宝石椭圆戒指（主石位）",
    shape: "椭圆",
    targetSize: "6.0×4.0",
    targetLength: 6.0,
    targetWidth: 4.0,
    toleranceMm: 0.1,
    minColor: "优",
    need: 1,
  },
  {
    id: "ORD-2402",
    title: "钻石椭圆耳环（成对）",
    shape: "椭圆",
    targetSize: "5.0×3.0",
    targetLength: 5.0,
    targetWidth: 3.0,
    toleranceMm: 0.15,
    minColor: "H",
    need: 4,
  },
  {
    id: "ORD-2403",
    title: "圆钻满钻吊坠",
    shape: "圆形",
    targetSize: "3.0",
    targetLength: 3.0,
    targetWidth: 3.0,
    toleranceMm: 0.1,
    minColor: "F",
    need: 2,
  },
  {
    id: "ORD-2404",
    title: "祖母绿切吊坠（主石位）",
    shape: "祖母绿切",
    targetSize: "7.0×5.0",
    targetLength: 7.0,
    targetWidth: 5.0,
    toleranceMm: 0.1,
    minColor: "F",
    need: 1,
  },
];

interface SeedInput {
  packageNo: string;
  stoneNo: string;
  girdleCode: string;
  shape: GemShape;
  carat: number;
  length: number;
  width: number;
  color: Gem["color"];
  clarity: Gem["clarity"];
  certNo: string;
  stage?: Gem["stage"];
  orderId?: string | null;
  note?: string;
  history?: [string, string][];
}

const P = "PK2609A";
const Q = "PK2609B";
const R = "PK2609C";

const SEED_LIST: SeedInput[] = [
  // ── 第一包 PK2609A ──────────────────────────────────────────────
  {
    packageNo: P,
    stoneNo: "SB-0918",
    girdleCode: "GIA24810918",
    shape: "椭圆",
    carat: 1.02,
    length: 6.02,
    width: 4.01,
    color: "优",
    clarity: "VVS2",
    certNo: "GRS-2026-0918",
    stage: "released",
    orderId: "ORD-2401",
    note: "蓝宝主石，已验证书",
    history: [
      ["到货登记", "供应商三包裸石之第一包"],
      ["核对通过", "证书、腰码、编号均一致"],
      ["放行 ORD-2401", "尺寸、色级合格，占主石镶位"],
    ],
  },
  {
    packageNo: P,
    stoneNo: "SB-0919",
    girdleCode: "",
    shape: "椭圆",
    carat: 0.98,
    length: 5.9,
    width: 3.9,
    color: "良",
    clarity: "VS1",
    certNo: "GRS-2026-0919",
    note: "腰棱未见镭射码，待供应商补图",
    history: [["到货登记", "供应商三包裸石之第一包"]],
  },
  {
    packageNo: P,
    stoneNo: "SB-0920",
    girdleCode: "GIA24810920",
    shape: "椭圆",
    carat: 0.62,
    length: 5.05,
    width: 3.02,
    color: "H",
    clarity: "VS2",
    certNo: "GIA-24810920",
    stage: "ready",
    note: "耳环备石",
    history: [
      ["到货登记", "供应商三包裸石之第一包"],
      ["核对通过", "证书、腰码、编号均一致"],
    ],
  },
  {
    packageNo: P,
    stoneNo: "RD-3001",
    girdleCode: "GIA24830001",
    shape: "圆形",
    carat: 0.11,
    length: 3.02,
    width: 3.02,
    color: "E",
    clarity: "VS1",
    certNo: "GIA-24830001",
    stage: "released",
    orderId: "ORD-2403",
    history: [
      ["到货登记", "供应商三包裸石之第一包"],
      ["核对通过", "证书、腰码、编号均一致"],
      ["放行 ORD-2403", "尺寸、色级合格"],
    ],
  },

  // ── 第二包 PK2609B ──────────────────────────────────────────────
  {
    packageNo: Q,
    stoneNo: "SB-0921",
    girdleCode: "GIA24810921",
    shape: "椭圆",
    carat: 0.6,
    length: 5.0,
    width: 3.0,
    color: "G",
    clarity: "VS2",
    certNo: "GIA-24810921",
    stage: "released",
    orderId: "ORD-2402",
    history: [
      ["到货登记", "供应商三包裸石之第二包"],
      ["核对通过", "证书、腰码、编号均一致"],
      ["放行 ORD-2402", "尺寸、色级合格"],
    ],
  },
  {
    packageNo: Q,
    stoneNo: "SB-0922",
    girdleCode: "GIA24810922",
    shape: "椭圆",
    carat: 0.64,
    length: 5.28,
    width: 3.05,
    color: "F",
    clarity: "VS1",
    certNo: "GIA-24810922",
    stage: "exchange",
    orderId: "ORD-2402",
    note: "长径超 +0.15mm 公差",
    history: [
      ["到货登记", "供应商三包裸石之第二包"],
      ["核对通过", "证书、腰码、编号均一致"],
      ["派石 ORD-2402", "长径 5.28mm 超公差，转换货"],
    ],
  },
  {
    packageNo: Q,
    stoneNo: "SB-0919", // 与第一包同编号 → 编号跨包重复
    girdleCode: "GIA24810919",
    shape: "椭圆",
    carat: 0.95,
    length: 5.88,
    width: 3.92,
    color: "良",
    clarity: "SI1",
    certNo: "GRS-2026-0923",
    note: "编号与 PK2609A 撞号，需供应商确认",
    history: [["到货登记", "供应商三包裸石之第二包"]],
  },
  {
    packageNo: Q,
    stoneNo: "RD-3002",
    girdleCode: "GIA24830002",
    shape: "圆形",
    carat: 0.1,
    length: 3.0,
    width: 3.0,
    color: "F",
    clarity: "VS2",
    certNo: "GIA-24830002",
    stage: "released",
    orderId: "ORD-2403",
    history: [
      ["到货登记", "供应商三包裸石之第二包"],
      ["核对通过", "证书、腰码、编号均一致"],
      ["放行 ORD-2403", "尺寸、色级合格"],
    ],
  },

  // ── 第三包 PK2609C ──────────────────────────────────────────────
  {
    packageNo: R,
    stoneNo: "SB-0924",
    girdleCode: "GIA24810924",
    shape: "椭圆",
    carat: 0.59,
    length: 4.96,
    width: 2.98,
    color: "H",
    clarity: "SI1",
    certNo: "GIA-24810924",
    stage: "arrived",
    note: "耳环备石",
    history: [["到货登记", "供应商三包裸石之第三包"]],
  },
  {
    packageNo: R,
    stoneNo: "SB-0925",
    girdleCode: "GIA24810925",
    shape: "椭圆",
    carat: 0.61,
    length: 5.02,
    width: 3.1,
    color: "J",
    clarity: "SI2",
    certNo: "GIA-24810925",
    stage: "arrived",
    note: "色级疑似偏低",
    history: [["到货登记", "供应商三包裸石之第三包"]],
  },
  {
    packageNo: R,
    stoneNo: "RD-3003",
    girdleCode: "GIA24830003",
    shape: "圆形",
    carat: 0.1,
    length: 2.95,
    width: 2.95,
    color: "G",
    clarity: "VS2",
    certNo: "GIA-24830003",
    stage: "arrived",
    history: [["到货登记", "供应商三包裸石之第三包"]],
  },
  {
    packageNo: R,
    stoneNo: "EM-7001",
    girdleCode: "GIA24870001",
    shape: "祖母绿切",
    carat: 1.51,
    length: 7.04,
    width: 5.03,
    color: "G",
    clarity: "VS1",
    certNo: "GIA-24870001",
    stage: "arrived",
    history: [["到货登记", "供应商三包裸石之第三包"]],
  },
  {
    packageNo: R,
    stoneNo: "RD-3004",
    girdleCode: "GIA24830004",
    shape: "圆形",
    carat: 0.12,
    length: 3.18,
    width: 3.18,
    color: "E",
    clarity: "VVS2",
    certNo: "GIA-24830004",
    stage: "exchange",
    orderId: "ORD-2403",
    note: "直径超 +0.1mm 公差",
    history: [
      ["到货登记", "供应商三包裸石之第三包"],
      ["核对通过", "证书、腰码、编号均一致"],
      ["派石 ORD-2403", "直径 3.18mm 超公差，转换货"],
    ],
  },
  {
    packageNo: R,
    stoneNo: "EM-7002",
    girdleCode: "GIA24870002",
    shape: "祖母绿切",
    carat: 1.48,
    length: 6.98,
    width: 4.97,
    color: "F",
    clarity: "VVS1",
    certNo: "GIA-24830001", // 与 RD-3001 证书重号
    stage: "arrived",
    note: "证书号与包内/他包石重号，暂停核对",
    history: [["到货登记", "供应商三包裸石之第三包"]],
  },
];

export const SEED_GEMS: Gem[] = SEED_LIST.map((row, i) => ({
  id: `G${String(i + 1).padStart(3, "0")}`,
  packageNo: row.packageNo,
  stoneNo: row.stoneNo,
  girdleCode: row.girdleCode,
  shape: row.shape,
  carat: row.carat,
  length: row.length,
  width: row.width,
  color: row.color,
  clarity: row.clarity,
  certNo: row.certNo,
  stage: row.stage ?? "arrived",
  orderId: row.orderId ?? null,
  note: row.note ?? "",
  history: (row.history ?? []).map(([action, detail]) => ({
    at: NOW,
    action,
    detail,
  })),
}));

export const SEED_PACKAGES = [P, Q, R];

// ============================================================
// 存档：供应商到货包裹与订单清单（静态档案数据）
// 状态不在此处维护，一律由 src/rules/sorting.ts 判定。
// ============================================================

export interface StoneRecord {
  id: string; // 编号（供应商石号）
  shape: string; // 形状
  carat: number; // 克拉
  size: string; // 尺寸 mm（长×宽×深）
  color: string; // 颜色等级
  clarity: string; // 净度
  cert: string; // 证书号
  girdle: string; // 腰码（空字符串 = 缺失）
}

export interface Parcel {
  parcelNo: string; // 包裹号
  supplier: string;
  arrived: string; // 到货日期
  stones: StoneRecord[];
}

export interface OrderSpec {
  orderNo: string;
  item: string;
  shape: string;
  carat: number;
  caratTolerance: number;
  qty: number; // 镶位数量
}

export const PARCELS: Parcel[] = [
  {
    parcelNo: "PK-260918-A",
    supplier: "恒曜宝石（香港）",
    arrived: "2026-09-18",
    stones: [
      { id: "ST-8801", shape: "圆形", carat: 1.0, size: "6.48×6.51×3.98", color: "F", clarity: "VS1", cert: "GIA7481002001", girdle: "GIA7481002001" },
      { id: "ST-8802", shape: "圆形", carat: 1.02, size: "6.50×6.53×4.01", color: "G", clarity: "VS2", cert: "GIA7481002002", girdle: "GIA7481002002" },
      { id: "ST-8803", shape: "圆形", carat: 1.01, size: "6.47×6.50×3.95", color: "H", clarity: "SI1", cert: "GIA7481002003", girdle: "GIA7481002003" },
      { id: "ST-8804", shape: "圆形", carat: 0.98, size: "6.88×6.91×4.10", color: "G", clarity: "VS2", cert: "GIA7481002004", girdle: "GIA7481002004" },
      { id: "ST-8805", shape: "圆形", carat: 1.0, size: "6.49×6.52×3.96", color: "J", clarity: "VS1", cert: "GIA7481002005", girdle: "GIA7481002005" },
      { id: "ST-8806", shape: "圆形", carat: 1.03, size: "6.52×6.55×4.02", color: "F", clarity: "VVS2", cert: "GIA6482104555", girdle: "GIA6482104555" },
      { id: "ST-8807", shape: "圆形", carat: 1.0, size: "6.50×6.50×3.99", color: "G", clarity: "VS1", cert: "GIA7481002007", girdle: "GIA7481002007" },
      { id: "ST-8808", shape: "圆形", carat: 1.01, size: "6.49×6.51×3.97", color: "G", clarity: "VS2", cert: "GIA7481002008", girdle: "" },
    ],
  },
  {
    parcelNo: "PK-260919-B",
    supplier: "恒曜宝石（香港）",
    arrived: "2026-09-19",
    stones: [
      { id: "ST-9101", shape: "椭圆形", carat: 0.7, size: "6.80×4.90×3.20", color: "E", clarity: "VS1", cert: "GIA2483001111", girdle: "GIA2483001111" },
      { id: "ST-9102", shape: "椭圆形", carat: 0.68, size: "6.75×4.88×3.15", color: "F", clarity: "VS2", cert: "GIA2483001112", girdle: "GIA2483001112" },
      { id: "ST-9103", shape: "椭圆形", carat: 0.71, size: "6.82×4.92×3.22", color: "D", clarity: "VVS1", cert: "GIA6482104555", girdle: "GIA6482104555" },
      { id: "ST-9104", shape: "梨形", carat: 0.5, size: "7.00×4.60×2.90", color: "G", clarity: "SI1", cert: "GIA2483001114", girdle: "GIA2483001114" },
      { id: "ST-9105", shape: "梨形", carat: 0.52, size: "7.30×4.65×2.95", color: "F", clarity: "VS1", cert: "GIA2483001115", girdle: "GIA2483001115" },
      { id: "ST-9106", shape: "梨形", carat: 0.5, size: "7.02×4.58×2.88", color: "K", clarity: "SI2", cert: "GIA2483001116", girdle: "GIA2483001116" },
      { id: "ST-9107", shape: "椭圆形", carat: 0.7, size: "6.79×4.91×3.18", color: "G", clarity: "VS1", cert: "GIA2483001117", girdle: "GIA2483001117" },
    ],
  },
  {
    parcelNo: "PK-260920-C",
    supplier: "璨生矿业（深圳）",
    arrived: "2026-09-20",
    stones: [
      { id: "ST-9201", shape: "垫形", carat: 1.5, size: "6.60×6.55×4.30", color: "F", clarity: "VS1", cert: "GIA1485002221", girdle: "GIA1485002221" },
      { id: "ST-9202", shape: "垫形", carat: 1.52, size: "6.62×6.58×4.35", color: "G", clarity: "VS2", cert: "GIA1485002222", girdle: "GIA1485002222" },
      { id: "ST-9203", shape: "公主方", carat: 0.9, size: "5.50×5.48×3.80", color: "E", clarity: "VVS2", cert: "GIA1485002223", girdle: "GIA1485002223" },
      { id: "ST-9204", shape: "公主方", carat: 0.92, size: "5.52×5.50×3.85", color: "H", clarity: "VS1", cert: "GIA1485002224", girdle: "GIA1485002224" },
      { id: "ST-8807", shape: "垫形", carat: 1.48, size: "6.58×6.54×4.28", color: "G", clarity: "VS1", cert: "GIA1485002225", girdle: "GIA1485002225" },
    ],
  },
];

export const ORDERS: OrderSpec[] = [
  { orderNo: "SO-26001", item: "六爪钻戒", shape: "圆形", carat: 1.0, caratTolerance: 0.08, qty: 4 },
  { orderNo: "SO-26002", item: "椭圆吊坠", shape: "椭圆形", carat: 0.7, caratTolerance: 0.05, qty: 3 },
  { orderNo: "SO-26003", item: "梨形耳坠", shape: "梨形", carat: 0.5, caratTolerance: 0.05, qty: 2 },
  { orderNo: "SO-26004", item: "垫形戒指", shape: "垫形", carat: 1.5, caratTolerance: 0.08, qty: 2 },
  { orderNo: "SO-26005", item: "公主方耳钉", shape: "公主方", carat: 0.9, caratTolerance: 0.05, qty: 2 },
];

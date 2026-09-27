// 浏览器存档 —— 数据只存 localStorage，不发任何网络请求

import { useEffect, useState } from "react";
import type { Gem, Order } from "./types";
import { SEED_GEMS, SEED_ORDERS } from "./archive";

const KEY_GEMS = "sorting-bench:gems:v1";
const KEY_ORDERS = "sorting-bench:orders:v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function usePersistentGems(): [
  Gem[],
  React.Dispatch<React.SetStateAction<Gem[]>>,
  () => void,
] {
  const [gems, setGems] = useState<Gem[]>(() => load(KEY_GEMS, SEED_GEMS));

  useEffect(() => {
    localStorage.setItem(KEY_GEMS, JSON.stringify(gems));
  }, [gems]);

  const reset = () => setGems(SEED_GEMS.map((g) => structuredClone(g)));
  return [gems, setGems, reset];
}

export function usePersistentOrders(): Order[] {
  const [orders] = useState<Order[]>(() => load(KEY_ORDERS, SEED_ORDERS));

  useEffect(() => {
    localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  return orders;
}

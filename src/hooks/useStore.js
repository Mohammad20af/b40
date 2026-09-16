import { useMemo, useSyncExternalStore } from "react";
import {
  catalogService,
  orderService,
  storageKeys,
  storageSnapshot,
  subscribeStore,
} from "../services/store";
const productSnapshot = () => storageSnapshot(storageKeys.products);
const orderSnapshot = () => storageSnapshot(storageKeys.orders);
export function useCatalog() {
  const snapshot = useSyncExternalStore(
    subscribeStore,
    productSnapshot,
    () => null,
  );
  return useMemo(() => catalogService.list(), [snapshot]);
}
export function useOrders() {
  const snapshot = useSyncExternalStore(
    subscribeStore,
    orderSnapshot,
    () => null,
  );
  return useMemo(() => orderService.list(), [snapshot]);
}

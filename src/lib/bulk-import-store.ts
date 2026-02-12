"use client";

import { useSyncExternalStore } from "react";

export type BulkImportRow = Record<string, string>;

type BulkImportState = {
  rows: BulkImportRow[];
  applyRow?: (row: BulkImportRow) => Promise<void> | void;
};

const EMPTY_STATE: BulkImportState = { rows: [], applyRow: undefined };
const state = new Map<string, BulkImportState>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore subscriber errors
    }
  });
}

export function setBulkImportState(slug: string | undefined, rows: BulkImportRow[], applyRow?: BulkImportState["applyRow"]) {
  if (!slug) return;
  state.set(slug, { rows, applyRow });
  notify();
}

export function clearBulkImportState(slug: string | undefined) {
  if (!slug) return;
  state.delete(slug);
  notify();
}

export function useBulkImportState(slug: string | undefined) {
  const getSnapshot = () => state.get(slug ?? "") ?? EMPTY_STATE;

  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot,
    getSnapshot,
  );
}

export function getBulkImportState(slug: string | undefined): BulkImportState {
  return state.get(slug ?? "") ?? { rows: [], applyRow: undefined };
}

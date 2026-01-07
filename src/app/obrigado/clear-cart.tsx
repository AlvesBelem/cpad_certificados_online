"use client";

import { useEffect } from "react";

export function ClearCartOnMount() {
  useEffect(() => {
    fetch("/api/cart", { method: "DELETE" }).catch(() => undefined);
  }, []);

  return null;
}

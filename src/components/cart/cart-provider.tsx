"use client";

import { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";
import { useCart } from "@/hooks/use-cart";

type CartContextValue = ReturnType<typeof useCart>;

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const cart = useCart();

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartContext deve ser usado dentro de CartProvider");
  }

  return context;
}

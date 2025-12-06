"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

type CartSheetContextValue = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setOpen: (state: boolean) => void;
};

const CartSheetContext = createContext<CartSheetContextValue | null>(null);

export function CartSheetProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      setOpen: setIsOpen,
    }),
    [isOpen, openCart, closeCart, toggleCart],
  );

  return <CartSheetContext.Provider value={value}>{children}</CartSheetContext.Provider>;
}

export function useCartSheet() {
  const context = useContext(CartSheetContext);
  if (!context) {
    throw new Error("useCartSheet deve ser usado dentro de CartSheetProvider");
  }
  return context;
}

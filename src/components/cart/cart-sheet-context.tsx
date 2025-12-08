"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";

type OpenCartOptions = {
  autoCloseMs?: number;
};

type CartSheetContextValue = {
  isOpen: boolean;
  openCart: (options?: OpenCartOptions) => void;
  closeCart: () => void;
  toggleCart: () => void;
  setOpen: (state: boolean) => void;
};

const CartSheetContext = createContext<CartSheetContextValue | null>(null);

export function CartSheetProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const autoCloseRef = useRef<NodeJS.Timeout | null>(null);

  const clearAutoClose = useCallback(() => {
    if (autoCloseRef.current) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
  }, []);

  const scheduleAutoClose = useCallback(
    (ms?: number) => {
      if (!ms) return;
      clearAutoClose();
      autoCloseRef.current = setTimeout(() => {
        setIsOpen(false);
        autoCloseRef.current = null;
      }, ms);
    },
    [clearAutoClose],
  );

  const openCart = useCallback(
    (options?: OpenCartOptions) => {
      setIsOpen(true);
      scheduleAutoClose(options?.autoCloseMs);
    },
    [scheduleAutoClose],
  );

  const closeCart = useCallback(() => {
    clearAutoClose();
    setIsOpen(false);
  }, [clearAutoClose]);

  const toggleCart = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!next) {
        clearAutoClose();
      }
      return next;
    });
  }, [clearAutoClose]);

  const setOpen = useCallback(
    (state: boolean) => {
      if (state) {
        openCart();
      } else {
        closeCart();
      }
    },
    [openCart, closeCart],
  );

  const value = useMemo(
    () => ({
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      setOpen,
    }),
    [isOpen, openCart, closeCart, toggleCart, setOpen],
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

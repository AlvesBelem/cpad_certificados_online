"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type RedirectTimerProps = {
  delayMs?: number;
};

export function RedirectTimer({ delayMs = 60_000 }: RedirectTimerProps) {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push("/certificados");
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delayMs, router]);

  return null;
}

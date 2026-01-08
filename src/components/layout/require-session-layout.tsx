import type { PropsWithChildren } from "react";
import { requireSession } from "@/lib/session";

export default async function RequireSessionLayout({ children }: PropsWithChildren) {
  await requireSession();
  return children;
}

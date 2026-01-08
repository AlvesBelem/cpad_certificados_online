import type { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function PublicPagesLayout({ children }: PropsWithChildren) {
  const session = await getSession();
  if (session?.user) {
    redirect("/certificados");
  }
  return <>{children}</>;
}

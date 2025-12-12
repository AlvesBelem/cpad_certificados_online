import { createAuthClient } from "better-auth/react";
import { getAppUrl } from "@/lib/app-url";

export const authClient = createAuthClient({
  baseURL: getAppUrl(),
});

const defaultAppUrl = "http://localhost:3000";

const ensureProtocol = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");

  const isLocal = trimmed.startsWith("localhost") || trimmed.startsWith("127.0.0.1");
  return `${isLocal ? "http" : "https"}://${trimmed.replace(/\/$/, "")}`;
};

export function getAppUrl() {
  const envUrl = ensureProtocol(process.env.NEXT_PUBLIC_APP_URL);
  if (envUrl) return envUrl;

  const vercelUrl = ensureProtocol(process.env.VERCEL_URL);
  if (vercelUrl) return vercelUrl;

  return defaultAppUrl;
}

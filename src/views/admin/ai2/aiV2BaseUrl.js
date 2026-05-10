export const getAiV2BaseUrl = () => {
  const raw = process.env.REACT_APP_AI_API_ENDPOINT;
  if (!raw || typeof raw !== "string") return "";

  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return "";

  // If env already points at the v2 prefix, keep it.
  if (trimmed.endsWith("/api/v2")) return trimmed;
  if (trimmed.includes("/api/v2")) return trimmed.replace(/\/$/, "");

  // Otherwise, build the v2 prefix from the host/base.
  return `${trimmed}/api/v2`;
};


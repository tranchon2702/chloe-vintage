const apiPrefix = import.meta.env.VITE_API_PREFIX || "/api/v1";
const deployTarget = import.meta.env.VITE_DEPLOY_TARGET || "api";

if (!apiPrefix.startsWith("/api/")) {
  throw new Error("VITE_API_PREFIX must start with /api/");
}

export const config = Object.freeze({
  apiPrefix,
  useNetlifyForms: deployTarget === "netlify",
  requestTimeoutMs: 15_000,
});

import { config } from "../config.js";

export class ApiClientError extends Error {
  constructor(message, { status = 0, details, requestId } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

export async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const response = await fetch(`${config.apiPrefix}${path}`, {
      ...options,
      headers: {
        accept: "application/json",
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const details = payload?.details && Object.values(payload.details)[0];
      const firstDetail = Array.isArray(details) ? details[0] : details;
      throw new ApiClientError(firstDetail || payload?.message || "Request failed.", {
        status: response.status,
        details: payload?.details,
        requestId: payload?.requestId,
      });
    }

    return payload?.data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiClientError("The request timed out. Please try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

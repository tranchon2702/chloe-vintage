import { apiRequest } from "../lib/api-client.js";

export const contentService = {
  get() {
    return apiRequest("/content", { method: "GET" });
  },
};

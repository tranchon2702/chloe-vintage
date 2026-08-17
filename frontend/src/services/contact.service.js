import { apiRequest } from "../lib/api-client.js";
import { config } from "../config.js";

async function sendToNetlifyForms(payload) {
  const response = await fetch("/", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "form-name": "contact",
      ...payload,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Netlify Forms rejected the submission with status ${response.status}.`);
  }

  return { success: true };
}

export const contactService = {
  send(payload) {
    if (config.useNetlifyForms) {
      return sendToNetlifyForms(payload);
    }

    return apiRequest("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

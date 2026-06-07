import { apiUrl } from "@/utils/api";
import { getToken } from "@/utils/auth";
import {
  DEFAULT_SUBSCRIBERS_OVERVIEW,
  mergeSubscribersOverview,
  type SubscribersOverview,
} from "@/utils/subscribersData";

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchSubscribersOverview(): Promise<SubscribersOverview> {
  const token = getToken();
  if (!token) throw new Error("Authentication required.");

  const response = await fetch(apiUrl("/api/subscribers/overview"), {
    headers: authHeaders(),
    cache: "no-store",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || `Request failed (${response.status})`);
  }

  return mergeSubscribersOverview(json.data);
}

export async function deleteNewsletterSubscriber(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/subscribers/newsletter/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to delete subscriber");
}

export async function deleteContactSubmission(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/subscribers/contact/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to delete contact");
}

export async function sendSubscriberEmailApi(payload: {
  to: string;
  title: string;
  body: string;
  subscriberId?: string;
  contactId?: string;
  templateId?: string;
  recipientName?: string;
}): Promise<void> {
  const response = await fetch(apiUrl("/api/subscribers/send-email"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to send email");
}

export async function createEmailTemplateApi(payload: {
  title: string;
  body: string;
  bodyPlain?: string;
}): Promise<SubscribersOverview["templates"][number]> {
  const response = await fetch(apiUrl("/api/subscribers/templates"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to save template");
  return json.data;
}

export async function updateEmailTemplateApi(
  id: string,
  payload: { title: string; body?: string; bodyPlain?: string }
): Promise<SubscribersOverview["templates"][number]> {
  const response = await fetch(apiUrl(`/api/subscribers/templates/${id}`), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to update template");
  return json.data;
}

export async function deleteEmailTemplateApi(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/subscribers/templates/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to delete template");
}

export async function subscribeNewsletterApi(
  email: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(apiUrl("/api/subscribers/newsletter"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "Failed to subscribe. Please try again.");
  }
  return { success: true, message: json.message || "You have successfully subscribed" };
}

export async function submitContactFormApi(payload: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch(apiUrl("/api/subscribers/contact"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "Failed to submit the form. Please try again.");
  }
  return {
    success: true,
    message: json.message || "Your form has been submitted successfully",
  };
}

export { DEFAULT_SUBSCRIBERS_OVERVIEW };

export type NewsletterStatus = "SENT" | "PENDING";
export type ContactStatus = "Contact" | "Contacted" | "Converted";

export type EmailSubscriber = {
  id: string;
  srNo: string;
  email: string;
  date: string;
  status: NewsletterStatus;
};

export type ContactEntry = {
  id: string;
  srNo: string;
  name: string;
  email: string;
  message: string;
  date: string;
  status: ContactStatus;
};

export type EmailTemplate = {
  id: string;
  key?: string;
  title: string;
  body: string;
  bodyPlain?: string;
  displayBody?: string;
  subject?: string;
  headerTitle?: string;
  isSystem?: boolean;
  patientEmailType?: string;
  created: string;
  lastUsed: string;
  usedTimes: number;
};

export type SubscribersOverview = {
  subscribers: EmailSubscriber[];
  contacts: ContactEntry[];
  templates: EmailTemplate[];
};

export const DEFAULT_SUBSCRIBERS_OVERVIEW: SubscribersOverview = {
  subscribers: [],
  contacts: [],
  templates: [],
};

export function mergeSubscribersOverview(
  partial: Partial<SubscribersOverview> | undefined
): SubscribersOverview {
  if (!partial) return DEFAULT_SUBSCRIBERS_OVERVIEW;
  return {
    subscribers: partial.subscribers ?? DEFAULT_SUBSCRIBERS_OVERVIEW.subscribers,
    contacts: partial.contacts ?? DEFAULT_SUBSCRIBERS_OVERVIEW.contacts,
    templates: partial.templates ?? DEFAULT_SUBSCRIBERS_OVERVIEW.templates,
  };
}

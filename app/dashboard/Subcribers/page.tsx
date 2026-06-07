"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { getToken, getAdmin } from "@/utils/auth";
import type {
  EmailSubscriber,
  ContactEntry,
  EmailTemplate,
  NewsletterStatus,
  ContactStatus,
} from "@/utils/subscribersData";
import {
  fetchSubscribersOverview,
  deleteNewsletterSubscriber,
  deleteContactSubmission,
  sendSubscriberEmailApi,
  createEmailTemplateApi,
  updateEmailTemplateApi,
  deleteEmailTemplateApi,
} from "@/utils/subscribersApi";
import { templateBodyForDisplay } from "@/utils/templateBodyText";

// ── Types ─────────────────────────────────────────────────────────────────────
type TabType = "email" | "contact";
type ModalType = "none" | "sendEmail" | "templates" | "viewTemplate";
function statusBadge(status: NewsletterStatus) {
  if (status === "SENT") return "text-[#f4f4f4] bg-[#753141] border border-[#753141] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
  return "text-[#753141] bg-[#d3d3d3] border border-[#d3d3d3] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
}

function contactBadge(status: ContactStatus) {
  if (status === "Contact") return "text-[#753141] text-sm font-semibold";
  if (status === "Contacted") return "text-[#4f4f4f] text-sm font-semibold";
  return "text-[#753141] text-sm font-semibold";
}

function contactDot(status: ContactStatus) {
  if (status === "Contact") return "#C94A3A";
  if (status === "Contacted") return "#4f4f4f";
  return "#753141";
}

// ── Envelope SVG (template thumbnail placeholder) ─────────────────────────────
function EnvelopeThumbnail() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#591727" }}>
      <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
        <rect x="4" y="8" width="72" height="52" rx="4" fill="white" fillOpacity="0.15"/>
        <rect x="4" y="8" width="72" height="52" rx="4" stroke="white" strokeOpacity="0.4" strokeWidth="1.5"/>
        {/* Hand holding envelope */}
        <rect x="16" y="18" width="48" height="34" rx="3" fill="white" fillOpacity="0.9"/>
        <path d="M16 18L40 34L64 18" stroke="#591727" strokeWidth="1.5" strokeOpacity="0.5"/>
        {/* Hand */}
        <path d="M30 48C30 48 25 45 23 42C21 39 22 36 25 36C27 36 28 37 28 37C28 37 28 33 31 33C33 33 34 35 34 35C34 35 34 32 37 32C39 32 40 34 40 34L40 44" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
      </svg>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SubscribersPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";

  // Color tokens — from Blogs page
  const card       = isDark ? "#c9a898" : "#f0f0f0";
  const cardInner  = isDark ? "#d0baa3" : "#FFFFFF";
  const text1      = "#591727";
  const text2      = "#591727";
  const brand      = "#591727";
  const borderCol  = "#753141";
  const tableBg    = isDark ? "#c1a694" : "#FDFAF4";
  const inputBg    = isDark ? "#c1a694" : "#ffffff";
  const inputBorder= isDark ? "#5C2A3A" : "#D9C9A8";
  const rowHover   = isDark ? "#d0baa3" : "#F5ECD7";

  // ── State ─────────────────────────────────────────────────────────────────
  const [tab,          setTab]          = useState<TabType>("email");
  const [subscribers,  setSubscribers]  = useState<EmailSubscriber[]>([]);
  const [contacts,     setContacts]     = useState<ContactEntry[]>([]);
  const [templates,    setTemplates]    = useState<EmailTemplate[]>([]);
  const [loadError,    setLoadError]    = useState<string | null>(null);
  const [modal,        setModal]        = useState<ModalType>("none");
  const [sendTarget,   setSendTarget]   = useState<string>("");
  const [sendSubscriberId, setSendSubscriberId] = useState<string | null>(null);
  const [sendContactId, setSendContactId] = useState<string | null>(null);
  const [sendRecipientName, setSendRecipientName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [viewTpl,      setViewTpl]      = useState<EmailTemplate | null>(null);

  // Email search + filter
  const [emailSearch,  setEmailSearch]  = useState("");
  const [emailFilter,  setEmailFilter]  = useState("All");
  const [emailDropOpen,setEmailDropOpen]= useState(false);

  // Contact search + filter
  const [contactSearch, setContactSearch] = useState("");
  const [contactFilter, setContactFilter] = useState("All Statuses");
  const [conDropOpen,   setConDropOpen]   = useState(false);

  // Send Email form
  const [sendTitle, setSendTitle] = useState("");
  const [sendBody,  setSendBody]  = useState("");
  const [sending,   setSending]   = useState(false);

  // New template (Add Another Template)
  const [addTplTitle, setAddTplTitle] = useState("");
  const [addTplBody,  setAddTplBody]  = useState("");
  const [showAddTpl,  setShowAddTpl]  = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    try {
      const data = await fetchSubscribersOverview();
      setSubscribers(data.subscribers);
      setContacts(data.contacts);
      setTemplates(data.templates);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load subscribers data.");
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    const admin = getAdmin();
    if (!token || !admin) {
      router.push("/login");
      return;
    }
    if (!admin?.roleSlug && !admin?.isSuperAdmin) {
      router.push("/unauthorized");
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!cancelled) await loadOverview();
    };

    load();
    const intervalId = window.setInterval(load, 30000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadOverview]);

  // ── Derived lists ─────────────────────────────────────────────────────────
  const filteredSubs = subscribers.filter(s => {
    const matchSearch = s.email.toLowerCase().includes(emailSearch.toLowerCase()) || s.date.includes(emailSearch);
    const matchFilter = emailFilter === "All" || s.status === emailFilter.replace("Newsletter ","").toUpperCase();
    return matchSearch && matchFilter;
  });

  const filteredContacts = contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                        c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
                        c.date.includes(contactSearch);
    const matchFilter = contactFilter === "All Statuses" || c.status === contactFilter;
    return matchSearch && matchFilter;
  });

  // ── Actions ───────────────────────────────────────────────────────────────
  async function deleteSubscriber(id: string) {
    try {
      setActionError(null);
      await deleteNewsletterSubscriber(id);
      await loadOverview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete subscriber.");
    }
  }

  async function deleteContact(id: string) {
    try {
      setActionError(null);
      await deleteContactSubmission(id);
      await loadOverview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete contact.");
    }
  }

  function openSendEmail(
    email: string,
    subscriberId?: string,
    contactId?: string,
    recipientName?: string
  ) {
    setSendTarget(email);
    setSendSubscriberId(subscriberId ?? null);
    setSendContactId(contactId ?? null);
    setSendRecipientName(recipientName ?? "");
    setSelectedTemplateId(null);
    setSendTitle("");
    setSendBody("");
    setActionError(null);
    setModal("sendEmail");
  }

  async function handleSend() {
    if (!sendTitle.trim() || !sendBody.trim()) return;
    setSending(true);
    setActionError(null);
    try {
      await sendSubscriberEmailApi({
        to: sendTarget,
        title: sendTitle.trim(),
        body: sendBody.trim(),
        subscriberId: sendSubscriberId ?? undefined,
        contactId: sendContactId ?? undefined,
        templateId: selectedTemplateId ?? undefined,
        recipientName: sendRecipientName || undefined,
      });
      setModal("none");
      await loadOverview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to send email.");
    } finally {
      setSending(false);
    }
  }

  async function handleSaveTemplate() {
    if (!sendTitle.trim() || !sendBody.trim()) return;
    try {
      setActionError(null);
      await createEmailTemplateApi({ title: sendTitle.trim(), body: sendBody.trim() });
      setModal("none");
      await loadOverview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save template.");
    }
  }

  function selectTemplate(tpl: EmailTemplate) {
    setSendTitle(tpl.subject || tpl.title);
    setSendBody(templateBodyForDisplay(tpl));
    setSelectedTemplateId(tpl.id);
    setModal("sendEmail");
  }

  async function addNewTemplate() {
    if (!addTplTitle.trim() || !addTplBody.trim()) return;
    try {
      setActionError(null);
      await createEmailTemplateApi({ title: addTplTitle.trim(), body: addTplBody.trim() });
      setAddTplTitle("");
      setAddTplBody("");
      setShowAddTpl(false);
      await loadOverview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to add template.");
    }
  }

  async function saveViewTemplate() {
    if (!viewTpl) return;
    try {
      setActionError(null);
      await updateEmailTemplateApi(viewTpl.id, {
        title: viewTpl.title.trim(),
        bodyPlain: viewTpl.body.trim(),
      });
      setModal("none");
      await loadOverview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update template.");
    }
  }

  async function deleteTemplate(tpl: EmailTemplate) {
    if (!window.confirm(`Delete template "${tpl.title}"?`)) return;
    try {
      setActionError(null);
      await deleteEmailTemplateApi(tpl.id);
      if (viewTpl?.id === tpl.id) setModal("none");
      await loadOverview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete template.");
    }
  }

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inp: React.CSSProperties = { backgroundColor: inputBg, borderColor: inputBorder, color: brand };

  // ═════════════════════════════════════════════════════════════════════════
  // ── MODALS ────────────────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════

  // ── Send Email Modal ──────────────────────────────────────────────────────
  function SendEmailModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setModal("none")}/>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: brand }}>Send Email</h2>
            <button onClick={() => setModal("none")} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          {/* Go to Templates */}
          <button
            onClick={() => setModal("templates")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white mb-4 transition-opacity hover:opacity-90"
            style={{ backgroundColor: brand }}
          >
            Go to Templates
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>

          {/* Title */}
          <div className="mb-3">
            <label className="text-[11px] font-bold tracking-widest uppercase mb-1 block" style={{ color: brand }}>
              Title <span style={{ color: brand }}>*</span>
            </label>
            <input
              type="text"
              value={sendTitle}
              onChange={e => setSendTitle(e.target.value)}
              placeholder="Type"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
              style={{ backgroundColor: "#F8F7F5", borderColor: "#D9C9A8", color: brand }}
            />
          </div>

          {/* Body */}
          <div className="mb-5">
            <label className="text-[11px] font-bold tracking-widest uppercase mb-1 block" style={{ color: brand }}>
              Body <span style={{ color: brand }}>*</span>
            </label>
            <textarea
              value={sendBody}
              onChange={e => setSendBody(e.target.value)}
              placeholder="Type"
              rows={5}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
              style={{ backgroundColor: "#F8F7F5", borderColor: "#D9C9A8", color: brand }}
            />
          </div>

          {actionError ? (
            <p className="text-xs mb-3" style={{ color: "#8B1A2E" }} role="alert">{actionError}</p>
          ) : null}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveTemplate}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:opacity-80"
              style={{ borderColor: "#D9C9A8", color: brand, backgroundColor: "#f0f0f0" }}
            >
              Save as Template
            </button>
            <button
              onClick={handleSend}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: brand }}
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Templates Gallery Modal ───────────────────────────────────────────────
  function TemplatesModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setModal("none")}/>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[800px] mx-4 p-6 max-h-[100vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: brand }}>Saved Template</h2>
            <button onClick={() => setModal("none")} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          {/* Add Another Template */}
          <button
            onClick={() => setShowAddTpl(o => !o)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white mb-4 transition-opacity hover:opacity-90"
            style={{ backgroundColor: brand }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Add Another Template
          </button>

          {/* Inline add form */}
          {showAddTpl && (
            <div className="mb-4 p-4 rounded-xl border" style={{ borderColor: "#591727", backgroundColor: "#F8F7F5" }}>
              <input
                type="text"
                value={addTplTitle}
                onChange={e => setAddTplTitle(e.target.value)}
                placeholder="Template title…"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border mb-2"
                style={{ borderColor: "#591727", color: brand, backgroundColor: "#fff" }}
              />
              <textarea
                value={addTplBody}
                onChange={e => setAddTplBody(e.target.value)}
                placeholder="Template body…"
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border resize-none mb-2"
                style={{ borderColor: "#591727", color: brand, backgroundColor: "#fff" }}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddTpl(false)} className="px-4 py-1.5 text-sm border rounded-lg" style={{ borderColor:"#591727", color: brand }}>Cancel</button>
                <button onClick={addNewTemplate} className="px-4 py-1.5 text-sm rounded-lg text-white" style={{ backgroundColor: brand }}>Add</button>
              </div>
            </div>
          )}

          {/* Template grid — 3 columns on desktop, 1 on mobile, 2 on sm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {templates.map(tpl => (
              <div key={tpl.id} className="flex flex-col rounded-xl overflow-hidden border transition-opacity hover:opacity-95"
                style={{ borderColor: "#D9C9A8" }}>
                <div style={{ height: 120, position: "relative" }}>
                  <EnvelopeThumbnail/>
                </div>
                <div className="px-3 py-2" style={{ backgroundColor: "#F8F7F5" }}>
                  <div className="flex items-center gap-2 mb-1 min-h-[28px]">
                    <button
                      type="button"
                      onClick={() => void deleteTemplate(tpl)}
                      title="Delete template"
                      className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg transition-colors hover:bg-red-100"
                      style={{ color: brand }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                    <span className="text-[14px] font-semibold truncate flex-1 min-w-0" style={{ color: brand }}>{tpl.title}</span>
                    <button
                      type="button"
                      onClick={() => { setViewTpl({ ...tpl, body: templateBodyForDisplay(tpl) }); setModal("viewTemplate"); }}
                      title="Edit template"
                      className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg hover:bg-[#F5ECD7] transition-colors"
                      style={{ color: brand }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[12px] min-w-0" style={{ color: "#7A6040" }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span className="truncate">Created: {tpl.created} · Last Used: {tpl.lastUsed}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectTemplate(tpl)}
                      title="Use template"
                      className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg hover:bg-[#F5ECD7] transition-colors"
                      style={{ color: brand }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── View / Edit Template Modal ────────────────────────────────────────────
  function ViewTemplateModal() {
    if (!viewTpl) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setModal("none")}/>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: brand }}>Saved Template</h2>
            <button onClick={() => setModal("none")} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          {/* Title */}
          <div className="mb-3">
            <label className="text-[11px] font-bold tracking-widest uppercase mb-1 block" style={{ color: brand }}>
              Title <span style={{ color: brand }}>*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={viewTpl.title}
                onChange={e => setViewTpl({ ...viewTpl, title: e.target.value })}
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none border"
                style={{ backgroundColor: "#F8F7F5", borderColor: "#D9C9A8", color: brand }}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: brand }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="mb-3">
            <label className="text-[11px] font-bold tracking-widest uppercase mb-1 block" style={{ color: brand }}>
              Body <span style={{ color: brand }}>*</span>
            </label>
            <div className="relative">
              <textarea
                value={viewTpl.body}
                onChange={e => setViewTpl({ ...viewTpl, body: e.target.value })}
                rows={7}
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none border resize-none"
                style={{ backgroundColor: "#F8F7F5", borderColor: "#D9C9A8", color: brand }}
              />
              <button className="absolute right-3 top-3" style={{ color: brand }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 mb-5 text-[10px]" style={{ color: "#7A6040" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Created: {viewTpl.created} &nbsp; Last Used: {viewTpl.lastUsed} &nbsp; Used {viewTpl.usedTimes} times
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setModal("none")}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:opacity-80"
              style={{ borderColor: "#D9C9A8", color: brand, backgroundColor: "#f0f0f0" }}
            >
              Discard Changes
            </button>
            <button
              onClick={saveViewTemplate}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: brand }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ── PAGE RENDER ───────────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="min-h-full ml-10 max-sm:ml-0 max-sm:px-3 transition-colors duration-300"
      style={{ marginTop: 40 }}
      onClick={() => { setEmailDropOpen(false); setConDropOpen(false); }}
    >
      {/* Modals */}
      {modal === "sendEmail"    && <SendEmailModal/>}
      {modal === "templates"    && <TemplatesModal/>}
      {modal === "viewTemplate" && <ViewTemplateModal/>}

      {/* ── Breadcrumb title ─────────────────────────────── */}
      <div className="flex items-center gap-1 mb-5 flex-wrap">
        <h1 className="text-3xl max-sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : brand }}>SUBSCRIBERS/</h1>
        <span className="text-2xl max-sm:text-lg font-bold ml-1" style={{ color: isDark ? "#B09070" : "#894646" }}>
          {tab === "email" ? "Email Subscribers" : "Contact Form"}
        </span>
      </div>

      {(loadError || actionError) && modal === "none" ? (
        <p className="mb-4 text-sm rounded-xl px-4 py-3 border" style={{ color: "#8B1A2E", borderColor: "#753141", backgroundColor: isDark ? "#c9a898" : "#fff5f5" }} role="alert">
          {loadError || actionError}
        </p>
      ) : null}

      {/* ── Tab bar ──────────────────────────────────────── */}
      <div className="flex mb-5" style={{ borderBottom: `1px solid ${borderCol}` }}>
        {[
          { key: "email"   as TabType, label: "Email Subscribers" },
          { key: "contact" as TabType, label: "Contact Form"      },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-6 max-sm:px-3 py-3 text-md max-sm:text-sm font-semibold relative transition-colors"
            style={{ color: tab === t.key ? brand : "#7A6040" }}
          >
            {t.label}
            {tab === t.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: brand }}/>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          EMAIL SUBSCRIBERS TAB
      ════════════════════════════════════════════════════ */}
      {tab === "email" && (
        <>
          {/* Search + filter */}
          <div className="flex gap-3 mb-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-2xl border"
              style={{ backgroundColor: isDark ? "#c9a898" : "#ffffff", borderColor: borderCol }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={text2} strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={emailSearch}
                onChange={e => setEmailSearch(e.target.value)}
                placeholder="Search by email / date subscribed..."
                className="flex-1 text-sm bg-transparent outline-none min-w-0"
                style={{ color: text1 }}
              />
            </div>

            {/* Status dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={e => { e.stopPropagation(); setEmailDropOpen(o => !o); }}
                className="flex items-center gap-2 px-4 max-sm:px-3 py-2.5 rounded-2xl border text-sm whitespace-nowrap"
                style={{ backgroundColor: isDark ? "#c9a898" : "#ffffff", borderColor: borderCol, color: text2 }}
              >
                <span className="max-sm:hidden">{emailFilter}</span>
                <span className="sm:hidden">Filter</span>
                <svg width="10" height="6" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 7L11 1" stroke={text2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {emailDropOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-xl border py-1 min-w-[160px]"
                  style={{ backgroundColor: "#ffffff", borderColor: "#D9C9A8" }}>
                  {["All", "Newsletter Pending", "Newsletter Sent"].map((opt, i, arr) => (
                    <button key={opt} onClick={() => { setEmailFilter(opt); setEmailDropOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F5ECD7] transition-colors"
                      style={{ color: brand, fontWeight: opt === emailFilter ? 700 : 400, borderBottom: i < arr.length-1 ? "1px solid #F0E8DC" : "none" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table — desktop intact, mobile cards */}
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: tableBg, borderColor: borderCol }}>

            {/* Desktop table — hidden on small screens */}
            <table className="w-full text-sm hidden sm:table">
              <thead>
                <tr style={{ borderBottom: `1px solid ${borderCol}`, backgroundColor: isDark ? "#b89a88" : "#F5ECD7" }}>
                  {["Sr. No.", "Email", "Date of subscription", "Monthly Newsletter", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[12px] font-semibold" style={{ color: text2 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map(sub => (
                  <tr
                    key={sub.id}
                    className="transition-colors"
                    style={{ borderBottom: `1px solid ${borderCol}` }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* Sr. No */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold" style={{ color: text2 }}>{sub.srNo}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm" style={{ color: text1 }}>{sub.email}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm" style={{ color: text2 }}>{sub.date}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={statusBadge(sub.status)}>{sub.status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {/* Delete */}
                        <button
                          onClick={() => deleteSubscriber(sub.id)}
                          title="Delete"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors"
                          style={{ color: text2 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                        {/* Send email */}
                        <button
                          onClick={() => openSendEmail(sub.email, sub.id)}
                          title="Send Email"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors"
                          style={{ color: text2 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSubs.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: text2 }}>No subscribers found.</td></tr>
                )}
              </tbody>
            </table>

            {/* Mobile cards — shown only on small screens */}
            <div className="sm:hidden divide-y" style={{ borderColor: borderCol }}>
              {filteredSubs.map(sub => (
                <div
                  key={sub.id}
                  className="px-4 py-3 flex flex-col gap-1"
                  style={{ borderBottom: `1px solid ${borderCol}` }}
                >
                  {/* Row 1: sr no + status + actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: text2 }}>#{sub.srNo}</span>
                    <div className="flex items-center gap-2">
                      <span className={statusBadge(sub.status)}>{sub.status}</span>
                      <button
                        onClick={() => deleteSubscriber(sub.id)}
                        title="Delete"
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors"
                        style={{ color: text2 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => openSendEmail(sub.email, sub.id)}
                        title="Send Email"
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors"
                        style={{ color: text2 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Row 2: email */}
                  <span className="text-sm break-all" style={{ color: text1 }}>{sub.email}</span>
                  {/* Row 3: date */}
                  <span className="text-xs" style={{ color: text2 }}>{sub.date}</span>
                </div>
              ))}
              {filteredSubs.length === 0 && (
                <div className="px-6 py-12 text-center text-sm" style={{ color: text2 }}>No subscribers found.</div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ borderTop: `1px solid ${borderCol}` }}>
              <span className="text-xs" style={{ color: text2 }}>
                Showing 1 to {filteredSubs.length} of {filteredSubs.length} results
              </span>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>‹</button>
                {[1,2,3].map(n => (
                  <button key={n} className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
                    style={{ backgroundColor: n===1 ? brand : "transparent", color: n===1 ? "#F5ECD7" : text2 }}>{n}</button>
                ))}
                <span className="text-xs px-1" style={{ color: text2 }}>...</span>
                <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>71</button>
                <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>›</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════
          CONTACT FORM TAB
      ════════════════════════════════════════════════════ */}
      {tab === "contact" && (
        <>
          {/* Search + filter */}
          <div className="flex gap-3 mb-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-2xl border"
              style={{ backgroundColor: isDark ? "#c9a898" : "#ffffff", borderColor: borderCol }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={text2} strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                placeholder="Search by name / email / date..."
                className="flex-1 text-sm bg-transparent outline-none min-w-0"
                style={{ color: text1 }}
              />
            </div>

            {/* Status dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={e => { e.stopPropagation(); setConDropOpen(o => !o); }}
                className="flex items-center gap-2 px-4 max-sm:px-3 py-2.5 rounded-2xl border text-sm whitespace-nowrap"
                style={{ backgroundColor: isDark ? "#c9a898" : "#ffffff", borderColor: borderCol, color: text2 }}
              >
                <span className="max-sm:hidden">{contactFilter}</span>
                <span className="sm:hidden">Filter</span>
                <svg width="10" height="6" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 7L11 1" stroke={text2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {conDropOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-xl border py-1 min-w-[140px]"
                  style={{ backgroundColor: "#ffffff", borderColor: "#D9C9A8" }}>
                  {["All Statuses", "Contact", "Contacted", "Converted"].map((opt, i, arr) => (
                    <button key={opt} onClick={() => { setContactFilter(opt); setConDropOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F5ECD7] transition-colors"
                      style={{ color: brand, fontWeight: opt === contactFilter ? 700 : 400, borderBottom: i < arr.length-1 ? "1px solid #F0E8DC" : "none" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table — desktop intact, mobile cards */}
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: tableBg, borderColor: borderCol }}>

            {/* Desktop table — hidden on small screens */}
            <table className="w-full text-sm hidden sm:table">
              <thead>
                <tr style={{ borderBottom: `1px solid ${borderCol}` }}>
                  {["Sr.\nNo.", "Name & Email", "Message", "Date", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[12px] font-medium whitespace-pre-line" style={{ color: text2 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(c => (
                  <tr
                    key={c.id}
                    className="transition-colors"
                    style={{ borderBottom: `1px solid ${borderCol}` }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold" style={{ color: text2 }}>{c.srNo}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-sm" style={{ color: text1 }}>{c.name}</div>
                      <div className="text-xs" style={{ color: text2 }}>{c.email}</div>
                    </td>
                    <td className="px-4 py-4 max-w-[200px]">
                      <span className="text-sm" style={{ color: text2 }}>{c.message}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm" style={{ color: text2 }}>{c.date}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: contactDot(c.status) }}/>
                        <span className={contactBadge(c.status)}>{c.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => deleteContact(c.id)}
                          title="Delete"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors"
                          style={{ color: text2 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => openSendEmail(c.email, undefined, c.id, c.name)}
                          title="Send Email"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors"
                          style={{ color: text2 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredContacts.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: text2 }}>No contacts found.</td></tr>
                )}
              </tbody>
            </table>

            {/* Mobile cards — shown only on small screens */}
            <div className="sm:hidden divide-y" style={{ borderColor: borderCol }}>
              {filteredContacts.map(c => (
                <div
                  key={c.id}
                  className="px-4 py-3 flex flex-col gap-1.5"
                  style={{ borderBottom: `1px solid ${borderCol}` }}
                >
                  {/* Row 1: sr no + status + actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: text2 }}>#{c.srNo}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: contactDot(c.status) }}/>
                        <span className={`${contactBadge(c.status)} !text-xs`}>{c.status}</span>
                      </div>
                      <button
                        onClick={() => deleteContact(c.id)}
                        title="Delete"
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors"
                        style={{ color: text2 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => openSendEmail(c.email, undefined, c.id, c.name)}
                        title="Send Email"
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors"
                        style={{ color: text2 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Row 2: name + email */}
                  <div>
                    <div className="font-semibold text-sm" style={{ color: text1 }}>{c.name}</div>
                    <div className="text-xs break-all" style={{ color: text2 }}>{c.email}</div>
                  </div>
                  {/* Row 3: message */}
                  <span className="text-xs" style={{ color: text2 }}>{c.message}</span>
                  {/* Row 4: date */}
                  <span className="text-xs" style={{ color: text2 }}>{c.date}</span>
                </div>
              ))}
              {filteredContacts.length === 0 && (
                <div className="px-6 py-12 text-center text-sm" style={{ color: text2 }}>No contacts found.</div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ borderTop: `1px solid ${borderCol}` }}>
              <span className="text-xs" style={{ color: text2 }}>
                Showing 1 to {filteredContacts.length} of {filteredContacts.length} results
              </span>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>‹</button>
                {[1,2,3].map(n => (
                  <button key={n} className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
                    style={{ backgroundColor: n===1 ? brand : "transparent", color: n===1 ? "#F5ECD7" : text2 }}>{n}</button>
                ))}
                <span className="text-xs px-1" style={{ color: text2 }}>...</span>
                <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>71</button>
                <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>›</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

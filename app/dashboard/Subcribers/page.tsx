"use client";

import { useState, useRef, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";

// ── Types ─────────────────────────────────────────────────────────────────────
type TabType = "email" | "contact";
type NewsletterStatus = "SENT" | "PENDING";
type ContactStatus = "Contacted" | "Converted";
type ModalType = "none" | "sendEmail" | "templates" | "viewTemplate";

interface EmailSubscriber {
  id: string;
  srNo: string;
  email: string;
  date: string;
  status: NewsletterStatus;
}

interface ContactEntry {
  id: string;
  srNo: string;
  name: string;
  email: string;
  message: string;
  date: string;
  status: ContactStatus;
}

interface EmailTemplate {
  id: string;
  title: string;
  body: string;
  created: string;
  lastUsed: string;
  usedTimes: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const INITIAL_SUBSCRIBERS: EmailSubscriber[] = [
  { id:"1",  srNo:"01", email:"eleanorvance@gmail.com",    date:"Oct 12, 2023", status:"SENT"    },
  { id:"2",  srNo:"02", email:"eleanorvance@gmail.com",    date:"Oct 12, 2023", status:"PENDING" },
  { id:"3",  srNo:"03", email:"johndoe@example.com",       date:"Oct 13, 2023", status:"SENT"    },
  { id:"4",  srNo:"04", email:"admin@website.org",         date:"Oct 15, 2023", status:"SENT"    },
  { id:"5",  srNo:"05", email:"contact@business.com",      date:"Oct 16, 2023", status:"SENT"    },
  { id:"6",  srNo:"06", email:"mary.jane@domain.com",      date:"Oct 14, 2023", status:"SENT"    },
  { id:"7",  srNo:"07", email:"support@service.com",       date:"Oct 18, 2023", status:"SENT"    },
  { id:"8",  srNo:"08", email:"feedback@platform.net",     date:"Oct 19, 2023", status:"SENT"    },
  { id:"9",  srNo:"09", email:"sales@company.com",         date:"Oct 20, 2023", status:"PENDING" },
  { id:"10", srNo:"10", email:"info@example.com",          date:"Oct 17, 2023", status:"PENDING" },
  { id:"11", srNo:"11", email:"hello@friend.com",          date:"Oct 21, 2023", status:"SENT"    },
  { id:"12", srNo:"12", email:"newsletter@updates.org",    date:"Oct 22, 2023", status:"SENT"    },
];

const INITIAL_CONTACTS: ContactEntry[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  srNo: String(i + 1).padStart(2, "0"),
  name: "Elena Eon",
  email: "eleanorvance@gmail.com",
  message: "Lorem ipsum dolor sit amet consectetur.",
  date: "Oct 12, 2023",
  status: i % 3 === 1 ? "Converted" : "Contacted",
}));

const INITIAL_TEMPLATES: EmailTemplate[] = [
  { id:"1", title:"Book your Appointment Today",  body:"Hi {{first_name}},\n\nHere is what our company can do to your business.\n\n{{Image}}\n\nBest regards,\nThe SMB Axis Team", created:"2026·01·25", lastUsed:"2026·01·25", usedTimes:28 },
  { id:"2", title:"Your Appointment is Due",       body:"Hi {{first_name}},\n\nYour appointment is coming up soon.\n\nBest regards,\nThe SMB Axis Team",                           created:"2026·01·25", lastUsed:"2026·01·25", usedTimes:14 },
  { id:"3", title:"You need a follow up",          body:"Hi {{first_name}},\n\nWe wanted to follow up with you.\n\nBest regards,\nThe SMB Axis Team",                              created:"2026·01·25", lastUsed:"2026·01·25", usedTimes:9  },
  { id:"4", title:"Book your Appointment Today",  body:"Hi {{first_name}},\n\nHere is what our company can do to your business.\n\nBest regards,\nThe SMB Axis Team",             created:"2026·01·25", lastUsed:"2026·01·25", usedTimes:5  },
  { id:"5", title:"Your Appointment is Due",       body:"Hi {{first_name}},\n\nReminder about your appointment.\n\nBest regards,\nThe SMB Axis Team",                              created:"2026·01·25", lastUsed:"2026·01·25", usedTimes:3  },
  { id:"6", title:"You need a follow up",          body:"Hi {{first_name}},\n\nFollowing up from our last conversation.\n\nBest regards,\nThe SMB Axis Team",                      created:"2026·01·25", lastUsed:"2026·01·25", usedTimes:7  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusBadge(status: NewsletterStatus) {
  if (status === "SENT") return "text-[#f4f4f4] bg-[#753141] border border-[#753141] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
  return "text-[#753141] bg-[#d3d3d3] border border-[#d3d3d3] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
}

function contactBadge(status: ContactStatus) {
  if (status === "Contacted") return "text-[#4f4f4f] text-sm font-semibold";
  return "text-[#753141] text-sm font-semibold";
}

function contactDot(status: ContactStatus) {
  return status === "Contacted" ? "#4f4f4f" : "#753141";
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
  const [subscribers,  setSubscribers]  = useState<EmailSubscriber[]>(INITIAL_SUBSCRIBERS);
  const [contacts,     setContacts]     = useState<ContactEntry[]>(INITIAL_CONTACTS);
  const [templates,    setTemplates]    = useState<EmailTemplate[]>(INITIAL_TEMPLATES);
  const [modal,        setModal]        = useState<ModalType>("none");
  const [sendTarget,   setSendTarget]   = useState<string>("");      // email being targeted
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
  function deleteSubscriber(id: string) { setSubscribers(p => p.filter(s => s.id !== id)); }
  function deleteContact(id: string)    { setContacts(p => p.filter(c => c.id !== id)); }

  function openSendEmail(email: string) {
    setSendTarget(email);
    setSendTitle("");
    setSendBody("");
    setModal("sendEmail");
  }

  function handleSend() {
    if (!sendTitle.trim() || !sendBody.trim()) return;
    setSending(true);
    setTimeout(() => {
      // Mark subscriber as SENT if found
      setSubscribers(prev => prev.map(s =>
        s.email === sendTarget ? { ...s, status: "SENT" } : s
      ));
      setSending(false);
      setModal("none");
    }, 800);
  }

  function handleSaveTemplate() {
    if (!sendTitle.trim() || !sendBody.trim()) return;
    const newTpl: EmailTemplate = {
      id: Date.now().toString(),
      title: sendTitle,
      body: sendBody,
      created: new Date().toISOString().slice(0,10).replace(/-/g,"·"),
      lastUsed: new Date().toISOString().slice(0,10).replace(/-/g,"·"),
      usedTimes: 0,
    };
    setTemplates(p => [newTpl, ...p]);
    setModal("none");
  }

  function selectTemplate(tpl: EmailTemplate) {
    setSendTitle(tpl.title);
    setSendBody(tpl.body);
    setModal("sendEmail");
  }

  function addNewTemplate() {
    if (!addTplTitle.trim() || !addTplBody.trim()) return;
    const newTpl: EmailTemplate = {
      id: Date.now().toString(),
      title: addTplTitle,
      body: addTplBody,
      created: new Date().toISOString().slice(0,10).replace(/-/g,"·"),
      lastUsed: new Date().toISOString().slice(0,10).replace(/-/g,"·"),
      usedTimes: 0,
    };
    setTemplates(p => [newTpl, ...p]);
    setAddTplTitle("");
    setAddTplBody("");
    setShowAddTpl(false);
  }

  function saveViewTemplate() {
    if (!viewTpl) return;
    setTemplates(p => p.map(t => t.id === viewTpl.id ? viewTpl : t));
    setModal("none");
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
              <div key={tpl.id} className="flex flex-col rounded-xl overflow-hidden  border cursor-pointer hover:opacity-90 transition-opacity"
                style={{ borderColor: "#D9C9A8" }}>
                {/* Thumbnail */}
                <div style={{ height: 120, position: "relative" }}>
                  <EnvelopeThumbnail/>
                  {/* Arrow link icon */}
                  <button
                    onClick={() => { setViewTpl({ ...tpl }); setModal("viewTemplate"); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-white/80"
                  >
                   <svg
  width="14"
  height="14"
  viewBox="0 0 24 24"
  fill="none"
  stroke={brand}
  strokeWidth="2.5"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M12 20h9" />
  <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
</svg>
                  </button>
                </div>
                {/* Info */}
                <div className="px-2 py-2" style={{ backgroundColor: "#F8F7F5" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-semibold truncate" style={{ color: brand }}>{tpl.title}</span>
                    <button onClick={() => selectTemplate(tpl)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[12px]" style={{ color: "#7A6040" }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span className="truncate">Created: {tpl.created} &nbsp; Last Used: {tpl.lastUsed}</span>
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
                    <td className="px-6 py-4 w-16">
                      <span className="text-sm font-semibold" style={{ color: text2 }}>{sub.srNo}</span>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-4">
                      <span className="text-sm" style={{ color: text1 }}>{sub.email}</span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-4">
                      <span className="text-sm" style={{ color: text2 }}>{sub.date}</span>
                    </td>
                    {/* Status badge */}
                    <td className="px-4 py-4">
                      <span className={statusBadge(sub.status)}>{sub.status}</span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
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
                          onClick={() => openSendEmail(sub.email)}
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
                        onClick={() => openSendEmail(sub.email)}
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

            {/* Table footer labels + pagination */}
            <div
              className="hidden sm:flex items-center justify-between px-6 py-3"
              style={{ borderTop: `1px solid ${borderCol}` }}
            >
              {/* Column labels at bottom — matches Figma */}
              <div className="flex gap-12 text-xs" style={{ color: text2 }}>
                <span>Sr. No.</span>
                <span>Email</span>
                <span className="ml-20">Date of subscription</span>
                <span className="ml-8">Monthly Newsletter</span>
                <span>Actions</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ borderTop: `1px solid ${borderCol}` }}>
              <span className="text-xs" style={{ color: text2 }}>
                Showing 1 to {Math.min(12, filteredSubs.length)} of {filteredSubs.length} results
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
                  {["All Statuses", "Contacted", "Converted"].map((opt, i, arr) => (
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
                          onClick={() => openSendEmail(c.email)}
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
                        onClick={() => openSendEmail(c.email)}
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
                Showing 1 to {Math.min(12, filteredContacts.length)} of {filteredContacts.length} results
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

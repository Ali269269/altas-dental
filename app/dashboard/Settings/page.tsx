"use client";

import { useState, useRef, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, color = "#3DAA7A" }: { checked: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none"
      style={{
        width: 44, height: 24,
        backgroundColor: checked ? color : "rgba(255,255,255,0.25)",
        border: "2px solid rgba(255,255,255,0.3)",
      }}
    >
      <span
        className="inline-block rounded-full bg-white shadow transition-transform duration-200"
        style={{
          width: 18, height: 18,
          transform: checked ? "translateX(20px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

// ── Toggle (light bg variant for Security card) ───────────────────────────────
function ToggleBlue({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none"
      style={{
        width: 44, height: 24,
        backgroundColor: checked ? "#bf1515" : "#D1D5DB",
        border: "none",
      }}
    >
      <span
        className="inline-block rounded-full bg-white shadow transition-transform duration-200"
        style={{
          width: 18, height: 18,
          transform: checked ? "translateX(22px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

// ── Business Hours Edit Modal ─────────────────────────────────────────────────
interface HourEntry { label: string; start: string; end: string; closed: boolean }

function HoursModal({
  entry, onSave, onClose, isDark, brandColor, borderCol,
}: {
  entry: HourEntry;
  onSave: (e: HourEntry) => void;
  onClose: () => void;
  isDark: boolean;
  brandColor: string;
  borderCol: string;
}) {
  const [start,  setStart]  = useState(entry.start);
  const [end,    setEnd]    = useState(entry.end);
  const [closed, setClosed] = useState(entry.closed);
  const inputSt = {
    backgroundColor: isDark ? "#d0baa3" : "#ffffff",
    borderColor: borderCol,
    color: brandColor,
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-2xl p-6 w-80 max-w-[calc(100vw-2rem)] shadow-2xl"
        style={{ backgroundColor: isDark ? "#c9a898" : "#ffffff", border: `1px solid ${borderCol}` }}>
        <h3 className="text-base font-bold mb-4" style={{ color: brandColor }}>{entry.label} Hours</h3>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input type="checkbox" checked={closed} onChange={e => setClosed(e.target.checked)}
            className="w-4 h-4 accent-[#591727]" />
          <span className="text-sm" style={{ color: brandColor }}>Closed</span>
        </label>
        {!closed && (
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: brandColor }}>Open</p>
              <input type="time" value={start} onChange={e => setStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                style={inputSt} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: brandColor }}>Close</p>
              <input type="time" value={end} onChange={e => setEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                style={inputSt} />
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm border font-semibold"
            style={{ borderColor: borderCol, color: brandColor, backgroundColor: "transparent" }}>
            Cancel
          </button>
          <button onClick={() => { onSave({ ...entry, start, end, closed }); onClose(); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: brandColor }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Change Password Modal ─────────────────────────────────────────────────────
function ChangePasswordModal({
  onClose, isDark, brandColor, borderCol,
}: {
  onClose: () => void;
  isDark: boolean;
  brandColor: string;
  borderCol: string;
}) {
  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [saved,    setSaved]    = useState(false);
  const inputSt = { backgroundColor: isDark ? "#d0baa3" : "#ffffff", borderColor: borderCol, color: brandColor };

  const handleSave = () => {
    if (next && next === confirm) { setSaved(true); setTimeout(() => { setSaved(false); onClose(); }, 1200); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-2xl p-6 w-96 max-w-[calc(100vw-2rem)] shadow-2xl"
        style={{ backgroundColor: isDark ? "#c9a898" : "#ffffff", border: `1px solid ${borderCol}` }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: brandColor }}>Change Password</h3>
          <button onClick={onClose} className="text-lg font-bold" style={{ color: brandColor }}>×</button>
        </div>
        {[
          { label: "Current Password",  val: current,  set: setCurrent },
          { label: "New Password",      val: next,     set: setNext    },
          { label: "Confirm Password",  val: confirm,  set: setConfirm },
        ].map(f => (
          <div key={f.label} className="mb-4">
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: brandColor }}>{f.label}</p>
            <input type="password" value={f.val} onChange={e => f.set(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none"
              style={inputSt} />
          </div>
        ))}
        {next && confirm && next !== confirm && (
          <p className="text-xs text-red-500 mb-3">Passwords do not match.</p>
        )}
        <div className="flex gap-3 justify-end mt-2">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm border font-semibold"
            style={{ borderColor: borderCol, color: brandColor }}>
            Cancel
          </button>
          <button onClick={handleSave}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: brandColor }}>
            {saved ? "Saved ✓" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // ── Color tokens (same as BlogsPage) ──────────────────────────────────────
  const brandColor  = "#591727";
  const borderCol   = "#8e8787";
  const cardBg      = isDark ? "#c9a898" : "#ffffff";
  const cardInnerBg = isDark ? "#d0baa3" : "#f7f4ef";
  const pageBg      = isDark ? "#2A0D18"  : "#f0ece4";
  const inputBg     = isDark ? "#d0baa3"  : "#f5f2ec";
  const text1       = brandColor;
  const text2       = isDark ? "#591727"  : "#7a6060";
  const labelColor  = isDark ? "#591727"  : "#9a7070";

  // ── Profile state ─────────────────────────────────────────────────────────
  const [fullName,    setFullName]    = useState("Dr. Ghita Ouazzani Tnacheri");
  const [profTitle,   setProfTitle]   = useState("General Dentist");
  const [email,       setEmail]       = useState("contact@atlasdentalcenter.com");
  const [phone,       setPhone]       = useState("+1 (555) 012-3456");
  const [photoUrl,    setPhotoUrl]    = useState<string>("/images/admin-avatar.jpg");
  const [profileSaved, setProfileSaved] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  // ── Security state ────────────────────────────────────────────────────────
  const [twoFactor,   setTwoFactor]   = useState(true);
  const [showPwModal, setShowPwModal] = useState(false);

  // ── Alert Preferences ────────────────────────────────────────────────────
  const [alertSMS,        setAlertSMS]        = useState(true);
  const [alertReports,    setAlertReports]    = useState(true);
  const [alertMarketing,  setAlertMarketing]  = useState(false);

  // ── Clinic Preferences ───────────────────────────────────────────────────
  const [clinicName,    setClinicName]    = useState("Atlas Dental Center");
  const [primaryContact,setPrimaryContact]= useState("05 37 77 77 79 · 06 68 20 10 10");
  const [address,       setAddress]       = useState("Ang Av Atlas, 61 rue Oued Oum Errabi n. 5, 2ème étage, Agdal - RABAT");
  const [clinicSaved,   setClinicSaved]   = useState(false);

  // ── Business Hours ────────────────────────────────────────────────────────
  const [hours, setHours] = useState<HourEntry[]>([
    { label: "Mon - Fri", start: "08:00", end: "18:00", closed: false },
    { label: "Saturday",  start: "09:00", end: "14:00", closed: false },
    { label: "Sunday",    start: "00:00", end: "00:00", closed: true  },
  ]);
  const [editingHour, setEditingHour] = useState<number | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoUrl(URL.createObjectURL(file));
  }, []);

  const handleProfileSave = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleClinicSave = () => {
    setClinicSaved(true);
    setTimeout(() => setClinicSaved(false), 2000);
  };

  const updateHour = (idx: number, entry: HourEntry) => {
    setHours(prev => prev.map((h, i) => i === idx ? entry : h));
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    backgroundColor: cardBg,
    borderRadius: 16,
    border: `1px solid ${isDark ? "#753141" : "#591727"}`,
    padding: "28px 28px",
    marginBottom: 20,
  };
  const inputSt: React.CSSProperties = {
    backgroundColor: inputBg,
    borderColor: isDark ? borderCol : "#8e8787",
    color: text1,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 12,
    padding: "11px 16px",
    fontSize: 14,
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };
  const lbl = "text-[10px] font-bold tracking-widest uppercase mb-2 block";
  const lblSt: React.CSSProperties = { color: labelColor };

  return (
    <div className="min-h-full ml-10 max-sm:ml-0 max-sm:px-3 transition-colors duration-300" style={{ marginTop: 40, background: "transparent" }}>

      {/* Modals */}
      {showPwModal && (
        <ChangePasswordModal
          onClose={() => setShowPwModal(false)}
          isDark={isDark} brandColor={brandColor} borderCol={borderCol}
        />
      )}
      {editingHour !== null && (
        <HoursModal
          entry={hours[editingHour]}
          onSave={e => updateHour(editingHour, e)}
          onClose={() => setEditingHour(null)}
          isDark={isDark} brandColor={brandColor} borderCol={borderCol}
        />
      )}

      {/* ── PAGE TITLE ── */}
      <h1
        className="mb-6"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 28, fontWeight: 700,
          color: isDark ? "#FFFFFF" : "#591727",
          letterSpacing: "0.03em",
        }}
      >
        Settings
      </h1>

      {/* ── TWO-COLUMN LAYOUT on desktop, single column on mobile ── */}
      <div className="flex gap-5 items-start max-sm:flex-col">

        {/* ══ LEFT COLUMN ══════════════════════════════════════════════════ */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>

          {/* ── PROFILE MANAGEMENT CARD ── */}
          <div style={card}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold mb-1" style={{ color: text1, fontFamily: "'Cormorant Garamond', serif" }}>
                  Profile Management
                </h2>
                <p className="text-sm" style={{ color: text2 }}>
                  Update your professional identity and contact details.
                </p>
              </div>
              <button
                onClick={handleProfileSave}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
                style={{ backgroundColor: brandColor, minWidth: 90 }}
              >
                {profileSaved ? "Saved ✓" : "Save"}
              </button>
            </div>

            {/* 2-col inputs on desktop, 1-col on mobile */}
            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 mb-4">
              <div>
                <span className={lbl} style={lblSt}>Full Name</span>
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Dr. Ghita Ouazzani Tnacheri" style={inputSt} />
              </div>
              <div>
                <span className={lbl} style={lblSt}>Professional Title</span>
                <input value={profTitle} onChange={e => setProfTitle(e.target.value)}
                  placeholder="General Dentist" style={inputSt} />
              </div>
              <div>
                <span className={lbl} style={lblSt}>Email Address</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="contact@atlasdentalcenter.com" style={inputSt} />
              </div>
              <div>
                <span className={lbl} style={lblSt}>Phone Number</span>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456" style={inputSt} />
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: isDark ? "rgba(89,23,39,0.2)" : "#591727", margin: "20px 0" }} />

            {/* Profile Photo */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0"
                style={{ backgroundColor: isDark ? "#b09a8a" : "#e8ddd4", border: `1px solid ${isDark ? borderCol : "#8e8787"}` }}>
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold"
                    style={{ color: brandColor, opacity: 0.5 }}>
                    {fullName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: text1 }}>Profile Photo</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => photoRef.current?.click()}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors hover:opacity-80"
                    style={{ borderColor: isDark ? borderCol : "#8e8787", color: text1, backgroundColor: "transparent" }}
                  >
                    Upload New
                  </button>
                  <button
                    onClick={() => setPhotoUrl("")}
                    className="text-sm transition-opacity hover:opacity-60"
                    style={{ color: text2 }}
                  >
                    Remove
                  </button>
                  <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>
              </div>
            </div>
          </div>

          {/* ── CLINIC PREFERENCES CARD ── */}
          <div style={card}>
            <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
              <h2 className="text-xl font-semibold" style={{ color: text1, fontFamily: "'Cormorant Garamond', serif" }}>
                Clinic Preferences
              </h2>
              <button
                onClick={handleClinicSave}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
                style={{ backgroundColor: brandColor }}
              >
                {clinicSaved ? "Saved ✓" : "Save"}
              </button>
            </div>

            {/* 2-col on desktop, 1-col on mobile */}
            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 mb-4">
              <div>
                <span className={lbl} style={lblSt}>Clinic Name</span>
                <input value={clinicName} onChange={e => setClinicName(e.target.value)}
                  placeholder="Atlas Dental Center" style={inputSt} />
              </div>
              <div>
                <span className={lbl} style={lblSt}>Primary Contact</span>
                <input value={primaryContact} onChange={e => setPrimaryContact(e.target.value)}
                  placeholder="05 37 77 77 79" style={inputSt} />
              </div>
            </div>

            <div>
              <span className={lbl} style={lblSt}>Address</span>
              <input value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Ang Av Atlas, 61 rue Oued Oum Errabi..."
                style={{ ...inputSt, width: "100%" }} />
            </div>
          </div>

        </div>

        {/* ══ RIGHT COLUMN — full width on mobile, fixed 320px on desktop ══ */}
        <div className="w-full sm:w-auto" style={{ width: undefined, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* override inline width on desktop only */}
          <style>{`@media (min-width: 640px) { .settings-right-col { width: 320px !important; } }`}</style>
          <div className="settings-right-col flex flex-col gap-5 w-full">

            {/* ── SECURITY CARD ── */}
            <div style={card}>
              {/* Title */}
              <div className="flex items-center gap-2 mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <h3 className="text-base font-bold" style={{ color: text1 }}>Security</h3>
              </div>

              {/* Change Password row */}
              <button
                onClick={() => setShowPwModal(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl mb-3 transition-colors hover:opacity-80 text-left"
                style={{ backgroundColor: cardInnerBg, border: `1px solid ${isDark ? borderCol : "#630808"}` }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: text1 }}>Change Password</p>
                  <p className="text-[11px] mt-0.5" style={{ color: text2 }}>Last changed 3 months ago</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>

              {/* Two-Factor Auth row */}
              <div
                className="flex items-center justify-between p-3.5 rounded-xl"
                style={{ backgroundColor: cardInnerBg, border: `1px solid ${isDark ? borderCol : "#630808"}` }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: text1 }}>Two-Factor Auth</p>
                  <p className="text-[11px] font-bold mt-0.5" style={{ color: twoFactor ? "#d14747" : "#541515" }}>
                    {twoFactor ? "ENABLED" : "DISABLED"}
                  </p>
                </div>
                <ToggleBlue checked={twoFactor} onChange={setTwoFactor} />
              </div>
            </div>

            {/* ── ALERT PREFERENCES CARD ── */}
            <div style={{
              backgroundColor: brandColor,
              borderRadius: 16,
              padding: "24px 24px",
              border: `1px solid ${brandColor}`,
            }}>
              <h3 className="text-base font-bold mb-5" style={{ color: "#f0e6d3" }}>Alert Preferences</h3>

              {[
                { label: "Appointment SMS",  val: alertSMS,       set: setAlertSMS       },
                { label: "Clinic Reports",   val: alertReports,   set: setAlertReports   },
                { label: "Marketing Emails", val: alertMarketing, set: setAlertMarketing },
              ].map((item, i, arr) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm" style={{ color: "#f0e6d3" }}>{item.label}</span>
                    <Toggle checked={item.val} onChange={item.set} color="#bf1515" />
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ height: 1, background: "rgba(240,230,211,0.15)" }} />
                  )}
                </div>
              ))}
            </div>

            {/* ── BUSINESS HOURS CARD ── */}
            <div style={card}>
              <div className="flex items-center gap-2 mb-5">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <h3 className="text-base font-bold" style={{ color: text1 }}>Business Hours</h3>
              </div>

              <div className="flex flex-col gap-1">
                {hours.map((h, i) => (
                  <div key={h.label}
                    className="flex items-center justify-between py-2.5 rounded-lg px-1"
                    style={{ borderBottom: i < hours.length - 1 ? `1px solid ${isDark ? "rgba(89,23,39,0.2)" : "#ece4da"}` : "none" }}
                  >
                    <span className="text-sm font-medium" style={{ color: h.closed ? text2 : text1 }}>{h.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: h.closed ? text2 : text1 }}>
                        {h.closed ? "Closed" : `${h.start} – ${h.end}`}
                      </span>
                      <button
                        onClick={() => setEditingHour(i)}
                        className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:opacity-70"
                        style={{ color: text2 }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

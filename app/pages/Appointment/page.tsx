"use client";

import { useState, useRef, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const SPECIALITIES = [
  "Dentisterie Esthétique",
  "Réhabilitation totale du sourire",
  "Implantologie",
  "Orthodontie",
  "Aligneurs",
  "Parodontologie",
  "Endodontie",
  "Chirurgie orale",
  "Pédodontie",
  "Prothèse dentaire",
];

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ChevDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
);
const ChevLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
);
const ChevRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.28-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IGIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const YTIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
const TTIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
  </svg>
);

// ─── Calendar Popup ───────────────────────────────────────────────────────────
function CalendarPopup({
  selected, onSelect, onClose,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const [view, setView] = useState(selected ?? today);
  const year = view.getFullYear();
  const month = view.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay === 0 ? 6 : firstDay - 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => setView(new Date(year, month - 1, 1));
  const nextMonth = () => setView(new Date(year, month + 1, 1));

  const isSelected = (d: number) =>
    selected?.getFullYear() === year &&
    selected?.getMonth() === month &&
    selected?.getDate() === d;

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 100,
        background: "#541524",
        borderRadius: 16,
        padding: "20px 18px",
        width: 300,
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ color: "#a68698", fontSize: 15, fontWeight: 500 }}>
          {MONTHS[month]} {year}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={prevMonth} style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer", padding: 4 }}><ChevLeft /></button>
          <button onClick={nextMonth} style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer", padding: 4 }}><ChevRight /></button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 8 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500, padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px 0" }}>
        {cells.map((d, i) => (
          <div
            key={i}
            onClick={() => d && onSelect(new Date(year, month, d))}
            style={{
              textAlign: "center",
              padding: "6px 0",
              fontSize: 13,
              cursor: d ? "pointer" : "default",
              color: d ? "rgba(255,255,255,0.6)" : "transparent",
              background: isSelected(d!) ? "#7B2D3E" : "transparent",
              borderRadius: "50%",
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              transition: "background 0.15s",
            }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Drum Column ─────────────────────────────────────────────────────────────
function DrumColumn({
  items,
  selectedIndex,
  onSelect,
  width = 70,
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  width?: number;
}) {
  const ITEM_H = 48;
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isScrolling.current) return;
    el.scrollTop = selectedIndex * ITEM_H;
  }, [selectedIndex]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    isScrolling.current = true;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (clamped !== selectedIndex) onSelect(clamped);
    clearTimeout((handleScroll as any)._t);
    (handleScroll as any)._t = setTimeout(() => { isScrolling.current = false; }, 150);
  };

  return (
    <div style={{ position: "relative", width, flexShrink: 0, height: ITEM_H * 3, background: "#541524" }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: ITEM_H,
        background: "", zIndex: 2, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: ITEM_H,
        background: "", zIndex: 2, pointerEvents: "none",
      }} />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: ITEM_H * 3,
          overflowY: "scroll",
          background: "#541524",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          paddingTop: ITEM_H,
          paddingBottom: ITEM_H,
          boxSizing: "content-box",
        }}
      >
        {items.map((val, i) => {
          const isSelected = i === selectedIndex;
          const isAdjacent = Math.abs(i - selectedIndex) === 1;
          return (
            <div
              key={val + i}
              onClick={() => onSelect(i)}
              style={{
                height: ITEM_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scrollSnapAlign: "center",
                cursor: "pointer",
                color: isSelected
                  ? "rgba(255,255,255,0.6)"
                  : isAdjacent
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(201,169,110,0.20)",
                fontSize: isSelected ? 19 : 16,
                fontWeight: 500,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: isSelected ? "0.5px" : "0px",
                transition: "color 0.15s, font-size 0.15s",
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {val}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Time Picker Popup ────────────────────────────────────────────────────────
function TimePickerPopup({
  hour, minute, period,
  setHour, setMinute, setPeriod,
  onClose,
}: {
  hour: number; minute: number; period: "AM" | "PM";
  setHour: (h: number) => void;
  setMinute: (m: number) => void;
  setPeriod: (p: "AM" | "PM") => void;
  onClose: () => void;
}) {
  const ITEM_H = 48;
  const hourItems   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minItems    = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const periodItems = ["AM", "PM"];
  const hourIdx   = hour - 1;
  const minIdx    = minute;
  const periodIdx = period === "AM" ? 0 : 1;

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 100,
        background: "#541524",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        width: 300,
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute",
        top: ITEM_H,
        left: 16, right: 16,
        height: ITEM_H,
        borderTop: "1px solid rgba(255,255,255,0.22)",
        borderBottom: "1px solid rgba(255,255,255,0.22)",
        pointerEvents: "none",
        zIndex: 10,
      }} />
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 8px",
      }}>
        <DrumColumn items={hourItems} selectedIndex={hourIdx} onSelect={i => setHour(i + 1)} width={72} />
        <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 600, width: 18, textAlign: "center", flexShrink: 0, paddingBottom: 2 }}>:</div>
        <DrumColumn items={minItems} selectedIndex={minIdx} onSelect={i => setMinute(i)} width={72} />
        <div style={{ width: 12, flexShrink: 0 }} />
        <DrumColumn items={periodItems} selectedIndex={periodIdx} onSelect={i => setPeriod(i === 0 ? "AM" : "PM")} width={56} />
      </div>
    </div>
  );
}

// ─── Speciality Dropdown ──────────────────────────────────────────────────────
function SpecialityDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          background: "transparent",
          border: "1px solid #FFFFFF",
          borderRadius: 8,
          padding: "12px 14px",
          color: value ? "#fff" : "rgba(255,255,255,0.5)",
          fontSize: 13.5,
          fontFamily: "'Jost', sans-serif",
          fontWeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span>{value || "Sélectionner la spécialité"}</span>
        <span style={{ color: "rgba(255,255,255,0.6)", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <ChevDown />
        </span>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 3px)",
          left: 0, right: 0,
          zIndex: 100,
          background: "#541524",
          borderRadius: 14,
          overflow: "hidden",
        }}>
          {SPECIALITIES.map((s, i) => (
            <div key={s}>
              <button
                onClick={() => { onChange(s); setOpen(false); }}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "6px 18px",
                  color: "#ada1a7",
                  fontSize: 16.5,
                  fontWeight: 500,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,169,110,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                {s}
              </button>
              {i < SPECIALITIES.length - 1 && (
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "0 18px" }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AppointmentPage() {
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", message: "" });
  const [speciality, setSpeciality] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCal, setShowCal] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [hour, setHour] = useState(6);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<"AM"|"PM">("PM");
  const [sent, setSent] = useState(false);

  const calRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setShowCal(false);
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) setShowTime(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatDate = (d: Date | null) =>
    d ? `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}` : "";

  const formatTime = () =>
    `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")} ${period}`;

  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "1px solid #FFFFFF",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#fff",
    fontSize: 13.5,
    fontFamily: "'Jost', sans-serif",
    fontWeight: 300,
    outline: "none",
    transition: "border-color 0.2s",
  };

  const ContactRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      border: "1px solid #711C31", borderRadius: 10,
      padding: "12px 14px", background: "#fff",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 7,
        background: "rgba(123,45,62,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#7B2D3E", flexShrink: 0,
      }}>{icon}</div>
      <div style={{ fontSize: 14, color: "#591727", lineHeight: 1.6, fontWeight: 300, paddingTop: 2 }}>{children}</div>
    </div>
  );

  return (
    <>
      <style>{`
        /* ══════════════════════════════════════════
           MOBILE RESPONSIVE — max-width: 768px
           Desktop/laptop styles are 100% untouched
        ══════════════════════════════════════════ */

        @media (min-width: 768px) and (max-width: 1024px) {

  /* Make booking section less narrow */
  .appt-booking-section {
    padding: 0 80px 50px !important;
  }

  /* Make card bigger */
  .appt-booking-card {
    padding: 50px 40px 55px !important;
    border-radius: 22px !important;
  }

  /* Increase form width feel */
  .appt-form-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 18px 22px !important;
  }

  /* Optional: slightly bigger divider */
  .appt-divider {
    width: 60% !important;
  }
}

       @media (max-width: 768px) {

  /* ── Page title ── */
  .appt-title-section {
    padding: 120px 20px 24px !important;
  }

  .appt-title-section h1 {
    font-size: 28px !important;
    text-align: center !important;
  }

  /* ── Booking section ── */
  .appt-booking-section {
    padding: 0 20px 40px !important;
  }

  .appt-booking-card {
    padding: 30px 20px 40px !important;
    border-radius: 20px !important;
  }

  .appt-booking-card h2 {
    font-size: 18px !important;
    text-align: center !important;
  }

  .appt-divider {
    width: 100% !important;
  }

  /* ── Form Grid ── */
  .appt-form-grid {
    grid-template-row: 1fr !important;
    gap: 16px !important;
    margin-top: 18px !important;
  }

  /* ── Inputs ── */
  .appt-input,
  .appt-booking-card input,
  .appt-booking-card textarea,
  .appt-booking-card button:not([aria-label]) {
    width: 100% !important;
    box-sizing: border-box !important;
    font-size: 14px !important;
  }

  /* ── Calendar popup ── */
  .appt-booking-card [style*="position: absolute"] {
    width: calc(100vw - 60px) !important;
    max-width: 100% !important;
    left: 0 !important;
  }

  /* ── Contact section ── */
  .appt-contact-section {
    padding: 40px 20px 50px !important;
  }

  .appt-contact-inner {
    flex-direction: column !important;
    align-items: center !important;
    gap: 30px !important;
  }

  .appt-contact-image {
    width: 100% !important;
    height: 260px !important;
    border-radius: 18px !important;
  }

  .appt-contact-info {
    width: 100% !important;
    padding-top: 0 !important;
  }

  .appt-contact-info h2 {
    font-size: 24px !important;
    margin-bottom: 18px !important;
    text-align: center !important;
  }

  .appt-contact-rows {
    max-width: 100% !important;
  }
  .appt-submit-btn {
  width: auto !important;
  min-width: 160px !important;
  padding: 12px 28px !important;
  display: block !important;
  margin: 24px auto 0 !important;
}
}

        @media (max-width: 425px) {

          /* ── Page title ── */
          .appt-title-section {
            padding: 130px 20px 24px !important;
          }
          .appt-title-section h1 {
            font-size: 22px !important;
          }

          /* ── Booking card section ── */
          .appt-booking-section {
            padding: 0 16px 36px !important;
          }
          .appt-booking-card {
            padding: 28px 18px 36px !important;
          }
          .appt-booking-card h2 {
            font-size: 16px !important;
            letter-spacing: 1px !important;
          }
          .appt-divider {
            width: 100% !important;
          }

          /* ── Form grid: 2-col → 1-col ── */
          .appt-form-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            margin-top: 16px !important;
          }

          /* ── All inputs / buttons inside the card ── */
          .appt-input,
          .appt-booking-card input,
          .appt-booking-card textarea,
          .appt-booking-card button:not([aria-label]) {
            width: 100% !important;
            box-sizing: border-box !important;
          }

          /* ── Calendar & time popups: constrain on small screens ── */
          .appt-booking-card [style*="position: absolute"] {
            width: calc(100vw - 64px) !important;
            left: 0 !important;
          }

          /* ── Contact info section ── */
          .appt-contact-section {
            padding: 36px 16px 48px !important;
          }
          .appt-contact-inner {
            flex-direction: column !important;
            gap: 24px !important;
            align-items: center !important;
          }
          .appt-contact-image {
            width: 100% !important;
            height: 220px !important;
            flex-shrink: unset !important;
          }
          .appt-contact-info {
            padding-top: 0 !important;
            width: 100% !important;
          }
          .appt-contact-info h2 {
            font-size: 20px !important;
            margin-bottom: 16px !important;
          }
          .appt-contact-rows {
            max-width: 100% !important;
          }
        }

        @media (max-width: 400px) {
          .appt-booking-card {
            padding: 22px 12px 28px !important;
          }
          .appt-title-section h1 {
            font-size: 18px !important;
          }
        }
      `}</style>

      <main style={{ background: "#f4eee1" }}>

        {/* ── PAGE TITLE ── */}
        <section className="appt-title-section" style={{ textAlign: "center", padding: "146px 80px 36px", background: "#FFFFFF" }}>
          <h1 style={{
            fontSize: 32, fontWeight: 500,
            color: "#711C31", letterSpacing: "0.5px",
          }}>
            Prendre rendez-vous
          </h1>
        </section>

        {/* ── BOOKING CARD ── */}
        <section className="appt-booking-section" style={{ padding: "0 230px 48px", background: "#FFFFFF" }}>
          <div
            className="appt-booking-card"
            style={{
              background: "#711C31",
              borderRadius: 20,
              padding: "44px 52px 52px",
              boxShadow: "inset 0 -40px 60px rgba(0,0,0,0.45)",
            }}
          >
            {/* Card title */}
            <h2 style={{
              fontSize: 22, fontWeight: 500,
              color: "#fff",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: 6,
              paddingBottom: 14,
            }}>
              Réservez votre rendez-vous
            </h2>
            <div
              className="appt-divider"
              style={{
                width: "390px",
                height: "1.5px",
                background: "#FFFFFF",
                margin: "0 auto 50px",
              }}
            />

            {/* 2-column form grid */}
            <div className="appt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginTop: 28 }}>

              {/* LEFT column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input
                  className="appt-input"
                  type="text"
                  placeholder="Votre nom"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  style={inputBase}
                />
                <input
                  className="appt-input"
                  type="email"
                  placeholder="Votre email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputBase}
                />
                <SpecialityDropdown value={speciality} onChange={setSpeciality} />
                <input
                  className="appt-input"
                  type="tel"
                  placeholder="Votre téléphone"
                  value={form.telephone}
                  onChange={e => setForm({ ...form, telephone: e.target.value })}
                  style={inputBase}
                />
              </div>

              {/* RIGHT column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Date picker */}
                <div ref={calRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => { setShowCal(!showCal); setShowTime(false); }}
                    style={{
                      ...inputBase,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      color: selectedDate ? "#fff" : "rgba(255,255,255,0.45)",
                    }}
                  >
                    <span>{selectedDate ? formatDate(selectedDate) : "Sélectionner la date"}</span>
                    <span style={{ color: "#FFFFFF" }}><CalIcon /></span>
                  </button>
                  {showCal && (
                    <CalendarPopup
                      selected={selectedDate}
                      onSelect={d => { setSelectedDate(d); setShowCal(false); }}
                      onClose={() => setShowCal(false)}
                    />
                  )}
                </div>

                {/* Time picker */}
                <div ref={timeRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => { setShowTime(!showTime); setShowCal(false); }}
                    style={{
                      ...inputBase,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    <span style={{ color: "#ada1a7" }}>{formatTime()}</span>
                    <span style={{ color: "rgba(255,255,255,0.6)" }}><ChevDown /></span>
                  </button>
                  {showTime && (
                    <TimePickerPopup
                      hour={hour} minute={minute} period={period}
                      setHour={setHour} setMinute={setMinute} setPeriod={setPeriod}
                      onClose={() => setShowTime(false)}
                    />
                  )}
                </div>

                {/* Message */}
                <textarea
                  className="appt-input"
                  placeholder="Votre message"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  style={{ ...inputBase, resize: "none", flex: 1 }}
                />
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
              <button
                onClick={() => { setSent(true); setTimeout(() => setSent(false), 3000); }}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid rgba(255,255,255,0.55)",
                  color: "#711C31",
                  padding: "13px 52px",
                  borderRadius: 2,
                  fontSize: 14,
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                  transition: "background 0.25s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "F2E5C5")}
                onMouseLeave={e => (e.currentTarget.style.background = "F2E5C5")}
              >
                {sent ? "Envoyé ✓" : "Envoyez"}
              </button>
            </div>
          </div>
        </section>

        {/* ── CONTACT INFO SECTION ── */}
        <section className="appt-contact-section" style={{ background: "#F0F0F0", padding: "46px 280px 64px" }}>
          <div className="appt-contact-inner" style={{ display: "flex", alignItems: "flex-start", gap: 38 }}>

            {/* Left: image */}
            <div
              className="appt-contact-image"
              style={{
                width: 340, height: 360, flexShrink: 0,
                borderRadius: 16, overflow: "hidden",
                background: "linear-gradient(135deg,#c5b8a8,#8a6a5a)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <img src="/images/puzzle.png" alt="Contact"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* Right: contact info */}
            <div className="appt-contact-info" style={{ flex: 1, paddingTop: 8 }}>
              <h2 style={{
                fontSize: 26, fontWeight: 500,
                color: "#711C31", marginBottom: 24,
                letterSpacing: "0.3px",
              }}>
                Prenez contact
              </h2>

              <div className="appt-contact-rows" style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
                <ContactRow icon={<PhoneIcon />}>
                  <div style={{ fontFamily: "var(--font-cinzel)", fontSize: "13px", color: "#591727", fontWeight: 500 }}>05 37 77 77 79</div>
                  <div style={{ fontFamily: "var(--font-cinzel)", fontSize: "13px", color: "#591727", fontWeight: 500 }}>06 68 20 10 10</div>
                </ContactRow>
                <ContactRow icon={<MailIcon />}>
                  contact@atlasdentalcenter.com
                </ContactRow>
                <ContactRow icon={<PinIcon />}>
                  Ang Av Atlas, 61 rue Oued Oum Errabi<br />
                  n. 5, 2ème étage, Agdal - RABAT
                </ContactRow>
              </div>

              {/* Social icons */}
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                {[
                  { icon: <IGIcon />, label: "Instagram" },
                  { icon: <YTIcon />, label: "YouTube" },
                  { icon: <TTIcon />, label: "TikTok" },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    className="social-btn"
                    aria-label={label}
                    style={{
                      width: 38, height: 38, borderRadius: "50%",
                      border: "1.5px solid rgba(123,45,62,0.3)",
                      background: "transparent", color: "#7B2D3E",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

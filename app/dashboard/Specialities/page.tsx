"use client";

import { useState, useRef, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Section2 {
  id: string;
  imageUrl: string;
  subHeading: string;
  description: string;
}

interface Speciality {
  id: string;
  heroImageUrl: string;
  title: string;
  description: string;
  heading1: string;
  image1Url: string;
  description1: string;
  heading2: string;
  image2Url: string;
  sections2: Section2[];
}

type PageView = "form" | "list";

// ── Initial empty form ────────────────────────────────────────────────────────
function emptySpeciality(id: string): Speciality {
  return {
    id,
    heroImageUrl: "",
    title: "",
    description: "",
    heading1: "",
    image1Url: "",
    description1: "",
    heading2: "",
    image2Url: "",
    sections2: [{ id: "s1", imageUrl: "", subHeading: "", description: "" }],
  };
}

// ── Upload Image Block ────────────────────────────────────────────────────────
function UploadBlock({
  value,
  onChange,
  height = 200,
  width = "100%",
  isDark,
}: {
  value: string;
  onChange: (url: string) => void;
  height?: number;
  width?: number | string;
  isDark: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <div
        className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
        style={{
          width,
          height,
          borderColor: "#753141",
          backgroundColor: isDark ? "#d0baa3" : "#f7f4ef",
        }}
        onClick={() => ref.current?.click()}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <div className="flex flex-col items-center gap-2 select-none">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isDark ? "#c9a898" : "#e8e0d5" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#591727" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="text-xs" style={{ color: "#591727", opacity: 0.6 }}>Upload Image</span>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onChange(URL.createObjectURL(f));
        }}
      />
    </>
  );
}

// ── Field label ───────────────────────────────────────────────────────────────
function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#591727" }}>
      {text}{required && <span style={{ color: "#591727" }}> *</span>}
    </p>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
function Field({
  value, onChange, placeholder, isDark, multiline = false, rows = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  const st: React.CSSProperties = {
    backgroundColor: isDark ? "#c9a898" : "#ffffff",
    borderColor: isDark ? "#5C2A3A" : "#7a7072",
    color: "#591727",
  };
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-2xl text-sm outline-none border resize-none"
        style={st}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-2xl text-sm outline-none border"
      style={st}
    />
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SpecialitiesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Color tokens — from Blogs page
  const brand    = "#591727";
  const borderCol = "#753141";
  const text1    = "#591727";
  const text2    = "#591727";
  const tableBg  = isDark ? "#c1a694" : "#FDFAF4";
  const rowHover = isDark ? "#d0baa3" : "#F5ECD7";

  // ── State ─────────────────────────────────────────────────────────────────
  const [view,         setView]         = useState<PageView>("form");
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [form,         setForm]         = useState<Speciality>(emptySpeciality("new"));
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [saved,        setSaved]        = useState(false);
  const [currentSection2Page, setCurrentSection2Page] = useState(0);

  // ── Form helpers ──────────────────────────────────────────────────────────
  function setF<K extends keyof Speciality>(key: K, val: Speciality[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function updateSection2(id: string, key: keyof Section2, val: string) {
    setForm(prev => ({
      ...prev,
      sections2: prev.sections2.map(s => s.id === id ? { ...s, [key]: val } : s),
    }));
  }

  function addSection2() {
    setForm(prev => ({
      ...prev,
      sections2: [...prev.sections2, { id: Date.now().toString(), imageUrl: "", subHeading: "", description: "" }],
    }));
    setCurrentSection2Page(form.sections2.length);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    if (editingId) {
      setSpecialities(prev => prev.map(s => s.id === editingId ? { ...form, id: editingId } : s));
    } else {
      setSpecialities(prev => [{ ...form, id: Date.now().toString() }, ...prev]);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    resetForm();
    setView("list");
  }

  function handleDiscard() {
    resetForm();
    if (specialities.length > 0) setView("list");
  }

  function resetForm() {
    setForm(emptySpeciality("new"));
    setEditingId(null);
    setCurrentSection2Page(0);
  }

  function openEdit(sp: Speciality) {
    setForm({ ...sp });
    setEditingId(sp.id);
    setView("form");
    setCurrentSection2Page(0);
  }

  function deleteSpeciality(id: string) {
    setSpecialities(prev => prev.filter(s => s.id !== id));
  }

  function openAddNew() {
    resetForm();
    setView("form");
  }

  // ── Pagination for Heading-2 sub-sections ────────────────────────────────
  const totalSection2Pages = form.sections2.length;
  const currentSec2 = form.sections2[currentSection2Page] ?? form.sections2[0];

  // ─────────────────────────────────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="min-h-full ml-10 max-sm:ml-0 max-sm:px-3 transition-colors duration-300" style={{ marginTop: 40 }}>
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <h1 className="text-3xl max-sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : brand }}>Specialities</h1>
          <button
            onClick={openAddNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className="max-sm:hidden">Add New Speciality</span>
            <span className="sm:hidden">Add New</span>
          </button>
        </div>

        {specialities.length === 0 ? (
          <div
            className="rounded-2xl border p-16 max-sm:p-8 flex flex-col items-center gap-4"
            style={{ borderColor: borderCol, backgroundColor: isDark ? "#c9a898" : "#f0f0f0" }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? "#d0baa3" : "#E8E0D5" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="3" x2="9" y2="21"/>
                <path d="M14 8l3 4-3 4"/>
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: text2 }}>No specialities yet</p>
            <button
              onClick={openAddNew}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: brand }}
            >
              + Add New Speciality
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: tableBg, borderColor: borderCol }}>

            {/* Desktop table */}
            <table className="w-full text-sm hidden sm:table">
              <thead>
                <tr style={{ borderBottom: `1px solid ${borderCol}` }}>
                  {["Image", "Title", "Description", "Actions"].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[13px] font-medium" style={{ color: text2 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specialities.map(sp => (
                  <tr
                    key={sp.id}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: `1px solid ${borderCol}` }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td className="px-6 py-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: isDark ? "#d0baa3" : "#EDE0C4" }}>
                        {sp.heroImageUrl
                          ? <img src={sp.heroImageUrl} alt="" className="w-full h-full object-cover"/>
                          : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-semibold text-sm" style={{ color: text1 }}>{sp.title}</span>
                    </td>
                    <td className="px-6 py-3 max-w-xs">
                      <span className="text-sm line-clamp-2" style={{ color: text2 }}>{sp.description}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(sp)}
                          title="Edit"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors"
                          style={{ color: text2 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteSpeciality(sp.id)}
                          title="Delete"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors"
                          style={{ color: text2 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y" style={{ borderColor: borderCol }}>
              {specialities.map(sp => (
                <div
                  key={sp.id}
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ borderBottom: `1px solid ${borderCol}` }}
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-11 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: isDark ? "#d0baa3" : "#EDE0C4" }}>
                    {sp.heroImageUrl
                      ? <img src={sp.heroImageUrl} alt="" className="w-full h-full object-cover"/>
                      : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    }
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: text1 }}>{sp.title}</div>
                    <div className="text-xs line-clamp-1 mt-0.5" style={{ color: text2, opacity: 0.8 }}>{sp.description}</div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(sp)}
                      title="Edit"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors"
                      style={{ color: text2 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteSpeciality(sp.id)}
                      title="Delete"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors"
                      style={{ color: text2 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ borderTop: `1px solid ${borderCol}` }}>
              <span className="text-xs" style={{ color: text2 }}>
                Showing 1 to {specialities.length} of {specialities.length} results
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM VIEW — matches Figma exactly
  // ─────────────────────────────────────────────────────────────────────────
  const sectionStyle: React.CSSProperties = {
    backgroundColor: isDark ? "#c9a898" : "#f0f0f0",
    borderColor: borderCol,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 16,
    padding: "20px 24px",
    marginBottom: 16,
  };

  return (
    <div className="min-h-full ml-10 max-sm:ml-0 max-sm:px-3 transition-colors duration-300" style={{ marginTop: 40 }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-3xl max-sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : brand }}>
          Specialities
        </h1>
        <button
          onClick={openAddNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span className="max-sm:hidden">Add New Speciality</span>
          <span className="sm:hidden">Add New</span>
        </button>
      </div>

      {/* ── 1. UPLOAD HERO IMAGE ─────────────────────────────── */}
      <div style={sectionStyle}>
        <FieldLabel text="UPLOAD HERO IMAGE" required />
        <UploadBlock
          value={form.heroImageUrl}
          onChange={v => setF("heroImageUrl", v)}
          height={200}
          width="100%"
          isDark={isDark}
        />
      </div>

      {/* ── 2. TITLE ─────────────────────────────────────────── */}
      <div style={sectionStyle}>
        <FieldLabel text="TITLE" required />
        <Field
          value={form.title}
          onChange={v => setF("title", v)}
          placeholder="Enter Title"
          isDark={isDark}
        />
      </div>

      {/* ── 3. DESCRIPTION ───────────────────────────────────── */}
      <div style={sectionStyle}>
        <FieldLabel text="DESCRIPTION" required />
        <Field
          value={form.description}
          onChange={v => setF("description", v)}
          placeholder="Enter Description"
          isDark={isDark}
          multiline
          rows={6}
        />
      </div>

      {/* ── 4. HEADING 1 ─────────────────────────────────────── */}
      <div style={sectionStyle}>
        <FieldLabel text="HEADING 1" />
        <Field
          value={form.heading1}
          onChange={v => setF("heading1", v)}
          placeholder="Enter Heading"
          isDark={isDark}
        />
      </div>

      {/* ── 5. IMAGE + DESCRIPTION 1 (side by side on desktop, stacked on mobile) */}
      <div style={sectionStyle}>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-5">
          {/* Left: image upload */}
          <div>
            <FieldLabel text="IMAGE" />
            <UploadBlock
              value={form.image1Url}
              onChange={v => setF("image1Url", v)}
              height={230}
              width="100%"
              isDark={isDark}
            />
          </div>
          {/* Right: description 1 */}
          <div>
            <FieldLabel text="DESCRIPTION 1" />
            <Field
              value={form.description1}
              onChange={v => setF("description1", v)}
              placeholder="Enter Description"
              isDark={isDark}
              multiline
              rows={10}
            />
          </div>
        </div>
      </div>

      {/* ── 6. HEADING 2 ─────────────────────────────────────── */}
      <div style={sectionStyle}>
        <FieldLabel text="HEADING 2" />
        <Field
          value={form.heading2}
          onChange={v => setF("heading2", v)}
          placeholder="Enter Heading"
          isDark={isDark}
        />
      </div>

      {/* ── 7. IMAGE 2 + SUB-SECTIONS (side by side on desktop, stacked on mobile) */}
      <div style={sectionStyle}>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-5">
          {/* Left: large image */}
          <div>
            <FieldLabel text="IMAGE" />
            <UploadBlock
              value={form.image2Url}
              onChange={v => setF("image2Url", v)}
              height={280}
              width="100%"
              isDark={isDark}
            />
          </div>

          {/* Right: sub-heading + description for current page */}
          {currentSec2 && (
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel text="SUB-HEADING 1" />
                <Field
                  value={currentSec2.subHeading}
                  onChange={v => updateSection2(currentSec2.id, "subHeading", v)}
                  placeholder="Enter Heading"
                  isDark={isDark}
                />
              </div>
              <div>
                <FieldLabel text="DESCRIPTION 1" />
                <Field
                  value={currentSec2.description}
                  onChange={v => updateSection2(currentSec2.id, "description", v)}
                  placeholder="Enter Description"
                  isDark={isDark}
                  multiline
                  rows={7}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Pagination controls ── */}
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${isDark ? "#5C2A3A" : "#753141"}` }}>
          <button
            onClick={addSection2}
            className="text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: brand }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Sub-section
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSection2Page(p => Math.max(0, p - 1))}
              disabled={currentSection2Page === 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-30"
              style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", color: brand, backgroundColor: isDark ? "#c9a898" : "#ffffff" }}
            >
              ‹
            </button>
            <span className="text-xs" style={{ color: text2 }}>
              {currentSection2Page + 1} / {totalSection2Pages}
            </span>
            <button
              onClick={() => setCurrentSection2Page(p => Math.min(totalSection2Pages - 1, p + 1))}
              disabled={currentSection2Page >= totalSection2Pages - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-30"
              style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", color: brand, backgroundColor: isDark ? "#c9a898" : "#ffffff" }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ── Save / Discard buttons at bottom ─────────────────── */}
      <div className="flex items-center justify-end gap-3 mt-2 mb-10 flex-wrap">
        {specialities.length > 0 && (
          <button
            onClick={handleDiscard}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:opacity-80"
            style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", color: brand, backgroundColor: isDark ? "#c9a898" : "#ffffff" }}
          >
            Discard Changes
          </button>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: saved ? "#3DAA7A" : (isDark ? "#8B1A2E" : brand) }}
        >
          {saved ? "✓ Saved!" : "Save"}
        </button>
      </div>

      {/* ── Saved specialities preview cards ─────────────────── */}
      {specialities.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" style={{ color: isDark ? "#ffffff" : brand }}>
              Saved Specialities ({specialities.length})
            </h2>
            <button
              onClick={() => setView("list")}
              className="text-sm font-semibold hover:opacity-70 transition-opacity"
              style={{ color: brand }}
            >
              View All →
            </button>
          </div>
          {/* 3 cols on desktop, 1 on mobile, 2 on sm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {specialities.slice(0, 3).map(sp => (
              <div
                key={sp.id}
                className="rounded-2xl border overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                style={{ borderColor: borderCol, backgroundColor: isDark ? "#c9a898" : "#f0f0f0" }}
                onClick={() => openEdit(sp)}
              >
                <div className="h-32 overflow-hidden" style={{ backgroundColor: isDark ? "#d0baa3" : "#EDE0C4" }}>
                  {sp.heroImageUrl
                    ? <img src={sp.heroImageUrl} alt="" className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.5" opacity="0.4">
                          <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                  }
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold truncate" style={{ color: brand }}>{sp.title || "Untitled"}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: text2, opacity: 0.7 }}>{sp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

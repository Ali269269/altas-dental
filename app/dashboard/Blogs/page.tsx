"use client";

import { useState, useRef, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Blog {
  id: string;
  title: string;
  category: string;
  date: string;
  views: string;
  description: string;
  quote: string;
  imageUrl: string;
  additionalImageUrl: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const CATEGORIES = [
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

const INITIAL_BLOGS: Blog[] = [
  {
    id: "1",
    title: "Artificial Intelligence Beyond Imaginations",
    category: "Implantologie",
    date: "2026/04/18",
    views: "56.2K Viewers",
    description: `<h2>Redéfinir le Soin Dentaire</h2><p>Dans le paysage en constante évolution de la dentisterie moderne, l'accent s'est déplacé au-delà du simple traitement clinique pour englober l'ensemble du parcours du patient.</p><h2>Le Confort au Cœur de l'Innovation</h2><p>Le confort moderne ne se limite pas aux chaises ergonomiques.</p><h3>Outils Intelligents</h3><p>L'usage de l'intelligence artificielle dans le diagnostic permet une détection précoce.</p>`,
    quote: `"Notre mission est de transformer la visite chez le dentiste d'une nécessité redoutée en une expérience de bien-être revitalisante."`,
    imageUrl: "",
    additionalImageUrl: "",
  },
  { id:"2", title:"The Future of Virtual Reality",       category:"Aligneurs",      date:"2025/11/30", views:"42.7K Viewers", description:"<p>Virtual reality content.</p>",  quote:"", imageUrl:"", additionalImageUrl:"" },
  { id:"3", title:"Sustainable Tech Innovations",        category:"Parodontologie", date:"2024/03/15", views:"30.1K Viewers", description:"<p>Sustainable tech.</p>",          quote:"", imageUrl:"", additionalImageUrl:"" },
  { id:"4", title:"Blockchain: More Than Cryptocurrency",category:"Endodontie",     date:"2025/07/22", views:"25.3K Viewers", description:"<p>Blockchain content.</p>",         quote:"", imageUrl:"", additionalImageUrl:"" },
  { id:"5", title:"The Rise of Quantum Computing",       category:"Implantologie",  date:"2026/01/10", views:"18.6K Viewers", description:"<p>Quantum computing.</p>",          quote:"", imageUrl:"", additionalImageUrl:"" },
  { id:"6", title:"5G Technology and Its Impact",        category:"Orthodontie",    date:"2024/09/05", views:"48.9K Viewers", description:"<p>5G technology.</p>",              quote:"", imageUrl:"", additionalImageUrl:"" },
  { id:"7", title:"The Evolution of E-commerce",        category:"Aligneurs",      date:"2023/12/12", views:"66.4K Viewers", description:"<p>E-commerce content.</p>",         quote:"", imageUrl:"", additionalImageUrl:"" },
  { id:"8", title:"Wearable Tech: The Next Frontier",    category:"Pédodontie",    date:"2025/05/25", views:"34.8K Viewers", description:"<p>Wearable tech.</p>",              quote:"", imageUrl:"", additionalImageUrl:"" },
];

// ── Tooth placeholder ─────────────────────────────────────────────────────────
function ToothPlaceholder({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" />
  );
}

// ── Toolbar actions ───────────────────────────────────────────────────────────
const toolbarActions = [
  { cmd:"bold",                icon:<strong>B</strong>,   title:"Bold"            },
  { cmd:"italic",              icon:<em>I</em>,           title:"Italic"          },
  { cmd:"underline",           icon:<u>U</u>,             title:"Underline"       },
  { cmd:"insertUnorderedList", icon:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ), title:"Bullet List" },
  { cmd:"justifyLeft",   icon:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ), title:"Align Left"   },
  { cmd:"justifyCenter", icon:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ), title:"Align Center" },
  { cmd:"justifyRight",  icon:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ), title:"Align Right"  },
  { cmd:"createLink", icon:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ), title:"Insert Link" },
  { cmd:"insertHorizontalRule", icon:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12"/>
    </svg>
  ), title:"Horizontal Rule" },
];

type PageView = "list" | "addNew" | "detail";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BlogsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const card        = isDark ? "#c9a898" : "#f0f0f0";
  const cardInner   = isDark ? "#d0baa3" : "#FFFFFF";
  const text1       = "#591727";
  const text2       = "#591727";
  const brandColor  = "#591727";
  const borderCol   = "#753141";

  // ── State ─────────────────────────────────────────────────────────────────
  const [view,         setView]         = useState<PageView>("list");
  const [blogs,        setBlogs]        = useState<Blog[]>(INITIAL_BLOGS);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [search,       setSearch]       = useState("");
  const [actionOpen,   setActionOpen]   = useState<string | null>(null);

  const [formTitle,    setFormTitle]    = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formQuote,    setFormQuote]    = useState("");
  const [formImage,    setFormImage]    = useState("");
  const [formAddImage, setFormAddImage] = useState("");
  const [catOpen,      setCatOpen]      = useState(false);
  const [editingId,    setEditingId]    = useState<string | null>(null);

  // ── SEO State ─────────────────────────────────────────────────────────────
  const [seoTitle,       setSeoTitle]       = useState("");
  const [canonicalUrl,   setCanonicalUrl]   = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [focusKeyword,   setFocusKeyword]   = useState("");
  const [seoSlug,        setSeoSlug]        = useState("");
  const [seoSchema,      setSeoSchema]      = useState("");

  const editorRef      = useRef<HTMLDivElement>(null);
  const imageInputRef  = useRef<HTMLInputElement | null>(null);
  const addImgInputRef = useRef<HTMLInputElement | null>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) || b.date.includes(search)
  );

  function openAdd() {
    setEditingId(null);
    setFormTitle(""); setFormCategory(""); setFormQuote("");
    setFormImage(""); setFormAddImage("");
    setSeoTitle(""); setCanonicalUrl(""); setSeoDescription("");
    setFocusKeyword(""); setSeoSlug(""); setSeoSchema("");
    if (editorRef.current) editorRef.current.innerHTML = "";
    setView("addNew");
  }

  function openEdit(blog: Blog) {
    setEditingId(blog.id);
    setFormTitle(blog.title);
    setFormCategory(blog.category);
    setFormQuote(blog.quote);
    setFormImage(blog.imageUrl);
    setFormAddImage(blog.additionalImageUrl);
    if (editorRef.current) editorRef.current.innerHTML = blog.description;
    setSeoTitle(""); setCanonicalUrl(""); setSeoDescription("");
    setFocusKeyword(""); setSeoSlug(""); setSeoSchema("");
    setView("addNew");
    setActionOpen(null);
  }

  function openDetail(blog: Blog) {
    setSelectedBlog(blog);
    setView("detail");
    setActionOpen(null);
  }

  function deleteBlog(id: string) {
    setBlogs(prev => prev.filter(b => b.id !== id));
    setActionOpen(null);
  }

  function handleSave() {
    const desc = editorRef.current?.innerHTML || "";
    if (!formTitle.trim()) return;
    if (editingId) {
      setBlogs(prev => prev.map(b => b.id === editingId
        ? { ...b, title:formTitle, category:formCategory, quote:formQuote, description:desc, imageUrl:formImage, additionalImageUrl:formAddImage }
        : b
      ));
    } else {
      setBlogs(prev => [{
        id: Date.now().toString(),
        title: formTitle, category: formCategory, quote: formQuote, description: desc,
        date: new Date().toISOString().slice(0,10).replace(/-/g,"/"),
        views: "0 Viewers", imageUrl: formImage, additionalImageUrl: formAddImage,
      }, ...prev]);
    }
    setView("list");
  }

  function execFormat(cmd: string) {
    if (cmd === "createLink") {
      const url = window.prompt("Enter URL:");
      if (url) document.execCommand(cmd, false, url);
    } else {
      document.execCommand(cmd, false, undefined);
    }
    editorRef.current?.focus();
  }

  const handleImageFile = useCallback((e: React.ChangeEvent<HTMLInputElement>, setter: (v:string)=>void) => {
    const file = e.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  }, []);

  // ── Shared card wrapper ───────────────────────────────────────────────────
  const sectionCard: React.CSSProperties = {
    backgroundColor: isDark ? "#c9a898" : "#f0f0f0",
    borderColor: "#753141",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 16,
    padding: "20px 20px 20px",
    marginBottom: 16,
  };
  const lbl   = "text-[12px] font-bold numeric-font mb-2 block";
  const lblSt: React.CSSProperties = { color: brandColor };
  const req   = <span style={{ color: brandColor }}>*</span>;

  const inputSt: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderColor: "#703e3e",
    color: brandColor,
  };

  // ── IMAGE UPLOAD BLOCK ────────────────────────────────────────────────────
  function ImageUploadBlock({
    label, value, inputRef, onChange,
  }: {
    label: string;
    value: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div className="bl-img-card" style={{
          ...sectionCard,
          display: "inline-block",
          marginBottom: 0,
        }}>
          <span className={lbl} style={lblSt}>{label}</span>
          <div
            className="bl-img-box rounded-xl overflow-hidden cursor-pointer flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ backgroundColor: isDark ? "#d0baa3" : "#e8e0d5" }}
            onClick={() => inputRef.current?.click()}
          >
            {value ? (
              <img src={value} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 select-none">
                <ToothPlaceholder size={6} />
                <span style={{ fontSize: 11, color: brandColor, opacity: 0.6 }}>Click to upload</span>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "detail" && selectedBlog) {
    return (
      <>
        <style>{`
          .bl-page { margin-left: 40px; margin-top: 40px; }
          @media (max-width: 768px) {
            .bl-page { margin-left: 0 !important; margin-top: 16px !important; padding: 0 4px !important; }
          }
        `}</style>
        <div className="bl-page min-h-full transition-colors duration-300">
          <div className="flex items-center gap-2 mb-16">
            <button onClick={() => setView("list")} className="text-2xl font-bold hover:opacity-70" style={{ color: isDark ? "#ffffff" : brandColor }}>BLOGS/</button>
            <span className="text-2xl font-bold" style={{ color: isDark ? "#B09070" : "#7c3d3d" }}>Blog Detail</span>
          </div>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-center uppercase mb-6" style={{ color: isDark ? "#6b5858" : "#" }}>{selectedBlog.title}</h1>
            <div className="flex justify-center numeric-font gap-2 mb-3 text-sm" style={{ color: isDark ? "#6b5858" : "#" }}>
              <span>{selectedBlog.category}</span><span>•</span><span>{selectedBlog.date.replace(/\//g," ")}</span>
            </div>
            <div className="w-full h-84 rounded-2xl mb-20 overflow-hidden flex items-center justify-center" style={{ backgroundColor: isDark ? "#d0baa3" : "#EDE0C4" }}>
              {selectedBlog.imageUrl ? <img src={selectedBlog.imageUrl} className="w-full h-full object-cover" /> : <ToothPlaceholder size={10} />}
            </div>
            <div className="mb-12 text-md" style={{ color: isDark ? "#d3d3d3" : "#471616" }} dangerouslySetInnerHTML={{ __html: selectedBlog.description }} />
            {selectedBlog.quote && (
              <div className="border-l-4 px-6 py-4 mb-6 rounded-r-xl" style={{ borderColor: brandColor, backgroundColor: isDark ? "#d0baa3" : "#F5ECD7" }}>
                <p className="text-md" style={{ color: text1 }}>{selectedBlog.quote}</p>
              </div>
            )}
            {selectedBlog.additionalImageUrl && (
              <div className="mb-6">
                <div className="w-64 h-48 rounded-2xl overflow-hidden">
                  <img src={selectedBlog.additionalImageUrl} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ADD / EDIT VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "addNew") {
    return (
      <>
        <style>{`
          .bl-page { margin-left: 40px; margin-top: 40px; }
          .bl-img-card { width: 340px; }
          .bl-img-box  { width: 300px; height: 170px; }
          .bl-cat-btn  { width: 290px; }
          @media (max-width: 768px) {
            .bl-page     { margin-left: 0 !important; margin-top: 16px !important; padding: 0 4px !important; }
            .bl-img-card { width: 100% !important; box-sizing: border-box; }
            .bl-img-box  { width: 100% !important; height: 180px !important; }
            .bl-cat-btn  { width: 100% !important; }
            .bl-header   { flex-direction: column; align-items: flex-start !important; gap: 12px; }
            .bl-header-btns { width: 100%; display: flex; gap: 8px; }
            .bl-header-btns button { flex: 1; }
          }
        `}</style>

        <div className="bl-page min-h-full transition-colors duration-300">

          {/* Breadcrumb + action buttons */}
          <div className="bl-header flex items-center justify-between mb-6">
            <div className="flex items-center gap-1">
              <button onClick={() => setView("list")} className="text-2xl font-bold hover:opacity-70 transition-opacity" style={{ color: isDark ? "#ffffff" : brandColor }}>
                BLOGS/
              </button>
              <span className="text-2xl font-bold ml-1" style={{ color: isDark ? "#B09070" : "#823d4d" }}>
                {editingId ? "Edit Blog" : "Add New Blog"}
              </span>
            </div>
            <div className="bl-header-btns flex gap-3">
              <button
                onClick={() => setView("list")}
                className="px-5 py-2 rounded-xl text-sm font-semibold border transition-colors hover:opacity-80"
                style={{ borderColor: "#000000", color: brandColor, backgroundColor: isDark ? "#c9a898" : "#ffffff" }}
              >
                Discard Changes
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: brandColor }}
              >
                Save
              </button>
            </div>
          </div>

          {/* ── 1. UPLOAD IMAGE ── */}
          <ImageUploadBlock
            label="UPLOAD IMAGE *"
            value={formImage}
            inputRef={imageInputRef}
            onChange={e => handleImageFile(e, setFormImage)}
          />

          {/* ── 2. CATEGORY ── */}
          <div style={{ marginBottom: 16 }}>
            <div className="bl-img-card" style={{ ...sectionCard, marginBottom: 0 }}>
              <span className={lbl} style={lblSt}>SELECT CATEGORY {req}</span>
              <div className="relative bl-cat-btn">
                <button
                  onClick={() => setCatOpen(o => !o)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border text-left flex items-center justify-between"
                  style={{ backgroundColor: "#ffffff", borderColor: "#753141", color: formCategory ? brandColor : "#9CA3AF" }}
                >
                  <span className="truncate pr-1">{formCategory || "Enter Title"}</span>
                  <svg width="11" height="7" viewBox="0 0 12 8" fill="none" style={{ flexShrink: 0, transform: catOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <path d="M1 1L6 7L11 1" stroke={brandColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {catOpen && (
                  <div className="absolute left-0 top-full mt-1 z-50 rounded-xl shadow-xl border py-1 max-h-64 overflow-y-auto"
                    style={{ minWidth: 200, backgroundColor: "#ffffff", borderColor: "#D9C9A8" }}>
                    {CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => { setFormCategory(cat); setCatOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F5ECD7]"
                        style={{ color: brandColor, fontWeight: cat === formCategory ? 700 : 400, borderBottom: "1px solid #F0E8DC" }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── 3. TITLE ── */}
          <div style={sectionCard}>
            <span className={lbl} style={lblSt}>TITLE {req}</span>
            <input
              type="text"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="Enter blog title…"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
              style={inputSt}
            />
          </div>

          {/* ── 4. DESCRIPTION ── */}
          <div style={sectionCard}>
            <span className={lbl} style={lblSt}>DESCRIPTION {req}</span>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="w-full px-4 py-3 text-sm outline-none border rounded-t-xl"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#D9C9A8",
                borderBottomWidth: 0,
                color: brandColor,
                minHeight: 320,
                lineHeight: 1.75,
              }}
              data-placeholder="Write your blog content here…"
            />
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border rounded-b-xl"
              style={{ backgroundColor: isDark ? "#d0baa3" : "#F0EBE3", borderColor: "#D9C9A8", borderTopWidth: 1 }}>
              {toolbarActions.map((action, i) => (
                <button key={i} title={action.title}
                  onMouseDown={e => { e.preventDefault(); execFormat(action.cmd); }}
                  className="w-8 h-7 flex items-center justify-center rounded text-sm font-semibold transition-colors hover:bg-black/10 select-none"
                  style={{ color: brandColor }}>
                  {action.icon}
                </button>
              ))}
            </div>
          </div>

          {/* ── 5. QUOTE ── */}
          <div style={sectionCard}>
            <span className={lbl} style={lblSt}>QUOTE</span>
            <input
              type="text"
              value={formQuote}
              onChange={e => setFormQuote(e.target.value)}
              placeholder="Enter an optional quote…"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
              style={inputSt}
            />
          </div>

          {/* ── 6. ADDITIONAL IMAGE ── */}
          <ImageUploadBlock
            label="ADDITIONAL IMAGE"
            value={formAddImage}
            inputRef={addImgInputRef}
            onChange={e => handleImageFile(e, setFormAddImage)}
          />

          {/* ── 7. SEO SECTION ── */}
          <div style={sectionCard}>
            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: `1px solid ${borderCol}`, paddingBottom: 12 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span className="text-[15px] font-bold numeric-font" style={{ color: brandColor }}>SEO Settings</span>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <span className={lbl} style={lblSt}>SEO TITLE</span>
                <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)}
                  placeholder="Enter SEO title…" className="w-full px-4 py-3 rounded-xl text-sm outline-none border" style={inputSt} />
                <div className="flex justify-end mt-1">
                  <span style={{ fontSize: 10, color: seoTitle.length > 60 ? "#C94A3A" : brandColor, opacity: 0.6 }}>{seoTitle.length}/60</span>
                </div>
              </div>
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <span className={lbl} style={lblSt}>CANONICAL URL</span>
                <input type="url" value={canonicalUrl} onChange={e => setCanonicalUrl(e.target.value)}
                  placeholder="https://example.com/blog/…" className="w-full px-4 py-3 rounded-xl text-sm outline-none border" style={inputSt} />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <span className={lbl} style={lblSt}>FOCUS KEYWORD</span>
                <input type="text" value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)}
                  placeholder="e.g. dental implants paris…" className="w-full px-4 py-3 rounded-xl text-sm outline-none border" style={inputSt} />
              </div>
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <span className={lbl} style={lblSt}>SEO SLUG / URL</span>
                <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: "#753141", backgroundColor: "#ffffff" }}>
                  <span className="px-3 text-xs select-none whitespace-nowrap"
                    style={{ color: brandColor, opacity: 0.45, borderRight: "1px solid #D9C9A8", paddingTop: 12, paddingBottom: 12 }}>
                    /blog/
                  </span>
                  <input type="text" value={seoSlug}
                    onChange={e => setSeoSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                    placeholder="my-blog-post" className="flex-1 px-3 py-3 text-sm outline-none bg-transparent" style={{ color: brandColor }} />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <span className={lbl} style={lblSt}>SEO DESCRIPTION</span>
              <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)}
                placeholder="Enter a concise meta description (recommended 150–160 characters)…"
                rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
                style={{ ...inputSt, lineHeight: 1.7 }} />
              <div className="flex justify-end mt-1">
                <span style={{ fontSize: 10, color: seoDescription.length > 160 ? "#C94A3A" : brandColor, opacity: 0.6 }}>{seoDescription.length}/160</span>
              </div>
            </div>

            <div>
              <span className={lbl} style={lblSt}>SCHEMA</span>
              <textarea value={seoSchema} onChange={e => setSeoSchema(e.target.value)}
                placeholder="Type" rows={6}
                className="w-full h-[60px] px-4 py-1 rounded-xl text-sm outline-none border resize-y font-mono"
                style={{ ...inputSt, lineHeight: 1.65, fontSize: 13 }} />
            </div>
          </div>

          <style>{`
            [contenteditable]:empty:before {
              content: attr(data-placeholder);
              color: #9CA3AF;
              pointer-events: none;
              display: block;
            }
          `}</style>
        </div>
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        .bl-page { margin-left: 40px; margin-top: 40px; }
        .bl-list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .bl-table-wrap { border-radius: 16px; border: 1px solid ${borderCol}; overflow: hidden; background: #f0f0f0; }
        .bl-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .bl-table { width: 100%; font-size: 14px; min-width: 560px; }
        .bl-pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-top: 1px solid ${borderCol}; }
        @media (max-width: 768px) {
          .bl-page { margin-left: 600 !important; margin-top: 16px !important; padding: 0 4px !important; }
          .bl-list-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .bl-list-header button { width: 100%; justify-content: center; }
          .bl-pagination { flex-direction: column; gap: 10px; align-items: flex-start; }
        }
      `}</style>

      <div className="bl-page min-h-full transition-colors duration-300"
        onClick={() => setActionOpen(null)}>

        {/* Header */}
        <div className="bl-list-header">
          <h1 className="text-3xl font-bold" style={{ color: isDark ? "#ffffff" : brandColor }}>Blogs</h1>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: isDark ? "#8B1A2E" : brandColor }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Blogs
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border mb-4"
          style={{ backgroundColor: isDark ? "#c9a898" : "#f0f0f0", borderColor: borderCol }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={text2} strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by Title / date…"
            className="flex-1 text-sm bg-transparent outline-none" style={{ color: text1 }} />
        </div>

        {/* Table */}
        <div className="bl-table-wrap">
          <div className="px-6 py-4 border-b" style={{ borderColor: borderCol }}>
            <span className="text-sm font-semibold" style={{ color: text1 }}>Details</span>
          </div>
          <div className="bl-table-scroll">
            <table className="bl-table">
              <thead>
                <tr style={{ borderBottom: `1px solid ${borderCol}` }}>
                  {["Image","Title","Date","Views","Action"].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[13px] font-medium" style={{ color: text2 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(blog => (
                  <tr key={blog.id} className="transition-colors cursor-pointer"
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? "#d0baa3" : "#F5ECD7")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    onClick={() => openDetail(blog)}>
                    <td className="px-6 py-3" onClick={e => e.stopPropagation()}>
                      <div className="w-16 h-12 rounded-lg overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: isDark ? "#d0baa3" : "#EDE0C4" }}>
                        {blog.imageUrl ? <img src={blog.imageUrl} alt="" className="w-full h-full object-cover"/> : <ToothPlaceholder size={40}/>}
                      </div>
                    </td>
                    <td className="px-6 py-3"><span className="text-sm font-medium" style={{ color: text1 }}>{blog.title}</span></td>
                    <td className="px-6 py-3"><span className="text-sm" style={{ color: text2 }}>{blog.date}</span></td>
                    <td className="px-6 py-3"><span className="text-sm" style={{ color: text2 }}>{blog.views}</span></td>
                    <td className="px-6 py-3 relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => { e.stopPropagation(); setActionOpen(actionOpen === blog.id ? null : blog.id); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-black/10"
                        style={{ color: text2 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                        </svg>
                      </button>
                      {actionOpen === blog.id && (
                        <div className="absolute right-6 z-50 rounded-xl shadow-xl border py-1 min-w-[120px]"
                          style={{ top:"100%", backgroundColor:"#ffffff", borderColor:"#D9C9A8" }}
                          onClick={e => e.stopPropagation()}>
                          {[
                            { label:"Delete", action:()=>deleteBlog(blog.id), color:"#C94A3A" },
                            { label:"Edit",   action:()=>openEdit(blog),      color: brandColor },
                            { label:"View",   action:()=>openDetail(blog),    color: brandColor },
                          ].map((item,i,arr)=>(
                            <button key={item.label} onClick={item.action}
                              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
                              style={{ color:item.color, borderBottom:i<arr.length-1?"1px solid #F0EAE0":"none" }}>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: text2 }}>No blogs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bl-pagination">
            <span className="text-xs" style={{ color: text2 }}>Showing 1 to {Math.min(8,filtered.length)} of {filtered.length} results</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>‹</button>
              {[1,2,3].map(n=>(
                <button key={n} className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
                  style={{ backgroundColor:n===1?brandColor:"transparent", color:n===1?"#F5ECD7":text2 }}>{n}</button>
              ))}
              <span className="text-xs px-1" style={{ color: text2 }}>...</span>
              <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>71</button>
              <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>›</button>
            </div>
          </div>
        </div>

        <style>{`
          .prose h2 { font-size:1.1rem; font-weight:700; margin:1rem 0 .5rem; }
          .prose h3 { font-size:1rem;   font-weight:700; margin:.8rem 0 .4rem; }
          .prose p  { margin:.4rem 0; }
          [contenteditable]:empty:before { content:attr(data-placeholder); color:#9CA3AF; pointer-events:none; display:block; }
        `}</style>
      </div>
    </>
  );
}
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { getToken } from "@/utils/auth";
import { sanitizeRichHtml } from "@/utils/sanitizeHtml";
import {
  type AdminBlog,
  type BlogPagination,
  type BlogStats,
  blogImageUrl,
  createBlog,
  deleteBlogById,
  fetchBlogsOverview,
  updateBlog,
  updateBlogStatus,
  uploadBlogImage,
} from "@/utils/blogsApi";

// ── Types ─────────────────────────────────────────────────────────────────────
type Blog = AdminBlog;

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

const PAGE_SIZE = 8;

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
  const [blogs,        setBlogs]        = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [search,       setSearch]       = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [pagination,   setPagination]   = useState<BlogPagination | null>(null);
  const [stats,        setStats]        = useState<BlogStats | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [actionOpen,   setActionOpen]   = useState<string | null>(null);
  const [actionMenuPos, setActionMenuPos] = useState<{ top: number; left: number } | null>(null);

  const [formTitle,    setFormTitle]    = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formQuote,    setFormQuote]    = useState("");
  const [formAfterQuoteHeading, setFormAfterQuoteHeading] = useState("");
  const [formAfterQuoteText, setFormAfterQuoteText] = useState("");
  const [formConclusion, setFormConclusion] = useState("");
  const [formImage,    setFormImage]    = useState("");
  const [formAddImage, setFormAddImage] = useState("");
  const [formAddImageTitle, setFormAddImageTitle] = useState("");
  const [formAddImageDescription, setFormAddImageDescription] = useState("");
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

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const loadBlogs = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      setError("Authentication required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogsOverview({
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      });
      setBlogs(data.blogs);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    if (view === "list") loadBlogs();
  }, [view, loadBlogs]);

  const pageNumbers = (() => {
    if (!pagination) return [1];
    const { totalPages, page } = pagination;
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
    return [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  })();

  function openAdd() {
    setError(null);
    setEditingId(null);
    setFormTitle(""); setFormCategory(""); setFormQuote("");
    setFormAfterQuoteHeading(""); setFormAfterQuoteText(""); setFormConclusion("");
    setFormImage(""); setFormAddImage("");
    setFormAddImageTitle(""); setFormAddImageDescription("");
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
    setFormAfterQuoteHeading(blog.afterQuoteHeading || "");
    setFormAfterQuoteText(blog.afterQuoteText || "");
    setFormConclusion(blog.conclusion || "");
    setFormImage(blog.imageUrl);
    setFormAddImage(blog.additionalImageUrl);
    setFormAddImageTitle(blog.additionalImageTitle || "");
    setFormAddImageDescription(blog.additionalImageDescription || "");
    if (editorRef.current) editorRef.current.innerHTML = blog.description;
    setSeoTitle(blog.seoTitle);
    setCanonicalUrl(blog.canonicalUrl);
    setSeoDescription(blog.seoDescription);
    setFocusKeyword(blog.focusKeyword);
    setSeoSlug(blog.seoSlug);
    setSeoSchema(blog.seoSchema);
    setView("addNew");
    closeActionMenu();
  }

  function openDetail(blog: Blog) {
    setSelectedBlog(blog);
    setView("detail");
    closeActionMenu();
  }

  function closeActionMenu() {
    setActionOpen(null);
    setActionMenuPos(null);
  }

  function renderBlogBackHeader(subtitle: string, onBack: () => void) {
    return (
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:opacity-80 transition shrink-0"
          style={{ backgroundColor: isDark ? "#8B1A2E" : brandColor, color: "#fff" }}
          title="Go back"
        >
          ←
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="text-xl sm:text-2xl font-bold hover:underline"
            style={{ color: isDark ? "#ffffff" : brandColor }}
          >
            BLOGS
          </button>
          <span className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? "#B09070" : "#823d4d" }}>
            / {subtitle}
          </span>
        </div>
      </div>
    );
  }

  async function deleteBlog(id: string) {
    closeActionMenu();
    try {
      await deleteBlogById(id);
      await loadBlogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete blog");
    }
  }

  async function togglePublish(blog: Blog) {
    closeActionMenu();
    try {
      const nextStatus = blog.status === "published" ? "draft" : "published";
      await updateBlogStatus(blog.id, nextStatus);
      await loadBlogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function handlePublish() {
    const desc = editorRef.current?.innerHTML || "";
    if (!formTitle.trim() || !formCategory.trim()) return;
    if (!formImage.trim()) {
      setError("A cover image is required before publishing");
      return;
    }
    if (!desc.replace(/<[^>]*>/g, "").trim()) {
      setError("Description is required before publishing");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      title: formTitle.trim(),
      category: formCategory,
      description: desc,
      quote: formQuote,
      afterQuoteHeading: formAfterQuoteHeading.trim(),
      afterQuoteText: formAfterQuoteText.trim(),
      conclusion: formConclusion.trim(),
      imageUrl: formImage,
      additionalImageUrl: formAddImage,
      additionalImageTitle: formAddImageTitle.trim(),
      additionalImageDescription: formAddImageDescription.trim(),
      status: "published" as const,
      seoTitle,
      canonicalUrl,
      seoDescription,
      focusKeyword,
      seoSlug,
      seoSchema,
    };
    try {
      if (editingId) {
        await updateBlog(editingId, payload);
      } else {
        await createBlog(payload);
      }
      setView("list");
      await loadBlogs();
      window.alert("Blog has been published.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish blog");
    } finally {
      setSaving(false);
    }
  }

  function isSafeEditorUrl(url: string): boolean {
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:";
    } catch {
      return false;
    }
  }

  function execFormat(cmd: string) {
    if (cmd === "createLink") {
      const url = window.prompt("Enter URL (http, https, or mailto only):");
      if (url && isSafeEditorUrl(url.trim())) {
        document.execCommand(cmd, false, url.trim());
      } else if (url) {
        window.alert("Only http, https, and mailto links are allowed.");
      }
    } else {
      document.execCommand(cmd, false, undefined);
    }
    editorRef.current?.focus();
  }

  const handleImageFile = useCallback(async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError(null);
    try {
      const url = await uploadBlogImage(file);
      setter(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
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
              <img src={blogImageUrl(value)} alt="" className="w-full h-full object-cover" />
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
        <div className="bl-page min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 overflow-x-hidden" style={{ marginTop: "40px" }}>
          {renderBlogBackHeader("Blog Detail", () => setView("list"))}
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-center uppercase mb-6" style={{ color: isDark ? "#6b5858" : "#" }}>{selectedBlog.title}</h1>
            <div className="flex justify-center numeric-font gap-2 mb-3 text-sm" style={{ color: isDark ? "#6b5858" : "#" }}>
              <span>{selectedBlog.category}</span><span>•</span><span>{selectedBlog.date.replace(/\//g," ")}</span>
            </div>
            <div className="w-full h-84 rounded-2xl mb-20 overflow-hidden flex items-center justify-center" style={{ backgroundColor: isDark ? "#d0baa3" : "#EDE0C4" }}>
              {selectedBlog.imageUrl ? <img src={blogImageUrl(selectedBlog.imageUrl)} className="w-full h-full object-cover" /> : <ToothPlaceholder size={10} />}
            </div>
            <div className="mb-12 text-md" style={{ color: isDark ? "#d3d3d3" : "#471616" }} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(selectedBlog.description) }} />
            {selectedBlog.quote && (
              <div className="border-l-4 px-6 py-4 mb-6 rounded-r-xl" style={{ borderColor: brandColor, backgroundColor: isDark ? "#d0baa3" : "#F5ECD7" }}>
                <p className="text-md" style={{ color: text1 }}>{selectedBlog.quote}</p>
              </div>
            )}
            {selectedBlog.afterQuoteHeading && (
              <h2 className="text-lg font-semibold mb-3" style={{ color: text1 }}>{selectedBlog.afterQuoteHeading}</h2>
            )}
            {selectedBlog.afterQuoteText && (
              <p className="mb-6 text-md" style={{ color: isDark ? "#d3d3d3" : "#471616" }}>{selectedBlog.afterQuoteText}</p>
            )}
            {selectedBlog.additionalImageUrl && (
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="w-64 h-48 rounded-2xl overflow-hidden shrink-0">
                  <img src={blogImageUrl(selectedBlog.additionalImageUrl)} className="w-full h-full object-cover" />
                </div>
                {(selectedBlog.additionalImageTitle || selectedBlog.additionalImageDescription) && (
                  <div>
                    {selectedBlog.additionalImageTitle && (
                      <h3 className="text-md font-semibold mb-2" style={{ color: text1 }}>{selectedBlog.additionalImageTitle}</h3>
                    )}
                    {selectedBlog.additionalImageDescription && (
                      <p className="text-md" style={{ color: isDark ? "#d3d3d3" : "#471616" }}>{selectedBlog.additionalImageDescription}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {selectedBlog.conclusion && (
              <p className="text-md" style={{ color: isDark ? "#d3d3d3" : "#471616" }}>{selectedBlog.conclusion}</p>
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
          .bl-img-card { width: 340px; }
          .bl-img-box  { width: 300px; height: 170px; }
          .bl-cat-btn  { width: 290px; }
          @media (max-width: 768px) {
            .bl-img-card { width: 100% !important; box-sizing: border-box; }
            .bl-img-box  { width: 100% !important; height: 180px !important; }
            .bl-cat-btn  { width: 100% !important; }
            .bl-header   { flex-direction: column; align-items: flex-start !important; gap: 12px; }
            .bl-header-btns { width: 100%; display: flex; gap: 8px; }
            .bl-header-btns button { flex: 1; }
          }
        `}</style>

        <div className="bl-page min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 overflow-x-hidden" style={{ marginTop: "40px" }}>

          {error && (
            <p className="text-sm mb-4" style={{ color: "#C94A3A" }}>{error}</p>
          )}

          {renderBlogBackHeader(editingId ? "Edit Blog" : "Add New Blog", () => setView("list"))}

          {/* Action buttons */}
          <div className="bl-header flex items-center justify-end mb-6">
            <div className="bl-header-btns flex gap-3">
              <button
                onClick={() => setView("list")}
                className="px-5 py-2 rounded-xl text-sm font-semibold border transition-colors hover:opacity-80"
                style={{ borderColor: "#000000", color: brandColor, backgroundColor: isDark ? "#c9a898" : "#ffffff" }}
              >
                Discard Changes
              </button>
              <button
                onClick={handlePublish}
                disabled={saving || uploadingImage}
                className="px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: brandColor }}
              >
                {saving ? "Publishing…" : "Publish"}
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

          {/* ── 5b. CONTENT AFTER QUOTE (before additional image) ── */}
          <div style={sectionCard}>
            <span className={lbl} style={lblSt}>SECTION HEADING (AFTER QUOTE)</span>
            <input
              type="text"
              value={formAfterQuoteHeading}
              onChange={e => setFormAfterQuoteHeading(e.target.value)}
              placeholder="e.g. Le Confort au Cœur de l'Innovation…"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border mb-4"
              style={inputSt}
            />
            <span className={lbl} style={lblSt}>SECTION CONTENT (AFTER QUOTE)</span>
            <textarea
              value={formAfterQuoteText}
              onChange={e => setFormAfterQuoteText(e.target.value)}
              placeholder="Paragraph shown below the quote and above the additional image…"
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-y"
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

          {/* ── 6b. ADDITIONAL IMAGE TITLE & DESCRIPTION ── */}
          <div style={sectionCard}>
            <span className={lbl} style={lblSt}>ADDITIONAL IMAGE TITLE</span>
            <input
              type="text"
              value={formAddImageTitle}
              onChange={e => setFormAddImageTitle(e.target.value)}
              placeholder="e.g. Outils Intelligents…"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border mb-4"
              style={inputSt}
            />
            <span className={lbl} style={lblSt}>ADDITIONAL IMAGE DESCRIPTION</span>
            <textarea
              value={formAddImageDescription}
              onChange={e => setFormAddImageDescription(e.target.value)}
              placeholder="Enter the description shown beside the additional image…"
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-y"
              style={inputSt}
            />
          </div>

          {/* ── 6c. CONCLUSION (after additional image) ── */}
          <div style={sectionCard}>
            <span className={lbl} style={lblSt}>CONCLUSION</span>
            <textarea
              value={formConclusion}
              onChange={e => setFormConclusion(e.target.value)}
              placeholder="Final paragraph shown below the additional image section…"
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-y"
              style={inputSt}
            />
          </div>

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
        .bl-table-wrap { border-radius: 16px; border: 1px solid ${borderCol}; overflow: visible; background: #f0f0f0; }
        .bl-table-scroll { overflow-x: auto; overflow-y: visible; -webkit-overflow-scrolling: touch; }
        .bl-action-cell { overflow: visible !important; }
        .bl-table { width: 100%; font-size: 14px; min-width: 560px; }
        .bl-pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-top: 1px solid ${borderCol}; }
        @media (max-width: 768px) {
          .bl-page { margin-left: 0px !important; margin-top: 46px !important; padding: 0 4px !important; }
          .bl-list-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .bl-list-header button { width: 100%; justify-content: center; }
          .bl-pagination { flex-direction: column; gap: 10px; align-items: flex-start; }
        }
      `}</style>

      <div className="bl-page min-h-full transition-colors duration-300"
        onClick={closeActionMenu}>

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
        {error && (
          <p className="text-sm mb-4" style={{ color: "#C94A3A" }}>{error}</p>
        )}

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
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: text2 }}>Loading blogs…</td></tr>
                ) : blogs.map(blog => (
                  <tr key={blog.id} className="transition-colors cursor-pointer"
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? "#d0baa3" : "#F5ECD7")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    onClick={() => openDetail(blog)}>
                    <td className="px-6 py-3" onClick={e => e.stopPropagation()}>
                      <div className="w-16 h-12 rounded-lg overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: isDark ? "#d0baa3" : "#EDE0C4" }}>
                        {blog.imageUrl ? <img src={blogImageUrl(blog.imageUrl)} alt="" className="w-full h-full object-cover"/> : <ToothPlaceholder size={40}/>}
                      </div>
                    </td>
                    <td className="px-6 py-3"><span className="text-sm font-medium" style={{ color: text1 }}>{blog.title}</span></td>
                    <td className="px-6 py-3"><span className="text-sm" style={{ color: text2 }}>{blog.date}</span></td>
                    <td className="px-6 py-3"><span className="text-sm" style={{ color: text2 }}>{blog.views}</span></td>
                    <td className="bl-action-cell px-6 py-3 relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (actionOpen === blog.id) {
                            setActionOpen(null);
                            setActionMenuPos(null);
                            return;
                          }
                          const rect = e.currentTarget.getBoundingClientRect();
                          setActionMenuPos({
                            top: rect.bottom + 4,
                            left: Math.max(8, rect.right - 128),
                          });
                          setActionOpen(blog.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-black/10"
                        style={{ color: text2 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                        </svg>
                      </button>
                      {actionOpen === blog.id && actionMenuPos && (
                        <div className="rounded-xl shadow-xl border py-1 min-w-[120px]"
                          style={{
                            position: "fixed",
                            top: actionMenuPos.top,
                            left: actionMenuPos.left,
                            zIndex: 9999,
                            backgroundColor: "#ffffff",
                            borderColor: "#D9C9A8",
                          }}
                          onClick={e => e.stopPropagation()}>
                          {[
                            { label:"Delete", action:()=>deleteBlog(blog.id), color:"#C94A3A" },
                            { label:"Edit",   action:()=>openEdit(blog),      color: brandColor },
                            { label:"View",   action:()=>openDetail(blog),    color: brandColor },
                            { label: blog.status === "published" ? "Unpublish" : "Publish", action:()=>togglePublish(blog), color: brandColor },
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
                {!loading && blogs.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: text2 }}>No blogs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bl-pagination">
            <span className="text-xs" style={{ color: text2 }}>
              {pagination && pagination.total > 0
                ? `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} results`
                : stats
                  ? `${stats.total} total · ${stats.published} published · ${stats.drafts} drafts · ${stats.totalViews} views`
                  : "No results"}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!pagination || pagination.page <= 1}
                className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-40"
                style={{ color: text2 }}
              >‹</button>
              {pageNumbers.map((n, i) => {
                const prev = pageNumbers[i - 1];
                const showEllipsis = prev !== undefined && n - prev > 1;
                return (
                  <span key={n} className="flex items-center gap-1">
                    {showEllipsis && <span className="text-xs px-1" style={{ color: text2 }}>...</span>}
                    <button
                      onClick={() => setCurrentPage(n)}
                      className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
                      style={{
                        backgroundColor: pagination?.page === n ? brandColor : "transparent",
                        color: pagination?.page === n ? "#F5ECD7" : text2,
                      }}
                    >{n}</button>
                  </span>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination?.totalPages || 1, p + 1))}
                disabled={!pagination || pagination.page >= pagination.totalPages}
                className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-40"
                style={{ color: text2 }}
              >›</button>
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
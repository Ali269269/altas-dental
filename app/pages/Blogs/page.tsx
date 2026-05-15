"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Blog {
  id: number;
  image: string;
  date: string;
  tag?: string;
  title: string;
  slug: string;
  specialite?: string; // e.g. "Implants", "Orthodontie", etc.
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const ALL_BLOGS: Blog[] = [
  {
    id: 1,
    image: "/images/blog1.jpg",
    date: "May 19, 2023",
    title: "L'évolution de l'expérience patient : fusionner l'excellence clinique avec le confort moderne",
    slug: "evolution-experience-patient",
    specialite: "Implants",
  },
  {
    id: 2,
    image: "/images/blog2.jpg",
    date: "Jun 03, 2023",
    title: "Naviguer dans la frontière dentaire numérique : comment les outils intelligents et les données transforment vos soins",
    slug: "frontiere-dentaire-numerique",
    specialite: "Orthodontie",
  },
  {
    id: 3,
    image: "/images/blog3.jpg",
    date: "Apr 12, 2023",
    tag: "Réhabilitation totale du sourire",
    title: "L'évolution de l'expérience patient : fusionner l'excellence clinique avec le confort moderne",
    slug: "rehabilitation-totale-sourire",
    specialite: "Réhabilitation",
  },
  {
    id: 4,
    image: "/images/blog4.jpg",
    date: "Mar 28, 2023",
    title: "Naviguer dans la frontière dentaire numérique : comment les outils intelligents et les données transforment vos soins",
    slug: "frontiere-dentaire-2",
    specialite: "Implants",
  },
  {
    id: 5,
    image: "/images/blog5.jpg",
    date: "Jul 15, 2023",
    title: "Naviguer dans la frontière dentaire numérique : comment les outils intelligents et les données transforment vos soins",
    slug: "frontiere-dentaire-3",
    specialite: "Orthodontie",
  },
  {
    id: 6,
    image: "/images/blog6.jpg",
    date: "Aug 02, 2023",
    title: "L'évolution de l'expérience patient : fusionner l'excellence clinique avec le confort moderne",
    slug: "evolution-experience-2",
    specialite: "Réhabilitation",
  },
];

const BEST_PICKS: Blog[] = [
  {
    id: 7,
    image: "/images/blog1.jpg",
    date: "May 19, 2023",
    title: "Naviguer dans la frontière dentaire numérique : comment les outils intelligents et les données transforment vos soins",
    slug: "best-frontiere-dentaire",
  },
  {
    id: 8,
    image: "/images/blog2.jpg",
    date: "May 19, 2023",
    title: "Naviguer dans la frontière dentaire numérique : comment les outils intelligents et les données transforment vos soins",
    slug: "best-frontiere-dentaire-2",
  },
  {
    id: 9,
    image: "/images/blog3.jpg",
    date: "May 19, 2023",
    title: "L'évolution de l'expérience patient : fusionner l'excellence clinique avec le confort moderne",
    slug: "best-evolution-patient",
  },
  {
    id: 10,
    image: "/images/blog3.jpg",
    date: "May 19, 2023",
    title: "L'évolution de l'expérience patient : fusionner l'excellence clinique avec le confort moderne",
    slug: "best-evolution-patient",
  },
 
];

const SPECIALITES = ["Toutes", "Implants", "Orthodontie", "Réhabilitation"];
const TOTAL_PAGES = 5;
const CAROUSEL_DOTS = 6;

// ─── Arrow Icon ───────────────────────────────────────────────────────────────

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ─── Filter Dropdown ──────────────────────────────────────────────────────────
type FilterType = "all" | "recent" | "popular" | string;

interface FilterDropdownProps {
  activeFilter: FilterType;
  activeSpecialite: string;
  onFilterChange: (filter: FilterType) => void;
  onSpecialiteChange: (specialite: string) => void;
}

function FilterDropdown({ activeFilter, activeSpecialite, onFilterChange, onSpecialiteChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [specialiteOpen, setSpecialiteOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSpecialiteOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleRecent = () => {
    onFilterChange("recent");
    onSpecialiteChange("Toutes");
    setOpen(false);
    setSpecialiteOpen(false);
  };

  const handlePopular = () => {
    onFilterChange("popular");
    onSpecialiteChange("Toutes");
    setOpen(false);
    setSpecialiteOpen(false);
  };

  const handleSpecialite = (s: string) => {
    onSpecialiteChange(s);
    onFilterChange("specialite");
    setOpen(false);
    setSpecialiteOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen(!open); setSpecialiteOpen(false); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#43121e",
          color: "#fff",
          border: "none",
          borderRadius: "999px",
          padding: "10px 20px",
          fontSize: "13px",
          fontFamily: "'Jost', sans-serif",
          fontWeight: 400,
          letterSpacing: "0.03em",
          cursor: "pointer",
        }}
      >
        Appliquer des filtres
        <FilterIcon />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            background: "linear-gradient(160deg, #5a1225 0%, #3d0d1a 100%)",
            borderRadius: "14px",
            overflow: "hidden",
            minWidth: "220px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            zIndex: 1000,
            padding: "6px 0",
          }}
        >
          {/* Spécialités row */}
          <div style={{ position: "relative" }}>
            <button
              onMouseEnter={() => setSpecialiteOpen(true)}
              onClick={() => setSpecialiteOpen(!specialiteOpen)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(212,180,140,0.18)",
                color: "#e8d5b0",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "17px",
                fontWeight: 500,
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              <span>Spécialités</span>
              <ChevronRightIcon />
            </button>

            {/* Specialités sub-menu */}
            {specialiteOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: "calc(100% + 8px)",
                  background: "linear-gradient(160deg, #5a1225 0%, #3d0d1a 100%)",
                  borderRadius: "14px",
                  minWidth: "180px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                  padding: "6px 0",
                  zIndex: 1001,
                }}
              >
                {SPECIALITES.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => handleSpecialite(s)}
                    style={{
                      width: "100%",
                      background: activeSpecialite === s ? "rgba(212,180,140,0.15)" : "none",
                      border: "none",
                      borderBottom: i < SPECIALITES.length - 1 ? "1px solid rgba(212,180,140,0.18)" : "none",
                      color: "#e8d5b0",
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "16px",
                      fontWeight: 500,
                      padding: "13px 20px",
                      textAlign: "left",
                      cursor: "pointer",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Récent row */}
          <button
            onClick={handleRecent}
            style={{
              width: "100%",
              background: activeFilter === "recent" ? "rgba(212,180,140,0.15)" : "none",
              border: "none",
              borderBottom: "1px solid rgba(212,180,140,0.18)",
              color: "#e8d5b0",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "17px",
              fontWeight: 500,
              padding: "14px 20px",
              textAlign: "left",
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            Récent
          </button>

          {/* Populaire row */}
          <button
            onClick={handlePopular}
            style={{
              width: "100%",
              background: activeFilter === "popular" ? "rgba(212,180,140,0.15)" : "none",
              border: "none",
              color: "#e8d5b0",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "17px",
              fontWeight: 500,
              padding: "14px 20px",
              textAlign: "left",
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            Populaire
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({ blog }: { blog: Blog }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/pages/Blogs/${blog.slug}`}
      style={{ textDecoration: "none", display: "block", height: "100%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          borderRadius: "24px",
          background: hovered ? "#5c0d2a" : "#ffe9bf",
          padding: "14px 14px 24px",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          transition: "background 0.4s ease",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Image */}
        <div
          style={{
            width: "100%",
            height: "220px",
            borderRadius: "16px",
            overflow: "hidden",
            marginBottom: "16px",
            flexShrink: 0,
            position: "relative",
            background: "#c8b89a",
          }}
        >
        
          <Image src={blog.image} alt={blog.title} fill style={{ objectFit: "cover" }} />
          
          {blog.tag && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "12px",
                background: "#c8a84b",
                color: "#3d1a0e",
                fontSize: "11px",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 500,
                padding: "4px 10px",
                borderRadius: "20px",
                whiteSpace: "nowrap",
              }}
            >
              {blog.tag}
            </div>
          )}
        </div>

        {/* Date */}
        <p
          style={{
            color: hovered ? "#ffffff" : "#3d0818",
            fontSize: "14px",
            letterSpacing: "0.03em",
            textAlign: "right",
            marginBottom: "10px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            transition: "color 0.4s",
            paddingRight: "4px",
            margin: "0 0 10px 0",
          }}
        >
          {blog.date}
        </p>

        {/* Title + Arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "12px",
            paddingLeft: "6px",
            paddingRight: "6px",
            flex: 1,
          }}
        >
          <h3
            style={{
              color: hovered ? "#f0e6d3" : "#3d0818",
              fontSize: "15px",
              fontWeight: 400,
              lineHeight: 1.6,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              flex: 1,
              transition: "color 0.4s",
              margin: 0,
            }}
          >
            {blog.title}
          </h3>
          <div
            style={{
              flexShrink: 0,
              width: "49px",
              height: "49px",
              borderRadius: "50%",
              background: hovered ? "#f2e5c5" : "#5c0d2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: hovered ? "#711c31" : "#FFD52F",
              fontSize: "25px",
              marginBottom: "2px",
              transition: "background 0.4s ease, color 0.4s ease",
            }}
          >
            ↗
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Filtering Logic ──────────────────────────────────────────────────────────
function parseDate(dateStr: string): number {
  return new Date(dateStr).getTime();
}

// "Popular" = sorted by id descending as a proxy (replace with real view counts if available)
function applyFilter(blogs: Blog[], filter: FilterType, specialite: string): Blog[] {
  let result = [...blogs];

  if (filter === "specialite" && specialite && specialite !== "Toutes") {
    result = result.filter((b) => b.specialite === specialite);
  }

  if (filter === "recent") {
    result = result.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  } else if (filter === "popular") {
    // Sort by id descending as a popularity proxy
    result = result.sort((a, b) => b.id - a.id);
  }

  return result;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BlogsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [carouselDot, setCarouselDot] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeSpecialite, setActiveSpecialite] = useState("Toutes");

  const filteredBlogs = applyFilter(ALL_BLOGS, activeFilter, activeSpecialite);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSpecialiteChange = (s: string) => {
    setActiveSpecialite(s);
    setCurrentPage(1);
  };

  return (
    <>
      <style>{`
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .pagination-btn {
          transition: background 0.2s, color 0.2s;
        }
        .pagination-btn:hover {
          background: rgba(113,28,49,0.1);
        }
        @media (max-width: 900px) {
          .blog-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .blog-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main style={{ background: "#EFE7CE" }}>

        {/* ══════════════════════════════════════════
            NOS BLOGS SECTION
        ══════════════════════════════════════════ */}
        <section style={{ background: "#EFE7CE", padding: "158px 40px 52px" }}>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px",padding:"20px" }}>
            <h1
              style={{
                fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: "#711C31",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: 0,
              }}
            >
              Nos Blogs
            </h1>

            <FilterDropdown
              activeFilter={activeFilter}
              activeSpecialite={activeSpecialite}
              onFilterChange={handleFilterChange}
              onSpecialiteChange={handleSpecialiteChange}
            />
          </div>

          {/* Active filter badge */}
          {(activeFilter !== "all") && (
            <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "12px",
                color: "#711C31",
                background: "rgba(113,28,49,0.1)",
                borderRadius: "999px",
                padding: "4px 12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}>
                {activeFilter === "recent" && "Récent"}
                {activeFilter === "popular" && "Populaire"}
                {activeFilter === "specialite" && `Spécialité : ${activeSpecialite}`}
                <button
                  onClick={() => { setActiveFilter("all"); setActiveSpecialite("Toutes"); }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#711C31",
                    fontSize: "14px",
                    lineHeight: 1,
                    padding: 0,
                    marginLeft: "2px",
                  }}
                >
                  ×
                </button>
              </span>
            </div>
          )}

          {/* Blog grid */}
          {filteredBlogs.length > 0 ? (
            <div className="blog-grid" style={{ marginBottom: "36px" }}>
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "60px 0",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "18px",
              color: "#711C31",
              fontStyle: "italic",
            }}>
              Aucun article trouvé pour cette sélection.
            </div>
          )}

          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              style={{
                background: "none",
                border: "none",
                color: "#5a4a3a",
                fontSize: "18px",
                cursor: "pointer",
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              ←
            </button>

            {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className="pagination-btn"
                onClick={() => setCurrentPage(p)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  border: currentPage === p ? "none" : "1.5px solid #c8b89a",
                  background: currentPage === p ? "#711C31" : "transparent",
                  color: currentPage === p ? "#fff" : "#5a4a3a",
                  fontSize: "14px",
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: currentPage === p ? 600 : 400,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(TOTAL_PAGES, currentPage + 1))}
              style={{
                background: "none",
                border: "none",
                color: "#5a4a3a",
                fontSize: "18px",
                cursor: "pointer",
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              →
            </button>
          </div>
        </section>

      
{/* ══════════════════════════════════════════
    MEILLEURS CHOIX SECTION
══════════════════════════════════════════ */}
<section style={{ background: "#711C31", padding: "48px 40px 56px",boxShadow: "inset 0 -120px 120px rgba(40, 0, 15, 0.85)",  }}>
  <h2
    style={{
      fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
      fontSize: "26px",
      fontWeight: 600,
      color: "#f0e6d3",
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      margin: "0 0 28px 0",
    }}
  >
    Meilleurs Choix
  </h2>

  {/* Outer viewport */}
  <div
    style={{
      position: "relative",
      overflow: "hidden",
      marginBottom: "32px",
    }}
  >
    {/* Sliding track — one card per slot, 3 visible at a time via width */}
    <div
      style={{
        display: "flex",
        flexWrap: "nowrap",
        transform: `translateX(calc(-${carouselDot * (100 / 3)}%))`,
        transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "transform",
      }}
    >
      {BEST_PICKS.map((blog) => (
        <div
          key={blog.id}
          style={{
            minWidth: "calc(33.333% - 14px)", // 3 visible cards with gap
            width: "calc(33.333% - 14px)",
            flexShrink: 0,
            marginRight: "20px",
            boxSizing: "border-box",
          }}
        >
          <BlogCard blog={blog} />
        </div>
      ))}
    </div>
  </div>

  {/* Carousel dots — one dot per card */}
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
    {BEST_PICKS.map((_, i) => (
      <button
        key={i}
        onClick={() => setCarouselDot(i)}
        style={{
          width: carouselDot === i ? "32px" : "10px",
          height: "10px",
          borderRadius: "999px",
          background: carouselDot === i ? "#f0e6d3" : "rgba(240,230,211,0.35)",
          border: "none",
          cursor: "pointer",
          padding: 0,
          transition: "width 0.3s ease, background 0.3s ease",
        }}
      />
    ))}
  </div>
</section>

      </main>
    </>
  );
}

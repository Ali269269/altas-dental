
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
  specialite?: string;
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
    slug: "best-evolution-patient-2",
  },
];

const SPECIALITES = ["Toutes", "Implants", "Orthodontie", "Réhabilitation"];
const TOTAL_PAGES = 5;
const MOBILE_PAGE_SIZE = 2;

// ─── Icons ────────────────────────────────────────────────────────────────────
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
          display: "flex", alignItems: "center", gap: "8px",
          background: "#43121e", color: "#fff", border: "none",
          borderRadius: "999px", padding: "10px 20px", fontSize: "13px",
          fontFamily: "'Jost', sans-serif", fontWeight: 400,
          letterSpacing: "0.03em", cursor: "pointer",
        }}
      >
        Appliquer des filtres
        <FilterIcon />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          background: "linear-gradient(160deg, #5a1225 0%, #3d0d1a 100%)",
          borderRadius: "14px", overflow: "hidden", minWidth: "220px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.45)", zIndex: 1000, padding: "6px 0",
        }}>
          <div style={{ position: "relative" }}>
            <button
              onMouseEnter={() => setSpecialiteOpen(true)}
              onClick={() => setSpecialiteOpen(!specialiteOpen)}
              style={{
                width: "100%", background: "none", border: "none",
                borderBottom: "1px solid rgba(212,180,140,0.18)", color: "#e8d5b0",
                fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "17px",
                fontWeight: 500, padding: "14px 20px", display: "flex",
                alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", letterSpacing: "0.01em",
              }}
            >
              <span>Spécialités</span>
              <ChevronRightIcon />
            </button>

            {specialiteOpen && (
              <div style={{
                position: "absolute", top: 0, right: "calc(100% + 8px)",
                background: "linear-gradient(160deg, #5a1225 0%, #3d0d1a 100%)",
                borderRadius: "14px", minWidth: "180px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.45)", padding: "6px 0", zIndex: 1001,
              }}>
                {SPECIALITES.map((s, i) => (
                  <button key={s} onClick={() => handleSpecialite(s)} style={{
                    width: "100%",
                    background: activeSpecialite === s ? "rgba(212,180,140,0.15)" : "none",
                    border: "none",
                    borderBottom: i < SPECIALITES.length - 1 ? "1px solid rgba(212,180,140,0.18)" : "none",
                    color: "#e8d5b0", fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "16px", fontWeight: 500, padding: "13px 20px",
                    textAlign: "left", cursor: "pointer", letterSpacing: "0.01em",
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleRecent} style={{
            width: "100%",
            background: activeFilter === "recent" ? "rgba(212,180,140,0.15)" : "none",
            border: "none", borderBottom: "1px solid rgba(212,180,140,0.18)",
            color: "#e8d5b0", fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "17px", fontWeight: 500, padding: "14px 20px",
            textAlign: "left", cursor: "pointer", letterSpacing: "0.01em",
          }}>
            Récent
          </button>

          <button onClick={handlePopular} style={{
            width: "100%",
            background: activeFilter === "popular" ? "rgba(212,180,140,0.15)" : "none",
            border: "none", color: "#e8d5b0",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "17px", fontWeight: 500, padding: "14px 20px",
            textAlign: "left", cursor: "pointer", letterSpacing: "0.01em",
          }}>
            Populaire
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({ blog, compact = false }: { blog: Blog; compact?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/pages/Blogs/${blog.slug}`}
      style={{ textDecoration: "none", display: "block", height: "100%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        borderRadius: "24px",
        background: hovered ? "#5c0d2a" : "#d3d3d3",
        padding: compact ? "10px 10px 16px" : "14px 14px 24px",
        display: "flex", flexDirection: "column",
        cursor: "pointer", transition: "background 0.4s ease",
        height: "100%", boxSizing: "border-box",
      }}>
        {/* Image */}
        <div style={{
          width: "100%",
          height: compact ? "130px" : "220px",
          borderRadius: "16px",
          overflow: "hidden",
          marginBottom: compact ? "10px" : "16px",
          flexShrink: 0,
          position: "relative",
          background: "#c8b89a",
        }}>
          <Image src={blog.image} alt={blog.title} fill style={{ objectFit: "cover" }} />
          {blog.tag && (
            <div style={{
              position: "absolute", bottom: "10px", left: "12px",
              background: "#c8a84b", color: "#3d1a0e", fontSize: "11px",
              fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500,
              padding: "4px 10px", borderRadius: "20px", whiteSpace: "nowrap",
            }}>
              {blog.tag}
            </div>
          )}
        </div>

        {/* Date */}
        <p style={{
          color: hovered ? "#ffffff" : "#3d0818",
          fontSize: compact ? "11px" : "14px",
          letterSpacing: "0.03em", textAlign: "right",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          transition: "color 0.4s", paddingRight: "4px", margin: `0 0 ${compact ? "6px" : "10px"} 0`,
        }}>
          {blog.date}
        </p>

        {/* Title + Arrow */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          gap: compact ? "8px" : "12px",
          paddingLeft: compact ? "4px" : "6px",
          paddingRight: compact ? "4px" : "6px",
          flex: 1,
        }}>
          <h3 style={{
            color: hovered ? "#f0e6d3" : "#3d0818",
            fontSize: compact ? "12px" : "15px",
            fontWeight: 400, lineHeight: 1.5,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            flex: 1, transition: "color 0.4s", margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: compact ? 3 : undefined,
            WebkitBoxOrient: "vertical" as const,
            overflow: compact ? "hidden" : undefined,
          }}>
            {blog.title}
          </h3>
          <div style={{
            flexShrink: 0,
            width: compact ? "34px" : "49px",
            height: compact ? "34px" : "49px",
            borderRadius: "50%",
            background: hovered ? "#D3D3D3" : "#5c0d2a",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: hovered ? "#711c31" : "#FFFFFF",
            fontSize: compact ? "18px" : "25px",
            marginBottom: "2px",
            transition: "background 0.4s ease, color 0.4s ease",
          }}>
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

function applyFilter(blogs: Blog[], filter: FilterType, specialite: string): Blog[] {
  let result = [...blogs];
  if (filter === "specialite" && specialite && specialite !== "Toutes") {
    result = result.filter((b) => b.specialite === specialite);
  }
  if (filter === "recent") result = result.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  else if (filter === "popular") result = result.sort((a, b) => b.id - a.id);
  return result;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BlogsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeSpecialite, setActiveSpecialite] = useState("Toutes");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [mobileBlogPage, setMobileBlogPage] = useState(0);

  // ── Carousel state ──
  const total = BEST_PICKS.length;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isResettingRef = useRef(false);

  // ── Single unified resize handler ──
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w <= 425);
      setIsTablet(w > 425 && w <= 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Reset mobile blog page when filter changes
  useEffect(() => { setMobileBlogPage(0); }, [activeFilter, activeSpecialite]);

  // ── Cards visible in carousel per breakpoint ──
  const cardsVisible = isMobile ? 1 : isTablet ? 2 : 3;
  // Gap between cards in px (matches marginRight on card)
  const CAROUSEL_GAP = isMobile ? 0 : 20;
  // Total dot positions
  const totalDots = Math.ceil(total / cardsVisible);

  // ── Pixel-accurate translation ──
  const applyTranslate = (index: number, animated: boolean) => {
    if (!trackRef.current) return;
    const cardEl = trackRef.current.children[0] as HTMLElement;
    if (!cardEl) return;
    const cardWidth = cardEl.getBoundingClientRect().width;
    trackRef.current.style.transition = animated
      ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
      : "none";
    trackRef.current.style.transform = `translateX(-${index * (cardWidth + CAROUSEL_GAP)}px)`;
  };

  useEffect(() => {
    applyTranslate(carouselIndex, true);
  }, [carouselIndex, isMobile, isTablet]);

  // ── Clamp index when viewport switches ──
  useEffect(() => {
    const max = totalDots - 1;
    if (carouselIndex > max) {
      setCarouselIndex(0);
      applyTranslate(0, false);
    }
  }, [isMobile, isTablet]);

  // ── Auto-play (mobile only) with seamless loop ──
  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCarouselIndex((prev) => {
        const next = prev + 1;
        if (next >= total) {
          isResettingRef.current = true;
          return 0;
        }
        return next;
      });
    }, 3000);
  };

  useEffect(() => {
    if (!isMobile) {
      if (autoPlayRef.current) { clearInterval(autoPlayRef.current); autoPlayRef.current = null; }
      return;
    }
    startAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [isMobile]);

  // ── Instant reset when looping back to 0 ──
  useEffect(() => {
    if (isResettingRef.current) {
      isResettingRef.current = false;
      applyTranslate(0, false);
    }
  }, [carouselIndex]);

  const filteredBlogs = applyFilter(ALL_BLOGS, activeFilter, activeSpecialite);
  const mobileTotalPages = Math.ceil(filteredBlogs.length / MOBILE_PAGE_SIZE);
  const mobileVisibleBlogs = filteredBlogs.slice(
    mobileBlogPage * MOBILE_PAGE_SIZE,
    mobileBlogPage * MOBILE_PAGE_SIZE + MOBILE_PAGE_SIZE
  );

  const handleFilterChange = (filter: FilterType) => { setActiveFilter(filter); setCurrentPage(1); };
  const handleSpecialiteChange = (s: string) => { setActiveSpecialite(s); setCurrentPage(1); };

  // Card width calculation for carousel
  // On tablet: 2 cards, gap 20px → each card = (100% - 20px) / 2
  // On desktop: 3 cards, gap 20px × 2 = 40px → each card = (100% - 40px) / 3
  // On mobile: 1 card = 100%
  const cardWidthStyle = isMobile
    ? "100%"
    : isTablet
    ? "calc(50% - 10px)"
    : "calc(33.333% - 14px)";

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

        /* Show desktop elements, hide mobile elements by default */
        .desktop-only {
          display: grid;
        }

        .desktop-pagination {
          display: flex;
        }

        .mobile-only {
          display: none;
        }

        /* 769px to 900px = 2 cards */
        @media (max-width: 900px) and (min-width: 769px) {
          .blog-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
/* ───────── FIX: Tablet landscape (768px–1024px) ───────── */
@media (min-width: 769px) and (max-width: 1024px) {
  .blog-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  /* Reduce card vertical space */
  .blog-grid a > div {
    padding: 12px 12px 16px !important;
  }

  /* Reduce image height */
  .blog-grid a > div > div {
    height: 150px !important;
  }

  /* Reduce title size */
  .blog-grid h3 {
    font-size: 13px !important;
    line-height: 1.4 !important;
  }

  /* Reduce date spacing */
  .blog-grid p {
    font-size: 12px !important;
    margin-bottom: 6px !important;
  }
    .blogs-best-section {
            padding: 36px 6px 64px !important;
          }
  
}
        /* Tablet: 426px–768px = 2 columns (not 3 — prevents tall cards) */
        @media (min-width: 426px) and (max-width: 768px) {
          .blog-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .blogs-best-section {
            padding: 36px 16px 44px !important;
          }
        }

        /* Mobile layout */
        @media (max-width: 425px) {
          .blogs-nos-section {
            padding: 120px 16px 40px !important;
          }

          .blogs-header-row {
            flex-wrap: wrap !important;
            gap: 12px !important;
            padding: 10px 0 !important;
            margin-bottom: 14px !important;
          }

          .blogs-header-row h1 {
            font-size: 22px !important;
          }

          .desktop-only {
            display: none !important;
          }

          .desktop-pagination {
            display: none !important;
          }

          .mobile-only {
            display: flex !important;
          }

          .blogs-best-section {
            padding: 36px 16px 44px !important;
          }

          .blogs-best-section h2 {
            font-size: 20px !important;
            margin-bottom: 20px !important;
          }

          .blogs-best-dots {
            gap: 6px !important;
          }

          
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>

        {/* ══════════════════════════════════════════
            NOS BLOGS SECTION
        ══════════════════════════════════════════ */}
        <section className="blogs-nos-section" style={{ background: "#ffffff", padding: "158px 40px 52px" }}>

          <div className="blogs-header-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", padding: "20px" }}>
            <h1 style={{
              fontFamily: "'Cinzel', 'Cormorant Garamond', serif", fontSize: "28px",
              fontWeight: 600, color: "#711C31", textTransform: "uppercase",
              letterSpacing: "0.06em", margin: 0,
            }}>
              Nos Blogs
            </h1>
            <FilterDropdown
              activeFilter={activeFilter} activeSpecialite={activeSpecialite}
              onFilterChange={handleFilterChange} onSpecialiteChange={handleSpecialiteChange}
            />
          </div>

          {(activeFilter !== "all") && (
            <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#711C31",
                background: "rgba(113,28,49,0.1)", borderRadius: "999px", padding: "4px 12px",
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}>
                {activeFilter === "recent" && "Récent"}
                {activeFilter === "popular" && "Populaire"}
                {activeFilter === "specialite" && `Spécialité : ${activeSpecialite}`}
                <button onClick={() => { setActiveFilter("all"); setActiveSpecialite("Toutes"); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#711C31", fontSize: "14px", lineHeight: 1, padding: 0, marginLeft: "2px" }}>
                  ×
                </button>
              </span>
            </div>
          )}

          {filteredBlogs.length > 0 ? (
            <>
              {/* ── Desktop/Tablet grid (hidden on mobile) ── */}
              <div className="blog-grid desktop-only" style={{ marginBottom: "36px" }}>
                {filteredBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} compact={isTablet} />
                ))}
              </div>

              {/* ── Mobile: 2 cards + arrow navigation ── */}
              <div className="mobile-only" style={{ flexDirection: "column", gap: "0", marginBottom: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                  {mobileVisibleBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>

                {/* Arrow navigation */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                  <button
                    onClick={() => setMobileBlogPage((p) => Math.max(0, p - 1))}
                    disabled={mobileBlogPage === 0}
                    style={{
                      background: "none", border: "none",
                      color: mobileBlogPage === 0 ? "rgba(90,74,58,0.3)" : "#5a4a3a",
                      fontSize: "22px",
                      cursor: mobileBlogPage === 0 ? "default" : "pointer",
                      padding: "6px 10px", display: "flex", alignItems: "center",
                      transition: "color 0.2s",
                    }}
                  >
                    ←
                  </button>
                  <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#5a4a3a" }}>
                    {mobileBlogPage + 1} / {mobileTotalPages}
                  </span>
                  <button
                    onClick={() => setMobileBlogPage((p) => Math.min(mobileTotalPages - 1, p + 1))}
                    disabled={mobileBlogPage === mobileTotalPages - 1}
                    style={{
                      background: "none", border: "none",
                      color: mobileBlogPage === mobileTotalPages - 1 ? "rgba(90,74,58,0.3)" : "#5a4a3a",
                      fontSize: "22px",
                      cursor: mobileBlogPage === mobileTotalPages - 1 ? "default" : "pointer",
                      padding: "6px 10px", display: "flex", alignItems: "center",
                      transition: "color 0.2s",
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              textAlign: "center", padding: "60px 0",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "18px", color: "#711C31", fontStyle: "italic",
            }}>
              Aucun article trouvé pour cette sélection.
            </div>
          )}

          {/* ── Desktop pagination (hidden on mobile) ── */}
          <div className="desktop-pagination blogs-pagination" style={{ alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              style={{ background: "none", border: "none", color: "#5a4a3a", fontSize: "18px", cursor: "pointer", padding: "6px 10px", display: "flex", alignItems: "center" }}>
              ←
            </button>
            {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((p) => (
              <button key={p} className="pagination-btn" onClick={() => setCurrentPage(p)}
                style={{
                  width: "36px", height: "36px", borderRadius: "6px",
                  border: currentPage === p ? "none" : "1.5px solid #c8b89a",
                  background: currentPage === p ? "#711C31" : "transparent",
                  color: currentPage === p ? "#fff" : "#5a4a3a",
                  fontSize: "14px", fontFamily: "'Jost', sans-serif",
                  fontWeight: currentPage === p ? 600 : 400,
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", transition: "all 0.2s",
                }}>
                {p}
              </button>
            ))}
            <button onClick={() => setCurrentPage(Math.min(TOTAL_PAGES, currentPage + 1))}
              style={{ background: "none", border: "none", color: "#5a4a3a", fontSize: "18px", cursor: "pointer", padding: "6px 10px", display: "flex", alignItems: "center" }}>
              →
            </button>
          </div>

        </section>

        {/* ══════════════════════════════════════════
            MEILLEURS CHOIX SECTION
        ══════════════════════════════════════════ */}
        <section
          className="blogs-best-section"
          style={{ background: "#711C31", padding: "48px 40px 56px", boxShadow: "inset 0 -120px 120px rgba(40, 0, 15, 0.85)" }}
        >
          <h2 style={{
            fontFamily: "'Cinzel', 'Cormorant Garamond', serif", fontSize: "26px",
            fontWeight: 600, color: "#f0e6d3", textTransform: "uppercase",
            letterSpacing: "0.07em", margin: "0 0 28px 0",
          }}>
            Meilleurs Choix
          </h2>

          {/* Carousel viewport — clips overflow */}
          <div style={{ overflow: "hidden", marginBottom: "32px" }}>
            <div
              ref={trackRef}
              style={{
                display: "flex",
                flexWrap: "nowrap",
                gap: `${CAROUSEL_GAP}px`,
                willChange: "transform",
              }}
            >
              {BEST_PICKS.map((blog) => (
                <div
                  key={blog.id}
                  style={{
                    // Fixed width so carousel math is exact
                    width: cardWidthStyle,
                    minWidth: cardWidthStyle,
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                >
                  <BlogCard blog={blog} compact={isTablet} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div
            className="blogs-best-dots"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCarouselIndex(i);
                  if (isMobile) startAutoPlay();
                }}
                style={{
                  width: carouselIndex === i ? "32px" : "10px",
                  height: "10px", borderRadius: "999px",
                  background: carouselIndex === i ? "#f0e6d3" : "rgba(240,230,211,0.35)",
                  border: "none", cursor: "pointer", padding: 0,
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
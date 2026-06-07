"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { sanitizeRichHtml } from "@/utils/sanitizeHtml";
import {
  blogImageUrl,
  fetchPublicBlogBySlug,
  type PublicBlog,
  type PublicBlogDetail,
} from "@/utils/blogsApi";

// ─── Related Card (identical to BlogCard on the blog page) ───────────────────
function RelatedCard({ blog }: { blog: PublicBlog }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/pages/Blogs/${blog.slug}`}
      style={{ textDecoration: "none", display: "block" }}  // ← remove height: "100%"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          borderRadius: "24px",
          background: hovered ? "#5c0d2a" : "#d3d3d3",
          padding: "14px 14px 24px",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          transition: "background 0.4s ease",
          height: "380px",        // ← fixed height, not "100%"
          boxSizing: "border-box",
          overflow: "hidden",     // ← clip overflowing content
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
          <Image src={blogImageUrl(blog.image) || "/images/blog1.jpg"} alt={blog.title} fill style={{ objectFit: "cover" }} unoptimized />
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
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical" as const,
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
              background: hovered ? "#D3D3D3" : "#5c0d2a  ",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: hovered ? "#711c31" : "#FFFFFF",
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

// ─── Responsive Carousel ──────────────────────────────────────────────────────
function ResponsiveCarousel({ relatedBlogs }: { relatedBlogs: PublicBlog[] }) {
  const [carouselDot, setCarouselDot] = useState(0);
  const [viewMode, setViewMode] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w <= 425) setViewMode("mobile");
      else if (w <= 768) setViewMode("tablet");
      else setViewMode("desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const perView = viewMode === "mobile" ? 1 : viewMode === "tablet" ? 2 : 3;
  const gap = 20;
  const totalDots = Math.max(1, relatedBlogs.length - perView + 1);

  useEffect(() => {
    if (carouselDot >= totalDots) setCarouselDot(0);
  }, [viewMode, totalDots, carouselDot]);

  return (
    <div>
      {/* Outer viewport */}
      <div style={{ position: "relative", overflow: "hidden", marginBottom: "32px" }}>
        {/* Sliding track */}
        <div
          ref={trackRef}
          style={{
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "flex-start", // ← prevents vertical stretching
            transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
            transform: `translateX(calc(-${carouselDot} * ((100% + ${gap}px) / ${perView})))`,
            willChange: "transform",
          }}
        >
          {relatedBlogs.map((blog) => (
              <div
              key={blog.id}
              style={{
                minWidth: `calc((100% - ${gap * (perView - 1)}px) / ${perView})`,
                width: `calc((100% - ${gap * (perView - 1)}px) / ${perView})`,
                flexShrink: 0,
                marginRight: `${gap}px`,
                boxSizing: "border-box",
              }}
            >
              <RelatedCard blog={blog} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        {Array.from({ length: totalDots }).map((_, i) => (
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
    </div>
  );
}
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BlogDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [blog, setBlog] = useState<PublicBlogDetail | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<PublicBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    fetchPublicBlogBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setBlog(data.blog);
        setRelatedBlogs(data.related);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <main className="blog-detail-body" style={{ background: "#ffffff", paddingTop: 220, textAlign: "center", color: "#711C31" }}>
        Chargement de l&apos;article…
      </main>
    );
  }

  if (notFound || !blog) {
    return (
      <main className="blog-detail-body" style={{ background: "#ffffff", paddingTop: 220, textAlign: "center", color: "#711C31" }}>
        Article introuvable.
      </main>
    );
  }

  return (
    <>
      <style>{`
        .blog-detail-body {
          background: #ffffff;
        }
        .article-col {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .section-heading {
          font-size: 20px;
          font-weight: 600;
          color: #561420;
          margin: 0 0 12px 0;
          line-height: 1.3;
        }
        .body-text {
          font-size: 18px;
          font-weight: 500;
          color: #5D5153;
          line-height: 1.85;
          margin: 0 0 14px 0;
        }
        .article-col h2 {
          font-size: 20px;
          font-weight: 600;
          color: #561420;
          margin: 32px 0 12px 0;
          line-height: 1.3;
        }
        .article-col h3 {
          font-size: 20px;
          font-weight: 600;
          color: #561420;
          margin: 24px 0 12px 0;
          line-height: 1.3;
        }
        .article-col p {
          font-size: 18px;
          font-weight: 500;
          color: #5D5153;
          line-height: 1.85;
          margin: 0 0 14px 0;
        }
        .blockquote {
          border-left: 3.5px solid #711C31;
          padding: 4px 0 4px 20px;
          margin: 28px 0;
        }
        .blockquote p {
          font-size: 18px;
          font-weight: 600;
          color: #561420;
          line-height: 1.75;
          margin: 0;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .related-grid-desktop { display: block; }
        .related-carousel-mobile { display: none; }
        .inline-image-row {
          display: flex;
          align-items: flex-start;
          gap: 30px;
          margin: 48px 0 29px;
        }
        .inline-image-wrap {
          width: 360px;
          height: 340px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #9a8878;
        }
        .inline-image-text {
          flex: 1;
          padding-top: 84px;
        }
        .meilleurs-section {
          background: #711C31;
          padding: 48px 80px 56px;
          position: relative;
          box-shadow: inset 0 -120px 120px rgba(40, 0, 15, 0.85);
        }
        .meilleurs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        @media (max-width: 860px) {
          .related-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .article-col {
            padding: 0 16px;
          }
          .section-heading {
            font-size: 17px;
          }
          .body-text {
            font-size: 16px;
          }
          .blockquote p {
            font-size: 16px;
          }
          .inline-image-row {
            flex-direction: column;
            gap: 20px;
            margin: 32px 0 20px;
          }
          .inline-image-wrap {
            width: 100%;
            height: 240px;
          }
          .inline-image-text {
            padding-top: 0;
          }
          .meilleurs-section {
            padding: 36px 16px 44px;
          }
          .meilleurs-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 20px;
          }
          /* Switch grid → carousel on mobile */
          .related-grid-desktop { display: none; }
          .related-carousel-mobile { display: block; }
        }
      `}</style>

      <main className="blog-detail-body">

        {/* ══════════════════════════════════════════
            ARTICLE HEADER
        ══════════════════════════════════════════ */}
        <section style={{ background: "#ffffff", paddingTop: "186px", paddingBottom: "0" }}>
          <div className="article-col">

            <h1 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700,
              color: "#711C31", textTransform: "uppercase",
              textAlign: "center", lineHeight: 1.25,
              letterSpacing: "0.03em", marginBottom: "18px",
            }}>
              {blog.title}
            </h1>

            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "10px", marginBottom: "28px",
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "17px", color: "#746A6C", fontWeight: 400 }}>
                {blog.category || blog.specialite}
              </span>
              <span style={{ color: "#561420", fontSize: "13px" }}>●</span>
              <span style={{ fontSize: "14px", color: "#7a6a5a", fontWeight: 300 }}>
                {blog.date}
              </span>
            </div>

            <div style={{
              width: "100%", height: "360px",
              borderRadius: "16px", overflow: "hidden", marginBottom: "44px",
            }}>
              <Image
                src={blogImageUrl(blog.image) || "/images/blogdetail.jpg"}
                alt={blog.title}
                width={1900} height={1060}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                unoptimized
              />
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            ARTICLE BODY
        ══════════════════════════════════════════ */}
        <section style={{ background: "#ffffff", paddingBottom: "64px" }}>
          <div className="article-col">
            <div
              className="body-text"
              style={{ color: "#5D5153" }}
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(blog.description) }}
            />

            {blog.quote && (
              <div className="blockquote">
                <p>{blog.quote}</p>
              </div>
            )}

            {blog.afterQuoteHeading && (
              <h2 className="section-heading" style={{ marginTop: "32px" }}>
                {blog.afterQuoteHeading}
              </h2>
            )}

            {blog.afterQuoteText && (
              <p className="body-text">{blog.afterQuoteText}</p>
            )}

            {blog.additionalImageUrl && (
              <div className="inline-image-row">
                <div className="inline-image-wrap">
                  <Image
                    src={blogImageUrl(blog.additionalImageUrl)}
                    alt={blog.additionalImageTitle || blog.title}
                    width={320} height={320}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    unoptimized
                  />
                </div>

                {(blog.additionalImageTitle || blog.additionalImageDescription) && (
                  <div className="inline-image-text">
                    {blog.additionalImageTitle && (
                      <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#561420", marginBottom: "12px", lineHeight: 1.3 }}>
                        {blog.additionalImageTitle}
                      </h3>
                    )}
                    {blog.additionalImageDescription && (
                      <p style={{ marginBottom: 0, color: "#591727", fontSize: "18px" }}>
                        {blog.additionalImageDescription}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {blog.conclusion && (
              <p className="body-text">{blog.conclusion}</p>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MEILLEURS CHOIX SECTION
        ══════════════════════════════════════════ */}
        <section className="meilleurs-section">

          <div className="meilleurs-header">
            <h2 style={{
              fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
              fontSize: "26px",
              fontWeight: 600,
              color: "#f0e6d3",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              margin: 0,
            }}>
              Meilleurs Choix
            </h2>

            <Link
              href="/pages/Blogs"
              style={{
                fontSize: "14px", fontWeight: 500,
                color: "#F7EBD3", textDecoration: "none",
                letterSpacing: "0.02em", transition: "opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.75"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >
              Voir tout les blogs →
            </Link>
          </div>

          {/* Responsive carousel for both desktop and mobile */}
          <ResponsiveCarousel relatedBlogs={relatedBlogs} />
        </section>

      </main>
    </>
  );
}

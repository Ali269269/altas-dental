"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RelatedBlog {
  id: number;
  image: string;
  date: string;
  title: string;
  slug: string;
  tag?: string;
}

// ─── Related blogs data ───────────────────────────────────────────────────────
const RELATED_BLOGS: RelatedBlog[] = [
  {
    id: 1,
    image: "/images/blog1.jpg",
    date: "May 19, 2023",
    title: "Naviguer dans la frontière dentaire numérique : comment les outils intelligents et les données transforment vos soins",
    slug: "frontiere-dentaire-numerique",
  },
  {
    id: 2,
    image: "/images/blog2.jpg",
    date: "May 19, 2023",
    title: "Naviguer dans la frontière dentaire numérique : comment les outils intelligents et les données transforment vos soins",
    slug: "frontiere-dentaire-2",
  },
  {
    id: 3,
    image: "/images/blog3.jpg",
    date: "May 19, 2023",
    title: "L'évolution de l'expérience patient : fusionner l'excellence clinique avec le confort moderne",
    slug: "evolution-experience-patient",
  },
];

// ─── Related Card (identical to BlogCard on the blog page) ───────────────────
function RelatedCard({ blog }: { blog: RelatedBlog }) {
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
          background: hovered ? "#5c0d2a" : "#d3d3d3",
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
function ResponsiveCarousel() {
  const [carouselDot, setCarouselDot] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const totalDots = isMobile
    ? RELATED_BLOGS.length
    : Math.max(1, RELATED_BLOGS.length - 2);

  useEffect(() => {
    if (carouselDot >= totalDots) setCarouselDot(0);
  }, [isMobile, totalDots, carouselDot]);

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
            transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
            transform: isMobile 
              ? `translateX(-${carouselDot * 100}%)` 
              : `translateX(calc(-${carouselDot} * (100% + 20px) / 3))`,
            willChange: "transform",
          }}
        >
          {RELATED_BLOGS.map((blog) => (
            <div
              key={blog.id}
              style={{
                minWidth: isMobile ? "100%" : "calc((100% - 40px) / 3)",
                width: isMobile ? "100%" : "calc((100% - 40px) / 3)",
                flexShrink: 0,
                marginRight: isMobile ? "0px" : "20px",
                boxSizing: "border-box",
              }}
            >
              <RelatedCard blog={blog} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
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
  return (
    <>
      <style>{`
        .blog-detail-body {
          background: #EFE7CE;
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
        <section style={{ background: "#EFE7CE", paddingTop: "186px", paddingBottom: "0" }}>
          <div className="article-col">

            <h1 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700,
              color: "#711C31", textTransform: "uppercase",
              textAlign: "center", lineHeight: 1.25,
              letterSpacing: "0.03em", marginBottom: "18px",
            }}>
              L'évolution de l'expérience patient :{" "}
              fusionner l'excellence clinique avec le confort moderne
            </h1>

            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "10px", marginBottom: "28px",
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "17px", color: "#746A6C", fontWeight: 400 }}>
                Réhabilitation totale du sourire
              </span>
              <span style={{ color: "#561420", fontSize: "13px" }}>●</span>
              <span style={{ fontSize: "14px", color: "#7a6a5a", fontWeight: 300 }}>
                May 19, 2023
              </span>
            </div>

            <div style={{
              width: "100%", height: "360px",
              borderRadius: "16px", overflow: "hidden", marginBottom: "44px",
            }}>
              <Image
                src="/images/blogdetail.jpg"
                alt="Blog hero"
                width={1900} height={1060}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            ARTICLE BODY
        ══════════════════════════════════════════ */}
        <section style={{ background: "#EFE7CE", paddingBottom: "64px" }}>
          <div className="article-col">

            <h2 className="section-heading">Redéfinir le Soin Dentaire</h2>

            <p className="body-text">
              Dans le paysage en constante évolution de la dentisterie moderne, l&apos;accent s&apos;est déplacé au-delà du
              simple traitement clinique pour englober l&apos;ensemble du parcours du patient. Chez Atlas Dental Center,
              nous croyons que l&apos;excellence des soins commence dès que vous franchissez nos portes.
            </p>

            <p className="body-text">
              L&apos;intégration de technologies de pointe comme la radiographie numérique et la planification de traitement
              assistée par ordinateur ne permet pas seulement des résultats plus précis ; elle réduit considérablement le
              temps passé en fauteuil et l&apos;anxiété associée aux procédures traditionnelles.
            </p>

            <div className="blockquote">
              <p>
                &ldquo;Notre mission est de transformer la visite chez le dentiste d&apos;une nécessité redoutée
                en une expérience de bien-être revitalisante.&rdquo;
              </p>
            </div>

            <h2 className="section-heading" style={{ marginTop: "32px" }}>
              Le Confort au Cœur de l&apos;Innovation
            </h2>

            <p className="body-text">
              Le confort moderne ne se limite pas aux chaises ergonomiques. Il s&apos;agit d&apos;une approche globale qui
              inclut une communication transparente, une atmosphère apaisante et des techniques minimalement
              invasives préservant autant que possible la structure naturelle des dents.
            </p>

            <div className="inline-image-row">
              <div className="inline-image-wrap">
                <Image
                  src="/images/bcard.png"
                  alt="Outils Intelligents"
                  width={320} height={320}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>

              <div className="inline-image-text">
                <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#561420", marginBottom: "12px", lineHeight: 1.3 }}>
                  Outils Intelligents
                </h3>
                <p style={{ marginBottom: 0, color: "#591727", fontSize: "18px" }}>
                  L&apos;usage de l&apos;intelligence artificielle dans le diagnostic
                  permet une détection précoce et des plans de soins
                  personnalisés, garantissant une tranquillité d&apos;esprit
                  totale pour nos patients.
                </p>
              </div>
            </div>

            <p className="body-text">
              En conclusion, l&apos;avenir du soin dentaire réside dans cet équilibre délicat entre la science rigoureuse et
              l&apos;empathie humaine. Nous continuons d&apos;investir dans les deux pour offrir à nos patients ce qu&apos;il y a de
              mieux.
            </p>

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
          <ResponsiveCarousel />
        </section>

      </main>
    </>
  );
}

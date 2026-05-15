"use client";

import { useState } from "react";
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

// ─── Related Card — exact same design as BlogCard in blogs page ───────────────
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
            <div style={{
              position: "absolute", bottom: "10px", left: "12px",
              background: "#c8a84b", color: "#3d1a0e",
              fontSize: "11px", fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 500, padding: "4px 10px", borderRadius: "20px", whiteSpace: "nowrap",
            }}>
              {blog.tag}
            </div>
          )}
        </div>

        {/* Date */}
        <p style={{
          color: hovered ? "#ffffff" : "#3d0818",
          fontSize: "14px",
          letterSpacing: "0.03em",
          textAlign: "right",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          transition: "color 0.4s",
          paddingRight: "4px",
          margin: "0 0 10px 0",
        }}>
          {blog.date}
        </p>

        {/* Title + Arrow */}
        <div style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between", gap: "12px",
          paddingLeft: "6px", paddingRight: "6px", flex: 1,
        }}>
          <h3 style={{
            color: hovered ? "#f0e6d3" : "#3d0818",
            fontSize: "15px", fontWeight: 400, lineHeight: 1.6,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            flex: 1, transition: "color 0.4s", margin: 0,
          }}>
            {blog.title}
          </h3>

          {/* Arrow button — identical to blogs page */}
          <div style={{
            flexShrink: 0,
            width: "49px", height: "49px", borderRadius: "50%",
            background: hovered ? "#f2e5c5" : "#5c0d2a",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: hovered ? "#711c31" : "#FFD52F",
            fontSize: "25px", marginBottom: "2px",
            transition: "background 0.4s ease, color 0.4s ease",
          }}>
            ↗
          </div>
        </div>
      </div>
    </Link>
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
        @media (max-width: 860px) {
          .related-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .related-grid { grid-template-columns: 1fr; }
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
              fontSize: "28px", fontWeight: 700,
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
                style={{ width: "1200px", height: "340px", objectFit: "cover" }}
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

            <div style={{ display: "flex", alignItems: "flex-start", gap: "30px", margin: "48px 0 29px" }}>
              <div style={{
                width: "360px", height: "340px", borderRadius: "10px",
                overflow: "hidden", flexShrink: 0, background: "#9a8878",
              }}>
                <Image
                  src="/images/bcard.png"
                  alt="Outils Intelligents"
                  width={320} height={320}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>

              <div style={{ flex: 1, paddingTop: "84px" }}>
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
        <section style={{ background: "#711C31", padding: "48px 80px 56px" ,     position: "relative",
    boxShadow: "inset 0 -120px 120px rgba(40, 0, 15, 0.85)", 
}}>

          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: "28px",
          }}>
            <h2 style={{
              fontSize: "24px", fontWeight: 600,
              color: "#F2E5C5", textTransform: "uppercase",
              letterSpacing: "0.07em", margin: 0,
            }}>
              Meilleurs Choix
            </h2>

            <Link
              href="/blog"
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

          {/* Cards — same design as blogs page */}
          <div className="related-grid">
            {RELATED_BLOGS.map(blog => (
              <RelatedCard key={blog.id} blog={blog} />
              
            ))}
          </div>
       

        </section>
        

      </main>
    </>
  );
}

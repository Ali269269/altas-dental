"use client";
import React, { Fragment, useState, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Pédodontie",
  "Dentisterie Esthétique",
  "Chirurgie orale",
  "Aligneurs",
  "Endodontie",
  "Parodontologie",
  "Réhabilitation totale du sourire",
  "Implantologie",
  "Orthodontie",
  "Prothèse dentaire",
];

const CASES: Record<string, { label: string; imgSrc: string }[]> = {
  "Pédodontie": [
    { label: "Après", imgSrc: "/images/teeth1.jpg" },
    { label: "Avant", imgSrc: "/images/teeth1.jpg" },
    { label: "Après", imgSrc: "/images/teeth1.jpg" },
  ],
  "Dentisterie Esthétique": [
    { label: "Après", imgSrc: "/images/teeth1.jpg" },
    { label: "Avant", imgSrc: "/images/teeth2.png" },
    { label: "Après", imgSrc: "/images/teeth3.jpg" },
    { label: "Avant", imgSrc: "/images/teeth1.jpg" },
    { label: "Après", imgSrc: "/images/teeth2.png" },
    { label: "Avant", imgSrc: "/images/teeth3.jpg" },
  ],
  "Chirurgie orale": [
    { label: "Après", imgSrc: "/images/teeth1.jpg" },
    { label: "Avant", imgSrc: "/images/teeth1.jpg" },
  ],
  "Aligneurs": [
    { label: "Après", imgSrc: "/images/teeth1.jpg" },
    { label: "Avant", imgSrc: "/images/teeth1.jpg" },
    { label: "Après", imgSrc: "/images/teeth1.jpg" },
  ],
  "Endodontie": [{ label: "Après", imgSrc: "/images/teeth1.jpg" }],
  "Parodontologie": [{ label: "Après", imgSrc: "/images/teeth1.jpg" }, { label: "Avant", imgSrc: "/images/teeth1.jpg" }],
  "Réhabilitation totale du sourire": [{ label: "Après", imgSrc: "/images/teeth1.jpg" }],
  "Implantologie": [{ label: "Après", imgSrc: "/images/teeth1.jpg" }, { label: "Avant", imgSrc: "/images/teeth1.jpg" }],
  "Orthodontie": [{ label: "Après", imgSrc: "/images/teeth1.jpg" }],
  "Prothèse dentaire": [{ label: "Après", imgSrc: "/images/teeth1.jpg" }],
};

function CaseCarousel({
  category,
  cases,
}: {
  category: string;
  cases: { label: string; imgSrc: string }[];
}) {
  const pairs: { before: { label: string; imgSrc: string }; after: { label: string; imgSrc: string } }[] = [];
  for (let i = 0; i + 1 < cases.length; i += 2) {
    pairs.push({ before: cases[i], after: cases[i + 1] });
  }
  if (cases.length % 2 !== 0 && cases.length > 0) {
    const last = cases[cases.length - 1];
    pairs.push({ before: last, after: last });
  }

  const [current, setCurrent] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (pairs.length <= 1 || paused) return;
    const interval = setInterval(() => {
      setSliding(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % pairs.length);
        setSliding(false);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, [pairs.length, paused]);

  const CARD_W = 220;
  const GAP = 12;

  if (pairs.length === 0) return null;

  const pair = pairs[current];

  return (
    <div
      className="flex flex-col items-center w-full"
      style={{ animation: "fadeIn 0.6s ease-out forwards" }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInPair {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutPair {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-60px); }
        }
        .pair-card {
          flex-shrink: 0;
          width: ${CARD_W}px;
          height: 270px;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          background: #c5b0a0;
        }
        .pair-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
          user-select: none;
        }
        .pair-label {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.85);
          color: #2c1a1a;
          font-size: 13px;
          font-weight: 500;
          padding: 3px 14px;
          border-radius: 20px;
          letter-spacing: 0.8px;
          white-space: nowrap;
        }

        /* ── Mobile overrides for carousel cards ── */
        @media (max-width: 600px) {
          .pair-card {
            width: calc(50vw - 28px) !important;
            height: 200px !important;
          }
          .carousel-wrapper {
            width: calc(100vw - 32px) !important;
            padding: 10px 10px 14px !important;
          }
        }
      `}</style>

      <h2
        className="mb-4 text-center"
        style={{ fontSize: 28, fontWeight: 500, color: "#711C31", letterSpacing: "0.5px" }}
      >
        {category}
      </h2>

      <div
        className="carousel-wrapper"
        style={{
          width: CARD_W * 2 + GAP + 32,
          border: "1.5px solid #711C31",
          borderRadius: 20,
          background: "#D3D3D3",
          boxShadow: "0 6px 30px rgba(0,0,0,0.10)",
          overflow: "hidden",
          padding: "14px 16px 18px",
          boxSizing: "border-box",
        }}
      >
        {/* Cards */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            display: "flex",
            gap: GAP,
            borderRadius: 12,
            overflow: "hidden",
            animation: sliding
              ? "slideOutPair 0.5s ease-in forwards"
              : "slideInPair 0.5s ease-out forwards",
          }}
        >
          <div className="pair-card">
            <img src={pair.before.imgSrc} alt={pair.before.label} />
            <span className="pair-label">{pair.before.label}</span>
          </div>
          <div className="pair-card">
            <img src={pair.after.imgSrc} alt={pair.after.label} />
            <span className="pair-label">{pair.after.label}</span>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {pairs.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 4, marginTop: 14 }}>
          {pairs.map((_, i) => (
            <button
              key={i}
              onClick={() => { setSliding(false); setCurrent(i); }}
              style={{
                width: i === current ? 18 : 7,
                height: 7,
                borderRadius: 10,
                border: "none",
                background: i === current ? "#711C31" : "rgba(113,28,49,0.3)",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AvantApresPage() {
  const [activeCategory, setActiveCategory] = useState("Dentisterie Esthétique");
  const cases = CASES[activeCategory] ?? [];

  return (
    <>
      <style>{`
        /* ════════════════════════════════════════
           MOBILE RESPONSIVE — max-width: 768px
           All desktop/laptop styles are untouched
           because these rules only fire on mobile.
        ════════════════════════════════════════ */
.cta-wrapper {
  margin: 0 auto 80px auto !important; /* bottom gap fixed */
  max-width: 1200px;
  width: 100% !important;
  box-sizing: border-box;
  padding: 70px 40px; /* default padding */
}

/* LARGE DESKTOPS */
@media (min-width: 1440px) {
  .cta-wrapper {
    padding: 70px 60px !important;
    margin-bottom: 120px !important; /* extra bottom spacing */
  }
}

/* TABLET / SMALL LAPTOP */
@media (max-width: 1024px) and (min-width: 769px) {
  .cta-wrapper {
   padding: 70px 40px !important;
    margin: 0 24px 80px 24px !important; /* 👈 adds left/right gap */
    width: auto !important; /* prevents full edge stretch */
    box-sizing: border-box;
  }
}
        @media (max-width: 768px) {

          /* ── Section 1: Hero ── */
          .hero-section {
            padding: 120px 20px 40px !important;
          }
          .hero-inner {
            flex-direction: column !important;
            gap: 28px !important;
            align-items: center !important;
          }
          .hero-text {
            flex: unset !important;
            width: 100% !important;
          }
          .hero-title {
            font-size: 28px !important;
            margin-bottom: 20px !important;
            text-align: center !important;
             margin-top: 25px !important;
          }
          .hero-body {
            font-size: 15px !important;
            max-width: 100% !important;
            text-align: center !important;
          }
          .hero-image {
            width: 100% !important;
            height: 260px !important;
            flex-shrink: unset !important;
          }

          /* ── Section 2: Filter Tabs ── */
          .filter-section {
            padding: 0 16px 32px !important;
          }
          .filter-row {
            gap: 8px !important;
            justify-content: center !important;
          }
          .filter-btn {
            padding: 7px 14px !important;
            font-size: 12px !important;
          }

          /* ── Section 3: Carousel ── */
          .carousel-section {
            padding: 36px 16px 48px !important;
          }

          /* ── Section 4: CTA ── */
          .cta-wrapper {
            width: calc(100% - 32px) !important;
            margin-left: 16px !important;
            margin-top: 40px !important;
            margin-bottom: 40px !important;
            padding: 60px 20px !important;
            border-radius: 16px !important;
          }
          .cta-title {
            font-size: 18px !important;
            letter-spacing: 0.5px !important;
          }
          .cta-body {
            font-size: 12px !important;
            max-width: 100% !important;
          }
          .cta-body br {
            display: none !important;
          }
          .cta-hand-img {
           display:none !important;
            width: 130px !important;
          }
        }

        /* Extra small phones */
        @media (max-width: 400px) {
          .hero-image {
           display:none !important;
            height: 210px !important;
          }
          .cta-title {
            font-size: 15px !important;
          }
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>

        {/* ═══════════════════════════════════════════════════════
            SECTION 1 — HERO
        ═══════════════════════════════════════════════════════ */}
        <section
          className="w-full hero-section"
          style={{ background: "#FFFFFF", padding: "170px 80px 52px" }}
        >
          <div className="hero-inner flex items-start gap-14">
            <div className="hero-text" style={{ flex: 1 }}>
              <h1
                className="hero-title"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 38,
                  fontWeight: 500,
                  color: "#711C31",
                  marginBottom: 22,
                  letterSpacing: "0.3px",
                }}
              >
                Avant/Après
              </h1>
              <p
                className="hero-body"
                style={{
                  fontSize: 19,
                  lineHeight: 1.5,
                  color: "#5D5153",
                  fontWeight: 500,
                  maxWidth: 520,
                }}
              >
                Notre section Avant / Après présente de véritables transformations
                de sourire réalisées grâce à des soins dentaires personnalisés.
                Chaque cas montre le sourire du patient avant le traitement et le
                résultat après des procédures telles que les aligneurs transparents,
                le blanchiment des dents, les facettes ou le collage esthétique. Ces
                comparaisons démontrent comment des problèmes comme le
                mauvais alignement, la décoloration, les espaces entre les dents ou
                les dents ébréchées peuvent être améliorés grâce aux techniques
                dentaires modernes. En présentant des résultats visuels clairs
                accompagnés d'un bref aperçu du traitement effectué, nous aidons
                les patients à comprendre les améliorations possibles pour la santé
                bucco-dentaire et l'esthétique du sourire.
              </p>
            </div>

            <div
              className="hero-image"
              style={{
                width: 480,
                height: 450,
                flexShrink: 0,
                borderRadius: 16,
                overflow: "hidden",
                background: "linear-gradient(135deg,#e8ddd0,#c5b0a0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: '1px solid #753141'
              }}
            >
              <img src="/images/heartpic.png" alt="Avant Après"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2 — FILTER TABS
        ═══════════════════════════════════════════════════════ */}
        <section
          className="filter-section"
          style={{
            background: "#FFFFFF",
            padding: "0 80px 48px",
          }}
        >
          <div className="filter-row flex flex-wrap gap-2 mb-2">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <button
                key={cat}
                className="filter-btn"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "7px 48px",
                  borderRadius: 50,
                  border: cat === activeCategory ? "none" : "1px solid #711C31",
                  background: cat === activeCategory ? "#7B2D3E" : "transparent",
                  color: cat === activeCategory ? "#FFFFFF" : "#711C31",
                  fontSize: 13,
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: cat === activeCategory ? 500 : 400,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="filter-row flex flex-wrap gap-2">
            {CATEGORIES.slice(6).map((cat) => (
              <button
                key={cat}
                className="filter-btn"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 50,
                  border: cat === activeCategory ? "none" : "1px solid #711C31",
                  background: cat === activeCategory ? "#7B2D3E" : "transparent",
                  color: cat === activeCategory ? "#ffffff" : "#711C31",
                  fontSize: 13,
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: cat === activeCategory ? 500 : 400,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 3 — RESULTS CAROUSEL
        ═══════════════════════════════════════════════════════ */}
        <section
          className="carousel-section"
          style={{
            background: "#F0F0F0",
            padding: "56px 80px 64px",
          }}
        >
          {cases.length > 0 ? (
            <CaseCarousel key={activeCategory} category={activeCategory} cases={cases} />
          ) : (
            <p
              className="text-center"
              style={{ color: "#711C31", fontSize: 14 }}
            >
              Aucun cas disponible pour cette catégorie.
            </p>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 4 — CTA
        ═══════════════════════════════════════════════════════ */}
        <div
          className="cta-wrapper"
          style={{
            backgroundImage: "url(/images/bgsub.png)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            borderRadius: 20,
            padding: "80px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
            width: "100%",
marginLeft: "0px",
            marginTop: "60px",
            marginBottom: "60px"
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              opacity: 0.9,
            }}
          >
            <img
              src="/images/shand.png"
              alt="Hand"
              className="cta-hand-img"
              style={{
                width: 220,
                objectFit: "contain",
                display: "block",
                transform: "scaleX(-1) scale(1.3) translateY(15px)",
               
              }}
            />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h2
              className="cta-title"
              style={{
                fontSize: 27,
                fontWeight: 500,
                color: "#D3D3D3",
                marginBottom: 14,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Planifiez votre visite
            </h2>

            <p
              className="cta-body"
              style={{
                fontSize: 20,
                color: "#FFFFFF",
                fontWeight: 300,
                lineHeight: 1.6,
                maxWidth: 600,
              }}
            >
              Choisissez le créneau qui vous convient et notre équipe vous accueillera dans les meilleures conditions pour votre consultation.
            </p>

            <a
              href="/pages/Appointment"
              style={{
                marginTop: 28,
                display: "inline-block",
                background: "transparent",
                border: "1.5px solid #FFFFFF",
                color: "#FFFFFF",
                padding: "13px 30px",
                borderRadius: 50,
                fontSize: 14,
                fontFamily: "'Jost', sans-serif",
                cursor: "pointer",
                textDecoration: "none",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(255,255,255,0.1)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "transparent")
              }
            >
              Prendre rendez-vous
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

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

// Each category has an array of case cards { label: "Avant"|"Après", imgSrc }
// Replace imgSrc values with your real image paths
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

// ─── Dot Carousel ─────────────────────────────────────────────────────────────
// ─── Pair Carousel (continuous infinite scroll) ────────────────────────────
function CaseCarousel({
  category,
  cases,
}: {
  category: string;
  cases: { label: string; imgSrc: string }[];
}) {
  // Build Before/After pairs: zip consecutive items
  // If items are already alternating Avant/Après, group them into pairs of 2
  const pairs: { before: { label: string; imgSrc: string }; after: { label: string; imgSrc: string } }[] = [];
  for (let i = 0; i + 1 < cases.length; i += 2) {
    pairs.push({ before: cases[i], after: cases[i + 1] });
  }
  // If odd number of cases, the last one becomes a solo pair (duplicate it)
  if (cases.length % 2 !== 0 && cases.length > 0) {
    const last = cases[cases.length - 1];
    pairs.push({ before: last, after: last });
  }

  const CARD_W = 220;
  const GAP = 12;
  const animDuration = `${pairs.length * 5}s`;
  // We duplicate the pairs array for seamless infinite loop
  const allPairs = [...pairs, ...pairs];

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
        @keyframes slideTrack {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .pair-track {
          display: flex;
          gap: ${GAP}px;
          animation: slideTrack ${animDuration} linear infinite;
        }
        .pair-track:hover {
          animation-play-state: paused;
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
      `}</style>

      <h2
        className="mb-4 text-center"
        style={{ fontSize: 28, fontWeight: 500, color: "#2c1a1a", letterSpacing: "0.5px" }}
      >
        {category}
      </h2>

      {/* Single frame — slightly wider to fit two cards */}
      <div
        style={{
          width: CARD_W * 2 + GAP + 32, // two cards + gap + padding
          border: "1.5px solid #FFD52F",
          borderRadius: 20,
          background: "#EDE5D4",
          boxShadow: "0 6px 30px rgba(0,0,0,0.10)",
          overflow: "hidden",
          padding: "14px 16px 18px",
          boxSizing: "border-box",
        }}
      >
        {/* Clipping window */}
        <div style={{ overflow: "hidden", borderRadius: 12 }}>
          {/* Sliding track — contains all pairs duplicated for seamless loop */}
          <div
            className="pair-track"
            style={{
              // Total width: (number of pairs × 2 cards each) × cardW+gap × 2 (duplicate)
              width: allPairs.length * 2 * (CARD_W + GAP),
            }}
          >
           {allPairs.map((pair, i) => (
  <Fragment key={i}>
    <div className="pair-card">
      <img src={pair.before.imgSrc} alt={pair.before.label} />
      <span className="pair-label">{pair.before.label}</span>
    </div>
    <div className="pair-card">
      <img src={pair.after.imgSrc} alt={pair.after.label} />
      <span className="pair-label">{pair.after.label}</span>
    </div>
  </Fragment>
))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AvantApresPage() {
  const [activeCategory, setActiveCategory] = useState("Dentisterie Esthétique");
  const cases = CASES[activeCategory] ?? [];

  return (
    <>
     

      <main style={{  background: "#f4eee1" }}>

        {/* ═══════════════════════════════════════════════════════
            SECTION 1 — HERO
        ═══════════════════════════════════════════════════════ */}
        <section
          className="w-full"
          style={{ background: "#FAF7F2", padding: "170px 80px 52px" }}
        >
          <div className="flex items-start gap-14">
            {/* Text */}
            <div style={{ flex: 1 }}>
              <h1
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

            {/* Hero image */}
            <div
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
              }}
            >
             
                <img src="/images/heartpic.png" alt="Avant Après"
                  style={{ width:"100%", height:"100%", objectFit:"cover" }} />
             
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2 — FILTER TABS
        ═══════════════════════════════════════════════════════ */}
        <section
          style={{
            background: "#FAF7F2",
            padding: "0 80px 48px",
          }}
        >
          {/* Row 1 */}
          <div className="flex flex-wrap gap-2 mb-2">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "7px 48px",
                  borderRadius: 50,
                  border: cat === activeCategory ? "none" : "1px solid #711C31",
                  background: cat === activeCategory ? "#7B2D3E" : "transparent",
                  color: cat === activeCategory ? "#FFD52F" : "#711C31",
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
          {/* Row 2 */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.slice(6).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 50,
                  border: cat === activeCategory ? "none" : "1px solid #711C31",
                  background: cat === activeCategory ? "#7B2D3E" : "transparent",
                  color: cat === activeCategory ? "#FFD52F" : "#711C31",
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
          style={{
            background: "#ffe9bf",
            padding: "56px 80px 64px",
          }}
        >
          {cases.length > 0 ? (
            <CaseCarousel key={activeCategory} category={activeCategory} cases={cases} />
          ) : (
            <p
              className="text-center"
              style={{ color: "#7a6050", fontSize: 14, fontStyle: "italic" }}
            >
              Aucun cas disponible pour cette catégorie.
            </p>
          )}
        </section>

               {/* ═══════════════════════════════════════════════════════
            SECTION 4 — CTA
        ═══════════════════════════════════════════════════════ */}
        {/* ── 4. CTA ── */}
     <div
  style={{
    backgroundImage:"url(/images/bgsub.png)",
    
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
    width: "calc(100% - 80px)",
    marginLeft:"40px",
    marginTop:"60px",
    marginBottom:"60px"
  }}
>
  {/* Left corner hand image */}
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
  style={{
    width: 220,
    objectFit: "contain",
    display: "block",
    transform: "scaleX(-1) scale(1.3) translateY(15px)",
    marginRight:"32px"
    
  }}
/>
  </div>

  {/* Center Content */}
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
      style={{
        fontSize: 27,
        fontWeight: 500,
        color: "#F2D9A3",
        marginBottom: 14,
        textTransform: "uppercase",
        letterSpacing: "1px",
      }}
    >
      Assurez votre consultation privée
    </h2>

    <p
      style={{
        fontSize: 20,
        color: "rgba(255,255,255,0.85)",
        fontWeight: 300,
        lineHeight: 1.6,
        maxWidth: 600,
      }}
    >
      Sélectionnez un horaire qui vous convient, et notre équipe
      <br />
      préparera une présentation adaptée pour votre session.
    </p>

    <a
      href="/pages/Appointment"
      style={{
        marginTop: 28,
        display: "inline-block",
        background: "transparent",
        border: "1.5px solid #FFD52F",
        color: "#F2D9A3",
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

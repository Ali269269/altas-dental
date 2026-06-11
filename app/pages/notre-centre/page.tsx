"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── SLIDE DATA ─────────────────────────────────────────────────────────────
const SPACE_SLIDES = [
  { id: 1, src: "/images/scard1.jpg", alt: "Salle de traitement 1" },
  { id: 2, src: "/images/scard2.jpg", alt: "Salle de traitement 2" },
  { id: 3, src: "/images/scard3.jpg", alt: "Salle d'attente" },
];

// ─── CAROUSEL ───────────────────────────────────────────────────────────────
function ExploreCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = SPACE_SLIDES.length;
  const [isTablet, setIsTablet] = useState(false);
useEffect(() => {
  const checkSize = () => {
    setIsTablet(window.innerWidth >= 426 && window.innerWidth <= 768);
  };

  checkSize(); // run on mount
  window.addEventListener("resize", checkSize);

  return () => window.removeEventListener("resize", checkSize);
}, []);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goTo = useCallback(
    (idx: number, dir?: "left" | "right") => {
      if (animating || idx === current) return;
      setDirection(dir ?? (idx > current ? "right" : "left"));
      setAnimating(true);
      setTimeout(() => {
        setCurrent(idx);
        setAnimating(false);
        setDirection(null);
      }, 350);
    },
    [animating, current]
  );

  const next = useCallback(() => goTo((current + 1) % total, "right"), [current, goTo, total]);
  const prev = useCallback(() => goTo((current - 1 + total) % total, "left"), [current, goTo, total]);

  useEffect(() => {
    autoRef.current = setInterval(next, 4000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [next]);

  const pause = () => { if (autoRef.current) clearInterval(autoRef.current); };
  const resume = () => { autoRef.current = setInterval(next, 4000); };

  const prevIdx = (current - 1 + total) % total;
  const nextIdx = (current + 1) % total;

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "0 16px", boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: "100%", borderRadius: 14, overflow: "hidden", background: "#c5b0a0" }}
          onTouchStart={pause}
          onTouchEnd={resume}
        >
          <div style={{
            width: "100%",
            height: isTablet ? 320 : 220,
            opacity: animating ? 0.75 : 1,
            transition: "opacity 0.35s ease, transform 0.35s ease",
            transform: animating
              ? `translateX(${direction === "right" ? "-12px" : "12px"})`
              : "translateX(0)",
          }}>
            <SlideImage slide={SPACE_SLIDES[current]} fill />
          </div>
          <button onClick={prev} style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.7)", border: "none", borderRadius: "50%",
            width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 16, color: "#711C31",
          }}>‹</button>
          <button onClick={next} style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.7)", border: "none", borderRadius: "50%",
            width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 16, color: "#711C31",
          }}>›</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          {SPACE_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === current ? 32 : 10, height: 6, borderRadius: 3,
              border: "none", outline: "none", cursor: "pointer",
              background: i === current ? "#7B2D3E" : "#cfc4b9",
              transition: "all 0.3s ease", padding: 0,
            }} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="explore-carousel" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="explore-carousel-track"
        onMouseEnter={pause}
        onMouseLeave={resume}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          overflow: "hidden",
          position: "relative",
          userSelect: "none",
        }}
      >
        <div className="explore-slide left" onClick={prev}
          style={{
            width: 310, height: 260, flexShrink: 0, borderRadius: 14, overflow: "hidden",
            cursor: "pointer",
            opacity: animating ? 0.5 : 0.7,
            transition: "opacity 0.45s ease, transform 0.45s ease",
            transform: animating && direction === "left" ? "translateX(20px) scale(1.02)" : "translateX(0) scale(1)",
            zIndex: 1, marginRight: 2,
          }}
        >
          <SlideImage slide={SPACE_SLIDES[prevIdx]} fill />
        </div>
        <div className="explore-slide center"
          style={{
            width: 820, height: 399, flexShrink: 0, borderRadius: 14, overflow: "hidden",
            zIndex: 2, margin: "0 18px",
            opacity: animating ? 0.85 : 1,
            transition: "opacity 0.45s ease, transform 0.45s ease",
            transform: animating
              ? `scale(0.97) translateX(${direction === "right" ? "-12px" : direction === "left" ? "12px" : "0"})`
              : "scale(1) translateX(0)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          }}
        >
          <SlideImage slide={SPACE_SLIDES[current]} fill />
        </div>
        <div className="explore-slide right" onClick={next}
          style={{
            width: 310, height: 260, flexShrink: 0, borderRadius: 14, overflow: "hidden",
            cursor: "pointer",
            opacity: animating ? 0.5 : 0.7,
            transition: "opacity 0.45s ease, transform 0.45s ease",
            transform: animating && direction === "right" ? "translateX(-20px) scale(1.02)" : "translateX(0) scale(1)",
            zIndex: 1, marginLeft: -1,
          }}
        >
          <SlideImage slide={SPACE_SLIDES[nextIdx]} fill />
        </div>
      </div>
      <div className="explore-dots" style={{ display: "flex", gap: 8, marginTop: 28 }}>
        {SPACE_SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === current ? 32 : 10, height: 6, borderRadius: 3,
            border: "none", outline: "none", cursor: "pointer",
            background: i === current ? "#7B2D3E" : "#cfc4b9",
            transition: "all 0.3s ease", padding: 0,
          }} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

// ─── SLIDE IMAGE ─────────────────────────────────────────────────────────────
function SlideImage({ slide, fill }: { slide: { src: string; alt: string }; fill?: boolean }) {
  return (
    <img
      src={slide.src}
      alt={slide.alt}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      onError={(e) => {
        const target = e.currentTarget as HTMLImageElement;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent && !parent.querySelector(".ph")) {
          const ph = document.createElement("div");
          ph.className = "ph";
          ph.style.cssText =
            "width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#c5b8a8,#9e8e7e);color:rgba(255,255,255,0.6);font-size:12px;font-family:sans-serif;";
          ph.textContent = slide.alt;
          parent.appendChild(ph);
        }
      }}
    />
  );
}

// ─── STEP CARD ───────────────────────────────────────────────────────────────
interface StepCardProps {
  num: number;
  title: string;
  body: string;
  imgSrc?: string;
  imgAlt?: string;
}

function StepCard({ num, title, body, imgSrc, imgAlt }: StepCardProps) {
  return (
    <div
      className="step-card"
      style={{
        background: "#6B1E30",
        borderRadius: 16,
        overflow: "hidden",
        color: "#fff",
        paddingBottom: 16,
        display: "flex",
        flexDirection: "column",
        border: "1px solid #753141",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px 14px" }}>
        <div style={{
          width: 26, height: 26, border: "1px solid #FFFFFF", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 600, flexShrink: 0,
        }}>
          {num}
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.3px" }}>{title}</span>
      </div>
      <div
        className="step-card-image"
        style={{
          width: "calc(100% - 32px)",
          height: 180,
          border: "1px solid #FFFFFF",
          overflow: "hidden",
          background: "linear-gradient(135deg,#8a3a50 0%,#5a1e2c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.4)",
          fontSize: 12,
          borderRadius: "14px",
          margin: "0 auto",
        }}
      >
        {imgSrc ? (
          <img src={imgSrc} alt={imgAlt ?? title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span>Place image URL</span>
        )}
      </div>
      <p style={{
        padding: "12px 20px 0",
        fontSize: 14,
        lineHeight: 1.45,
        color: "rgba(255,255,255,0.88)",
        fontWeight: 400,
        margin: 0,
      }}>
        {body}
      </p>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function NotreCentrePage() {
  return (
    <main className="notre-centre-main" style={{ background: "#f4eee1", color: "#2c1a1a" }}>

      <style>{`

        /* ══════════════════════════════════════════════
           LARGE DESKTOPS  1441px+
        ══════════════════════════════════════════════ */

        .cta-wrapper {
  margin: 0 auto 80px auto !important; 
  max-width: 1200px;   /* key fix */
  width: 100% !important;
  box-sizing: border-box;
}
        @media (min-width: 1441px) {
          .notre-centre-hero {
            padding: 200px 120px 70px !important;
            gap: 120px !important;
          }
          .notre-centre-image {
            width: 600px !important;
            height: 430px !important;
          }
          .notre-centre-whattoexpect {
            padding: 60px 160px 90px !important;
          }
          .notre-centre-explore {
            padding: 70px 0 80px !important;
          }
          .cta-wrapper {

               @media (max-width: 1280px) and (min-width: 1025px) {
          .notre-centre-hero {
            gap: 60px !important;
            padding: 160px 40px 50px !important;
          }
          .notre-centre-image {
            width: 400px !important;
            height: 320px !important;
          }
          .notre-centre-whattoexpect {
            padding: 50px 50px 60px !important;
          }
          .howto-grid {
            gap: 18px !important;
          }
          .cta-wrapper {
            padding: 70px 60px !important;
          }
        }
          }
        }

        /* ══════════════════════════════════════════════
           SMALL LAPTOPS  1025px – 1280px
        ══════════════════════════════════════════════ */
        @media (max-width: 1280px) and (min-width: 1025px) {
          .notre-centre-hero {
            gap: 60px !important;
            padding: 160px 40px 50px !important;
          }
          .notre-centre-image {
            width: 400px !important;
            height: 320px !important;
          }
          .notre-centre-whattoexpect {
            padding: 50px 50px 60px !important;
          }
          .howto-grid {
            gap: 18px !important;
          }
          .cta-wrapper {
             padding: 70px 40px !important;
  margin: 0 auto !important;
  width: calc(100% - 80px) !important; /* creates left + right gap */
  box-sizing: border-box;
          }
        }

        /* ══════════════════════════════════════════════
           TABLETS  769px – 1024px
        ══════════════════════════════════════════════ */
        @media (max-width: 1024px) and (min-width: 769px) {
          /* Hero: stack to column, center-aligned */
          .notre-centre-hero {
            flex-direction: row !important;
            gap: 36px !important;
            padding: 170px 40px 50px !important;
            align-items: center !important;
          }
          .notre-centre-text {
            flex: unset !important;
            width: 100% !important;
          }
          .notre-centre-text h2 {
            margin-left: 0 !important;
            text-align: center !important;
          }
          .notre-centre-text p {
            margin-left: 0 !important;
            text-align: center !important;
          }
          .notre-centre-image {
            width: 100% !important;
            height: 300px !important;
            flex-shrink: unset !important;
            margin-right: 0 !important;
          }

          /* Step cards: 2-column grid */
          .notre-centre-whattoexpect {
            padding: 40px 40px 60px !important;
          }
          .notre-centre-whattoexpect h2 {
            margin-bottom: 28px !important;
          }
          .howto-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 14px !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 auto;
  padding: 0 !important;
}

/* slightly increase card width feel */
.step-card {
  padding-bottom: 10px !important;
  overflow: hidden !important;
  min-height: auto !important;
}

/* keep image same */
.step-card-image {
  margin-top: -170px !important;
  height: 70px !important;
  margin-bottom: -8px !important;
}

/* keep header same */
.step-card > div:first-child {
  padding: 6px 10px !important;
  transform: translateY(-80px) !important;
}

/* text alignment fix */
.step-card h3 {
  font-size: 14px !important;
  line-height: 1.3 !important;
  margin-bottom: 4px !important;

  /* helps equal alignment across cards */
  min-height: 36px !important;
}

/* IMPORTANT: equal paragraph alignment */
.step-card p {
  margin-top: 2px !important;
  margin-bottom: 0 !important;
  font-size: 12px !important;
  line-height: 1.4 !important;

  /* key fix for equal ending line */
  min-height: 60px !important;

  display: flex !important;
  align-items: flex-start !important;
}

          /* Explore carousel: already handles tablet via desktop branch */
          .notre-centre-explore {
            padding: 50px 0 60px !important;
          }
          .notre-centre-explore h2 {
            padding: 0 40px !important;
          }

          /* CTA */
          .cta-wrapper {
            width: calc(100% - 80px) !important;
            margin-left: 40px !important;
            margin-top: 50px !important;
            margin-bottom: 50px !important;
            padding: 70px 40px !important;
            border-radius: 18px !important;
          }
          .cta-title {
            font-size: 22px !important;
          }
          .cta-body {
            font-size: 17px !important;
          }
        }

        /* ══════════════════════════════════════════════
           LARGE MOBILE  481px – 768px
           (exact original rules — untouched)
        ══════════════════════════════════════════════ */
       @media (min-width: 426px) and (max-width: 768px) {

          /* ── Section 1: Hero ── */
          .notre-centre-hero {
            flex-direction: column !important;
            gap: 28px !important;
            padding: 150px 20px 40px !important;
            align-items: center !important;
          }
          .notre-centre-text {
            flex: unset !important;
            width: 100% !important;
          }
          .notre-centre-text h2 {
            font-size: 22px !important;
            margin-left: 0 !important;
            text-align: center !important;
          }
          .notre-centre-text p {
            font-size: 15px !important;
            margin-left: 0 !important;
            text-align: center !important;
          }
          .notre-centre-image {
            width: 100% !important;
            height: 330px !important;
            flex-shrink: unset !important;
            margin-right: 0 !important;
          }

          /* ── Section 2: What to expect ── */
          .notre-centre-whattoexpect {
            padding: 30px 16px 48px !important;
          }
          .notre-centre-whattoexpect h2 {
            font-size: 22px !important;
            margin-bottom:24px !important;
          }
      .howto-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 14px !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 auto;
  padding: 0 !important;
}

/* slightly increase card width feel */
.step-card {
  padding-bottom: 10px !important;
  overflow: hidden !important;
  min-height: auto !important;
}

/* keep image same */
.step-card-image {
  margin-top: -170px !important;
  height: 70px !important;
  margin-bottom: -8px !important;
}

/* keep header same */
.step-card > div:first-child {
  padding: 6px 10px !important;
  transform: translateY(-80px) !important;
}

/* text alignment fix */
.step-card h3 {
  font-size: 14px !important;
  line-height: 1.3 !important;
  margin-bottom: 4px !important;

  /* helps equal alignment across cards */
  min-height: 36px !important;
}

/* IMPORTANT: equal paragraph alignment */
.step-card p {
  margin-top: 2px !important;
  margin-bottom: 0 !important;
  font-size: 12px !important;
  line-height: 1.4 !important;

  /* key fix for equal ending line */
  min-height: 60px !important;

  display: flex !important;
  align-items: flex-start !important;
}
          /* ── Section 3: Explore carousel ── */
          .notre-centre-explore {
            padding: 40px 0 50px !important;
          }
          .notre-centre-explore h2 {
            font-size: 22px !important;
            margin-bottom: 24px !important;
            padding: 0 16px !important;
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
            font-size: 15px !important;
            max-width: 100% !important;
          }
          .cta-body br {
            display: none !important;
          }
          .cta-hand-img {
            display: none !important;
            
          }
        }

        /* ══════════════════════════════════════════════
           SMALL MOBILE  320px – 480px
           Inherits the 768px block above; only patch
           what overflows at narrower widths.
        ══════════════════════════════════════════════ */
        @media (max-width: 480px) {
          .notre-centre-hero {
            padding: 120px 16px 32px !important;
            gap: 20px !important;
          }
          .notre-centre-text h2 {
            font-size: 20px !important;
          }
          .notre-centre-text p {
            font-size: 14px !important;
          }
          .notre-centre-image {
            height: 200px !important;
          }

          .notre-centre-whattoexpect {
            padding: 24px 12px 36px !important;
          }
          .notre-centre-whattoexpect h2 {
            font-size: 20px !important;
          }
           .howto-grid {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
    max-width: 390px !important;
    margin: 0 auto;
  }

  .step-card {
    padding-bottom: 10 !important;
    min-height: auto !important;
    overflow: hidden !important;
  }

  .step-card-image {
    height: 70px !important;
    margin-top: -150px !important;
    margin-bottom: 2px !important;
   
  }

  .step-card > div:first-child {
    padding: 6px 10px !important;
    transform: translateY(-67px) !important;
  }

  .step-card h3 {
    font-size: 14px !important;
    margin-bottom: 4px !important;
    line-height: 1.2 !important;
  }

  .step-card p {
    font-size: 12px !important;
    line-height: 1.4 !important;
    margin-top: 2px !important;
    margin-bottom: 0 !important;
  }


          .notre-centre-explore {
            padding: 30px 0 40px !important;
          }
          .notre-centre-explore h2 {
            font-size: 20px !important;
            padding: 0 12px !important;
          }

          .cta-wrapper {
            width: calc(100% - 24px) !important;
            margin-left: 12px !important;
            margin-top: 28px !important;
            margin-bottom: 28px !important;
            padding: 48px 16px !important;
            border-radius: 14px !important;
          }
          
          .cta-title {
            font-size: 16px !important;
          }
          .cta-body {
            font-size: 12px !important;
          }
            .cta-hand-img {
            display: none !important;
            
          }
        }

        /* Extra small phones — original rule kept intact */
        @media (max-width: 400px) {
          .hero-image {
            height: 210px !important;
          }
          .cta-title {
            font-size: 15px !important;
          }
        }

        /* ══════════════════════════════════════════════
           SAFETY NET  < 320px
        ══════════════════════════════════════════════ */
        @media (max-width: 319px) {
          .notre-centre-hero {
            padding: 100px 12px 24px !important;
          }
          .notre-centre-text h2 {
            font-size: 18px !important;
          }
          .notre-centre-text p {
            font-size: 13px !important;
          }
          .notre-centre-image {
            height: 170px !important;
          }
          .cta-wrapper {
            width: calc(100% - 16px) !important;
            margin-left: 8px !important;
            padding: 36px 12px !important;
          }
          .cta-title {
            font-size: 14px !important;
          }
          .cta-body {
            font-size: 13px !important;
          }
        }
      `}</style>

      {/* ── 1. NOTRE CENTRE ── */}
      <section className="notre-centre-hero"
        style={{
          display: "flex",
          gap: 100,
          alignItems: "flex-start",
          padding: "180px 50px 50px",
          background: "#FFFFFF",
        }}
      >
        <div className="notre-centre-text" style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: 25,
              fontWeight: 600,
              marginBottom: 22,
              letterSpacing: "0.5px",
              color: "#711C31",
              marginLeft: "26px",
            }}
          >
            Notre centre
          </h2>
          <div
            className="notre-centre-text-desc"
            style={{
              marginLeft: "26px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.2, color: "#5D5153" }}>
              <span className="font-bold">Atlas Dental Center a été </span>
              conçu selon les standards les plus exigeants de la dentisterie moderne.
              Pensé pour offrir une expérience de soins optimale, notre centre intègre les
              dernières avancées technologiques en matière de diagnostic, d’imagerie et de dentisterie numérique.
              Équipé d’un scanner intra-oral, d’une radiologie numérique de haute précision, d’un laser et de technologies 3D,
              il permet une prise en charge plus précise, plus confortable et plus efficace.
            </p>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.2, color: "#5D5153" }}>
              L’architecture du centre a été imaginée pour allier innovation, fonctionnalité et sérénité.
              Chaque espace a été conçu avec soin afin d’offrir un environnement élégant, apaisant et parfaitement adapté
              aux exigences de la pratique moderne.
            </p>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.2, color: "#5D5153" }}>
              À travers ses équipements de dernière génération et son engagement constant envers l’innovation,
              Atlas Dental Center incarne une vision moderne de la dentisterie, où technologie, précision et excellence
              se rencontrent au service de chaque patient.
            </p>
          </div>
        </div>

        <div className="notre-centre-image"
          style={{
            width: 500,
            height: 370,
            flexShrink: 0,
            borderRadius: 12,
            overflow: "hidden",
            background: "linear-gradient(135deg,#e8ddd0,#d4c5b5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontSize: 13,
            marginRight: "30px",
            border: "1px solid #753141",
          }}
        >
          <img src="/images/notrecenter.jpeg" alt="Notre centre" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </section>

      {/* ── 2. À QUOI S'ATTENDRE ── */}
      <section className="notre-centre-whattoexpect" style={{ background: "#FFFFFF", padding: "50px 80px 70px" }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 500,
            textAlign: "center",
            marginBottom: 40,
            letterSpacing: "1px",
            color: "#711C31",
          }}
        >
          À quoi s&apos;attendre...
        </h2>

        <div className="howto-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          <StepCard
            num={1}
            title="Avant votre visite"
            imgSrc="/images/visit3.png"
            body="La prise de rendez-vous est simple et rapide. Vous pouvez réserver directement en ligne via notre site internet, nous contacter sur WhatsApp ou joindre notre 
équipe par téléphone grâce à nos deux numéros dédiés. Nous restons à votre 
disposition pour vous accompagner et répondre à toutes vos questions avant 
votre visite."
          />
          <StepCard
            num={2}
            title="Dans le studio"
            imgSrc="/images/visit2.png"
            body="Vous serez accueilli dans un environnement calme et moderne, conçu pour 
votre confort. Chaque consultation débute par une écoute attentive de vos 
besoins, suivie d’un examen clinique approfondi et, si nécessaire, d’examens 
complémentaires réalisés à l’aide de nos technologies de pointe. Nous prenons le temps de vous expliquer clairement les différentes options de traitement 
afin que vous puissiez prendre vos décisions en toute confiance."
          />
          <StepCard
            num={3}
            title="Après ton départ"
            imgSrc="/images/visite1.png"
            body="À l’issue de votre rendez-vous, vous recevrez toutes les recommandations nécessaires au bon suivi de votre traitement. Notre équipe reste disponible pour répondre à vos interrogations et assurer un accompagnement 
personnaliséet rigoureux."
          />
        </div>
      </section>

      {/* ── 3. EXPLORE OUR SPACE ── */}
      <section className="notre-centre-explore" style={{ background: "#F0F0F0", padding: "60px 0 70px", overflow: "hidden" }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 500,
            textAlign: "center",
            marginBottom: 40,
            letterSpacing: "1px",
            color: "#711C31",
          }}
        >
          Explore our space
        </h2>
        <ExploreCarousel />
      </section>

      {/* ── 4. CTA ── */}
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
  );
}

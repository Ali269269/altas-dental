"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── SLIDE DATA ─────────────────────────────────────────────────────────────
// Replace `src` with your real image paths/URLs
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
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = SPACE_SLIDES.length;

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

  // Auto-advance
  useEffect(() => {
    autoRef.current = setInterval(next, 4000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [next]);

  const pause = () => { if (autoRef.current) clearInterval(autoRef.current); };
  const resume = () => { autoRef.current = setInterval(next, 4000); };

  const prevIdx = (current - 1 + total) % total;
  const nextIdx = (current + 1) % total;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Track */}
      <div
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
        {/* Left cropped slide */}
        <div
          onClick={prev}
          style={{
            width: 310,
            height: 260,
            flexShrink: 0,
            borderRadius: 14,
            overflow: "hidden",
            cursor: "pointer",
            opacity: animating ? 0.5 : 0.7,
            transition: "opacity 0.45s ease, transform 0.45s ease",
            transform: animating && direction === "left" ? "translateX(20px) scale(1.02)" : "translateX(0) scale(1)",
            zIndex: 1,
            marginRight: 2,
          }}
        >
          <SlideImage slide={SPACE_SLIDES[prevIdx]} fill />
        </div>

        {/* Center active slide */}
        <div
          style={{
            width: 820,
            height: 399,
            flexShrink: 0,
            borderRadius: 14,
            overflow: "hidden",
            zIndex: 2,
            margin: "0 18px",
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

        {/* Right cropped slide */}
        <div
          onClick={next}
          style={{
            width: 310,
            height: 260,
            flexShrink: 0,
            borderRadius: 14,
            overflow: "hidden",
            cursor: "pointer",
            opacity: animating ? 0.5 : 0.7,
            transition: "opacity 0.45s ease, transform 0.45s ease",
            transform: animating && direction === "right" ? "translateX(-20px) scale(1.02)" : "translateX(0) scale(1)",
            zIndex: 1,
            marginLeft: -1,
          }}
        >
          <SlideImage slide={SPACE_SLIDES[nextIdx]} fill />
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
        {SPACE_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 32 : 10,
              height: 6,
              borderRadius: 3,
              border: "none",
              outline: "none",
              cursor: "pointer",
              background: i === current ? "#7B2D3E" : "#cfc4b9",
              transition: "all 0.3s ease",
              padding: 0,
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SLIDE IMAGE ─────────────────────────────────────────────────────────────
function SlideImage({ slide, fill }: { slide: { src: string; alt: string }; fill?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={slide.src}
      alt={slide.alt}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
      onError={(e) => {
        // Fallback placeholder if image not found
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
  imgSrc?: string; // Replace with your image path
  imgAlt?: string;
}

function StepCard({ num, title, body, imgSrc, imgAlt }: StepCardProps) {
  return (
    <div
      style={{
        background: "#6B1E30",
        borderRadius: 16,
        overflow: "hidden",
        color: "#fff",
        paddingBottom: 24,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px 14px" }}>
        <div
          style={{
            width: 26,
            height: 26,
           border: "1px solid #FFD52F",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {num}
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.3px" }}>{title}</span>
      </div>

      {/* Image */}
      <div
        style={{
         width: "calc(100% - 50px)",
          height: 290,
          border: "1px solid #FFD52F",
          overflow: "hidden",
          background: "linear-gradient(135deg,#8a3a50 0%,#5a1e2c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.4)",
          fontSize: 12,
          borderRadius:"20px 20px 20px 20px",
          margin: "0 auto",

        }}
      >
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt={imgAlt ?? title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span>Place image URL</span>
        )}
      </div>

      {/* Body */}
      <p
        style={{
          padding: "18px 28px 0",
          fontSize: 16.5,
          lineHeight: 1.2,
          color: "rgba(255,255,255,0.88)",
          fontWeight: 400,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function NotreCentrePage() {
  return (
    <main style={{ background: "#f4eee1", color: "#2c1a1a" }}>
      {/* Google Font import – add to your _document or layout instead */}
     

      {/* ── 1. NOTRE CENTRE ── */}
      <section
        style={{
          display: "flex",
          gap: 100,
        
          alignItems: "flex-start",
          padding: "180px 50px 50px",
          background: "#f4eee1",
        }}
      >
        {/* Text */}
        <div style={{ flex: 1 }}>
          <h2
            style={{
              
              fontSize: 25,
              fontWeight: 600,
              marginBottom: 22,
              letterSpacing: "0.5px",
              color: "#711C31",
              marginLeft:"26px"
            }}
          >
            Notre centre
          </h2>
          <p
            style={{
            
              fontSize: 19.8,
              lineHeight: 1.2,
              color: "#5D5153",
               marginLeft:"26px"
              
            
            }}
          >
            Dans notre clinique dentaire, vous recevez des soins clairs et pratiques axés sur la
            santé bucco-dentaire à long terme. Nous proposons des contrôles de routine, des
            nettoyages professionnels, des obturations, des traitements cosmétiques et des
            procédures restauratrices en utilisant des équipements modernes et des normes
            d&apos;hygiène strictes. Chaque visite commence par un examen minutieux afin que des
            problèmes comme les caries, les problèmes de gencives ou les dommages à l&apos;émail soient
            identifiés tôt. Les options de traitement sont expliquées en termes simples afin que vous
            puissiez prendre des décisions éclairées concernant vos soins. Notre objectif est simple :
            garder vos dents saines, fonctionnelles et d&apos;apparence naturelle tout en rendant chaque
            rendez-vous efficace et confortable. 🦷✨
          </p>
        </div>

        {/* Image — replace src with your path */}
        <div
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
            marginRight:"30px"
          
         
          }}
        >
         <img src="/images/ourcenter.jpg" alt="Notre centre" style={{width:"100%",height:"100%",objectFit:"cover"}}/> 
        
        </div>
      </section>

      {/* ── 2. À QUOI S'ATTENDRE ── */}
      <section style={{ background: "#f4eee1", padding: "50px 80px 70px" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          <StepCard
            num={1}
            title="Avant votre visite"
             imgSrc="/images/center1.png"
            body="Prenez rendez-vous en quelques secondes grâce à la réservation en ligne en temps réel. Nous vous envoyons par SMS des formulaires sécurisés et un rapide contrôle des avantages d'assurance afin que vous arriviez sans clipboard."
          />
          <StepCard
            num={2}
            title="Dans le studio"
            imgSrc="/images/center2.jpg"
            body="Votre premier rendez-vous comprend un nettoyage complet, un examen complet et des radiographies numériques ultra rapides. Besoin d'une distraction ? Diffusez Netflix, Prime ou Spotify au-dessus pendant que nous travaillons."
          />
          <StepCard
            num={3}
            title="Après ton départ"
            imgSrc="/images/center3.jpg"
            body="Il y a de fortes chances que vous vous surpreniez à penser : « Attendez, c'était merveilleux ! » (Nous espérons que vous parlerez de votre expérience à vos amis aussi !) À la prochaine fois !"
          />
        </div>
      </section>

      {/* ── 3. EXPLORE OUR SPACE ── */}
      <section style={{ background: "#ffe9bf", padding: "60px 0 70px", overflow: "hidden" }}>
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
      href="#"
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
  );
}

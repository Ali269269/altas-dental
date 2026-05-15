"use client";

import { useState, useEffect, useRef } from "react";

// ─── Accordion Card Data ──────────────────────────────────────────────────────
const CARDS = [
  {
    id: 0,
    label: "Facettes",
    desc: "Il comprend de la porcelaine et du zirconium : la référence pour un « sourire hollywoodien ». Incluez une répartition du processus et la durabilité des matériaux.",
    imgSrc: "/images/scard1.png", // replace with your image path
    imgAlt: "Facettes",
    accent: "#7B2D3E",
  },
  {
    id: 1,
    label: "Blanchiment des dents",
    desc: "Un traitement professionnel pour des dents jusqu'à 8 tons plus blanches, sécurisé et durable.",
    imgSrc: "/images/scard2.png",
    imgAlt: "Blanchiment des dents",
    accent: "#8B3A4E",
  },
  {
    id: 2,
    label: "Composite dentaire",
    desc: "Restauration esthétique directe pour corriger les imperfections avec un résultat naturel.",
    imgSrc: "/images/scard3.png",
    imgAlt: "Composite dentaire",
    accent: "#9B4A5E",
  },
  {
    id: 3,
    label: "Aligneurs transparents",
    desc: "Orthodontie discrète et amovible pour un alignement parfait sans bagues métalliques.",
    imgSrc: "/images/scard4.png",
    imgAlt: "Aligneurs transparents",
    accent: "#7B2D3E",
  },
  {
    id: 4,
    label: "Contouring gingival",
    desc: "Remodelage de la gencive pour un sourire harmonieux et équilibré.",
    imgSrc: "/images/scard5.png",
    imgAlt: "Contouring gingival",
    accent: "#8B3A4E",
  },
  {
    id: 5,
    label: "Conception numérique du sourire",
    desc: "Simulation 3D de votre futur sourire avant tout traitement.",
    imgSrc: "/images/scard6.png",
    imgAlt: "Conception numérique du sourire",
    accent: "#9B4A5E",
  },
];

// ─── Accordion Card Component ─────────────────────────────────────────────────
function AccordionCards() {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isHovered || !isVisible) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % CARDS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, isVisible]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        gap: 17,
        height: 400,
        padding: "0 80px",
        alignItems: "stretch",
        perspective: "1000px",
      }}
    >
      {CARDS.map((card, index) => {
        const isActive = active === card.id;
        return (
          <div
            key={card.id}
            onClick={() => setActive(card.id)}
            style={{
              flex: isActive ? "5 1 0%" : "0.48 1 0%",
              borderRadius: "32px",
              overflow: "hidden",
              isolation: "isolate", // Added to ensure clipping is maintained during transitions
              WebkitMaskImage: "-webkit-radial-gradient(white, black)", // Force clipping on Safari/WebKit
              cursor: isActive ? "default" : "pointer",
              transition: "flex 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              background: card.imgSrc
                ? "transparent"
                : `linear-gradient(160deg, ${card.accent} 0%, #3a1020 100%)`,
              minWidth: 0,
             transform: !isVisible
  ? "translateX(100px)"
  : "translateZ(0)",
              opacity: isVisible ? 1 : 0,
              transitionDelay: !isVisible ? `${index * 0.15}s` : "0s",
              zIndex: isActive ? 10 : 1,
              boxShadow: isActive ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "none",
            }}
          >
            {/* Background image */}
            {card.imgSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.imgSrc}
                alt={card.imgAlt}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 1.2s ease",
                  transform: isActive ? "scale(1.03)" : "scale(1)",
                }}
              />
            )}

            {/* Dark overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
            background: isActive
  ? "linear-gradient(to top, rgba(71, 12, 26, 0.80) 10%, rgba(71, 12, 26, 0.30) 60%, transparent 100%)"
  : "linear-gradient(to top, rgba(71, 12, 26, 0.80) 0%, rgba(71, 12, 26, 0.50) 100%)",
                transition: "background 0.6s ease",
              }}
            />

            {/* ── COLLAPSED STATE: rotated label ── */}
            {!isActive && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isActive ? 0 : 1,
                  transition: "opacity 0.4s ease",
                }}
              >
                <span
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 800,
                   
                    letterSpacing: "2px",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                   
                  }}
                >
                  {card.label}
                </span>
              </div>
            )}

            {/* ── EXPANDED STATE: content ── */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "40px",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s",
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              {/* Label tag */}
              <div
                style={{
                  display: "inline-block",
                  background: "#43121e",
                  
                  borderRadius: 50,
                  padding: "6px 20px",
                  marginBottom: 16,
               
                }}
              >
                <span
                  style={{
                    color: "#F0F0F0",
                    fontSize: 13,
                    fontWeight: 600,
                   
                  
                    textTransform: "uppercase",
                  }}
                >
                  {card.label}
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  color: "#fff",
                  fontSize: 17,
                  lineHeight: 1.6,
                  fontWeight: 300,
                  
                  margin: 0,
                  maxWidth: "80%",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {card.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Bullet Point ──────────────────────────────────────────────────────────────
function BulletItem({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span
        style={{
          color: "#4F1422",
          fontSize: 16,
          fontWeight: 700,
          flexShrink: 0,
          marginTop: 1,
          
        }}
      >
        ›
      </span>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.35,
          color: "#5D5153",
          fontWeight: 300,
          
          margin: 0,
        }}
      >
        <strong style={{ fontWeight: 540,fontSize:"19px", color: "#4F1422",fontFamily: "var(--font-seasons)", }}>{title}</strong>
        {" "}{text}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DentisterieEsthetiquePage() {
  return (
    <>
     
      

      <main style={{ background: "#FAF7F2" }}>

        {/* ══════════════════════════════════════════════════════════
            SECTION 1 — HERO
        ══════════════════════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            width: "100%",
            height: 380,
            marginTop: "120px",
            background: "linear-gradient(135deg,#3a1a20 0%,#1a0a10 100%)",
            overflow: "hidden",
          }}
        >
        
        <div>
          
        </div>
            <img src="/images/heroimg1.jpg" alt="Dentisterie Esthétique"
              style={{ width:"100%", height:"100%", objectFit:"cover",   objectPosition: "center 44%" ,transform:"scaleX(-1)"}} />
          
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg,#5a2030 0%,#1a0a10 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.15)",
              fontSize: 13,
            }}
          >
       
          </div>

          {/* Dark gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, rgba(0,0,0,0.70) 60%, rgba(0,0,0,0.70) 60%)",
            }}
          />

          {/* Title bottom-left */}
          <div
            style={{
              position: "absolute",
              bottom: 132,
              left: 48,
            }}
          >
            <h1
  style={{
    fontSize: 28,
    fontWeight: 500,
    color: "#F2E5C5",
    lineHeight: 1.2,
  }}
>
  <span style={{ fontWeight: 600 }}>
    Dentisterie Esthétique
  </span>

  <span
    style={{
      fontWeight: 500,
      fontSize: 16,
      color: "#F2E5C5",
      
      display: "inline-block",
    }}
  >
    {" "}(facettes, blanchiment) sous microscope
  </span>
</h1>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 2 — BURGUNDY INTRO
        ══════════════════════════════════════════════════════════ */}
        <section
          style={{
            background: "#711C31",
            padding: "56px 160px",
            textAlign: "center",
          }}
        >
          
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "#F2E5C5",
              fontWeight: 300,
              maxWidth: 700,
              margin: "0 auto 28px",
            }}
          >
            Les traitements de dentisterie esthétique, en particulier la pose de facettes en porcelaine et le
            blanchiment professionnel des dents, sont grandement améliorés lorsqu'ils sont réalisés sous la haute
            magnification et l'éclairage supérieur d'un microscope dentaire. Cette technique avancée permet au
            dentiste esthétique d'effectuer la préparation des dents avec une précision extrême, en préservant un
            maximum d'émail naturel tout en assurant un ajustement impeccable et parfait au niveau de la gencive
            pour des facettes à la fois belles et durables.
          </p>
 
          {/* Decorative divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: 8,
            }}
          >
            <div style={{ width: 60, height: 1, background: "#C9A96E" }} />
            <span style={{ color: "#C9A96E", fontSize: 14 }}>★</span>
            <div style={{ width: 60, height: 1, background: "#C9A96E" }} />
          </div>
   <div
  style={{
    position: "absolute",
    bottom: -180,
    left: 0,
    right: 0,

    /* smaller height */
    height: "170px",

    /* stronger at bottom only */
    background:
      "linear-gradient(to top, rgba(36, 5, 15, 0.95) 0%, rgba(36, 5, 15, 0.55) 35%, transparent 100%)",

    pointerEvents: "none",
    zIndex: 1,
  }}
/>

        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 3 — WHY ATLAS (image + bullet points)
        ══════════════════════════════════════════════════════════ */}
        <section
          style={{
            background: "#FAF7F2",
            padding: "72px 0px",
            display: "flex",
            gap: 64,
            alignItems: "flex-start",
          }}
        >
          {/* Left image */}
          <div
            style={{
              width: 600,
              flexShrink: 0,
              borderRadius: "1px 100px 100px 1px",
              overflow: "hidden",
              height: 430,
              border:"1px solid #FFD52F",
             
              background: "linear-gradient(135deg,#d4c5a9,#9e8070)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.3)",
              fontSize: 12,
            }}
          >
          
            
              <img src="/images/afterimg.jpg" alt="Clinique"
                style={{ width:"100%", height:"100%", objectFit:"cover"  }} />
          
          </div>

          {/* Right content */}
          <div style={{ flex: 1, paddingTop: 8, paddingRight:60 }}>
            <h2
              style={{
               
                fontSize: 26,
                fontWeight: 600,
                color: "#711C31",
                marginBottom: 18,
                lineHeight: 1.25,
                letterSpacing: "0.1px",
              }}
            >
              Choisissez Atlas Dental Center pour la
              <br />dentisterie esthétique
            </h2>
            <p
              style={{
                fontSize: 16.5,
                lineHeight: 1.4,
                color: "#5D5153",
                fontWeight: 500,
                marginBottom: 28,
                paddingRight:50
              }}
            >
              En utilisant une technologie microscopique de pointe, la clinique
              privilégie la préservation de votre structure dentaire naturelle tout en
              obtenant une finition impeccable et haut de gamme.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <BulletItem
                title="Précision microscopique :"
                text="Chaque facette est posée sous forte amplification pour garantir un ajustement parfait et sans couture au niveau de la gencive."
              />
              <BulletItem
                title="Planification numérique du sourire :"
                text="La numérisation 3D avancée vous permet de prévisualiser et d'approuver votre nouveau sourire avant le début de tout traitement."
              />
              <BulletItem
                title="Prothodontistes experts :"
                text="Les traitements sont dirigés par des spécialistes qui se concentrent sur la santé à long terme et l'harmonie architecturale de vos dents."
              />
              <BulletItem
                title="Minimement invasif :"
                text="Les techniques modernes assurent des résultats maximum avec un enlèvement minimal de l'émail naturel."
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 4 — ACCORDION CARDS
        ══════════════════════════════════════════════════════════ */}
        <section
          style={{
            background: "#FAF7F2",
            paddingBottom: 64,
          }}
        >
          {/* Section title */}
          <h2
            style={{
              
              fontSize: 28,
              fontWeight: 600,
              color: "#711C31",
              textAlign: "center",
              marginBottom: 40,
              letterSpacing: "0.5px",
            }}
          >
            Dentisterie Esthétique
          </h2>

          <AccordionCards />
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 5 — CTA
        ══════════════════════════════════════════════════════════ */}
        <section
          style={{
            background: "#FAF7F2",
            padding: "0px 80px 72px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <a
            href="/pages/Appointment"
            style={{
              display: "inline-block",
              background: "#43121e",
              color: "#F2D9A3",
              padding: "14px 36px",
              borderRadius: 50,
              fontSize: 14,
            
              fontWeight: 500,
              textDecoration: "none",
              letterSpacing: "0.3px",
              
            }}
           
          >
            Prendre rendez-vous
          </a>
        </section>

      </main>
    </>
  );
}

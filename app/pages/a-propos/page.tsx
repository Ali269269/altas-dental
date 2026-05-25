"use client";
import Link from "next/link";

// ─── Icons ───────────────────────────────────────────────────────────────────
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Speciality icons (simple SVG)
function ScissorsIcon() {
  return (
    <img
      className="w-5 brightness-0 invert"
      src="/images/iconb1.png"
      alt="Scissors Icon"
    />
  );
}

function LeafIcon() {
  return (
    <img
      className="w-4 brightness-0 invert"
      src="/images/Iconb2.png"
      alt="Leaf Icon"
    />
  );
}

function AlignIcon() {
  return (
    <img
      className="w-5 brightness-0 invert"
      src="/images/iconb3.png"
      alt="Align Icon"
    />
  );
}

function ImplantIcon() {
  return (
    <img
      className="w-5 brightness-0 invert"
      src="/images/Iconb4.png"
      alt="Implant Icon"
    />
  );
}

// ─── Speciality Item ──────────────────────────────────────────────────────────
function SpecialityItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="specialities-item-icon text-[#7B2D3E] mb-0.5">{icon}</div>
      <p className="specialities-item-title font-semibold text-[15.5px] text-[#F2E5C5] leading-snug">{title}</p>
      <p className="specialities-item-desc text-[13px] text-[#ffffff] leading-relaxed font-light">{desc}</p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AProposPage() {
  return (
    <>
      <style>{`
        /* ──────────────────────────────────────── MOBILE (≤ 768px) ──────────────────────────────────────── */
        @media (max-width: 768px) {
          /* Hero Section */
          .hero-about-section {
            height: auto !important;
            margin-top: 130px !important;
            padding: 40px 16px !important;
          }

          .hero-about-flex {
            flex-direction: column !important;
            align-items: center !important;
          }

          .hero-about-text {
            max-width: 100% !important;
            padding: 0 !important;
            margin-bottom: 30px !important;
            text-align: center !important;
          }

          .hero-about-text h1 {
            font-size: 24px !important;
            line-height: 1.3 !important;
            margin-bottom: 16px !important;
          }

          .hero-about-text p {
            font-size: 15px !important;
            line-height: 1.6 !important;
            margin-bottom: 12px !important;
            max-width: 100% !important;
          }

          .hero-about-text p:last-of-type {
            margin-bottom: 0 !important;
          }

          .hero-about-text-label {
            font-size: 12px !important;
          }

          /* Doctor Image Card */
          .doctor-card-wrapper {
            width: 100% !important;
            padding: 0 !important;
            margin-right: 0 !important;
            margin-bottom: 0 !important;
          }

          .doctor-image-container {
            width: 100% !important;
            height: 380px !important;
            display: flex !important;
            align-items: flex-end !important;
            justify-content: center !important;
          }

          .doctor-bg-card {
            top: 20px !important;
            width: 280px !important;
            height: 300px !important;
            margin-top: 40px !important;
          }

          .doctor-image {
            width: 240px !important;
            margin-bottom: 60px !important;
            transform: scale(1.5) !important;
          }

          .doctor-social-icons {
            top: 100px !important;
            right: -8px !important;
            gap: 10px !important;
          }

          .doctor-social-btn {
            width: 26px !important;
            height: 26px !important;
          }

          .doctor-fade-overlay {
            width: 320px !important;
            height: 160px !important;
            bottom: -15px !important;
          }

          /* Philosophy Section */
          .philosophy-section {
            border-radius: 16px !important;
            margin: 20px 16px !important;
            margin-bottom: 20px !important;
          }

          .philosophy-container {
            padding: 20px !important;
          }

          .philosophy-flex {
            flex-direction: column !important;
            gap: 16px !important;
          }

          .philosophy-card {
            padding: 16px !important;
            min-height: auto !important;
          }

          .philosophy-card h3 {
            font-size: 18px !important;
            margin-bottom: 12px !important;
          }

          .philosophy-card p {
            font-size: 14px !important;
            line-height: 1.6 !important;
          }

          .philosophy-badges {
            gap: 8px !important;
            margin-top: 12px !important;
            flex-wrap: wrap !important;
          }

          .philosophy-badge {
            font-size: 9px !important;
            gap: 4px !important;
          }

          .journey-card {
            width: 100% !important;
            padding: 20px !important;
            flex-shrink: unset !important;
          }

          .journey-card h3 {
            font-size: 16px !important;
            margin-bottom: 8px !important;
          }

          .journey-card p {
            font-size: 12px !important;
            margin-bottom: 12px !important;
          }

          .journey-btn {
            padding: 8px 16px !important;
            font-size: 12px !important;
          }

          /* Specialities Section */
          .specialities-section {
            padding: 10px 16px !important;
          }

          .specialities-container {
            min-height: auto !important;
            flex-direction: column !important;
            padding: 1px !important;
            
          }

          .specialities-content {
            flex: 1 !important;
            z-index: 10 !important;
            margin-bottom: 80px !important;
          }

          .specialities-title {
            font-size: 18px !important;
            margin-bottom: 16px !important;
          }

          .specialities-grid {
            grid-template-columns: 1fr !important;
            gap: 26px !important;
            max-width: 100% !important;
          }

          .specialities-item-icon {
            width: 20px !important;
            height: 20px !important;
          }

          .specialities-item-title {
            font-size: 14px !important;
          }

          .specialities-item-desc {
            font-size: 12px !important;
          }

          .specialities-image {
            display: none !important;
          }
        }

        /* ──────────────────────────────────────── TABLET (769px–1024px) ──────────────────────────────────────── */
        @media (min-width: 769px) and (max-width: 1024px) {
          /* Hero Section */
          .hero-about-section {
            height: auto !important;
            margin-top: 130px !important;
            padding: 50px 30px !important;
          }

          .hero-about-flex {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .hero-about-text {
            max-width: 100% !important;
            padding: 0 !important;
            margin-bottom: 30px !important;
          }

          .hero-about-text h1 {
            font-size: 28px !important;
            line-height: 1.3 !important;
            margin-bottom: 16px !important;
          }

          .hero-about-text p {
            font-size: 16px !important;
            line-height: 1.6 !important;
            margin-bottom: 12px !important;
            max-width: 100% !important;
          }

          /* Doctor Image Card */
          .doctor-card-wrapper {
            width: 100% !important;
            padding: 0 !important;
            margin-right: 0 !important;
            margin-bottom: 20px !important;
          }

          .doctor-image-container {
            width: 100% !important;
            height: 340px !important;
            display: flex !important;
            align-items: flex-end !important;
            justify-content: center !important;
          }

          .doctor-bg-card {
            top: 30px !important;
            width: 320px !important;
            height: 320px !important;
            margin-top: 50px !important;
          }

          .doctor-image {
            width: 280px !important;
            margin-bottom: 80px !important;
            transform: scale(1.6) !important;
          }

          .doctor-social-icons {
            top: 120px !important;
            right: 0 !important;
          }

          .doctor-fade-overlay {
            width: 360px !important;
            height: 180px !important;
            bottom: -10px !important;
          }

          /* Philosophy Section */
          .philosophy-section {
            border-radius: 18px !important;
            margin: 20px 30px !important;
            margin-bottom: 20px !important;
          }

          .philosophy-container {
            padding: 24px !important;
          }

          .philosophy-flex {
            flex-direction: column !important;
            gap: 16px !important;
          }

          .philosophy-card {
            padding: 20px !important;
            min-height: 240px !important;
          }

          .philosophy-card h3 {
            font-size: 20px !important;
            margin-bottom: 14px !important;
          }

          .philosophy-card p {
            font-size: 15px !important;
            line-height: 1.6 !important;
          }

          .journey-card {
            width: 240px !important;
            flex-shrink: 0 !important;
            padding: 24px !important;
          }

          .journey-card h3 {
            font-size: 17px !important;
            margin-bottom: 10px !important;
          }

          .journey-card p {
            font-size: 13px !important;
          }

          /* Specialities Section */
          .specialities-section {
            padding: 24px 30px !important;
          }

          .specialities-container {
            min-height: 300px !important;
            padding: 24px !important;
          }

          .specialities-content {
            flex: 1 !important;
            max-width: 60% !important;
          }

          .specialities-title {
            font-size: 20px !important;
            margin-bottom: 18px !important;
          }

          .specialities-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
            max-width: 100% !important;
          }

          .specialities-image {
            width: 320px !important;
            height: 280px !important;
            scale: 1 !important;
            opacity: 0.4 !important;
          }
        }
      `}</style>

      <main
        className="w-full"
        
      >
        {/* ══════════════════════════════════════════════════════════
            SECTION 1 — HERO (burgundy background)
        ══════════════════════════════════════════════════════════ */}
             <div className='bg-[#711C31]'> 
              <section
          className="hero-about-section relative w-full"
          style={{ height: 520, marginTop: "130px " }}
        >
          <div className="hero-about-flex flex items-stretch w-full h-full">
            {/* Left: text content */}
            <div className="hero-about-text flex-1 flex flex-col justify-center px-19 py-16 pr-8 max-w-[55%]">
              {/* Small italic label */}
              <p
                className="hero-about-text-label text-[14px] font-light mb-3"
                style={{
                  color: "#FFFFFF",
                  fontStyle: "italic",
                  letterSpacing: "0.3px",
                }}
              >
                À propos de moi
              </p>

              {/* Doctor name */}
              <h1
                className="mb-7 leading-[1.3]"
                style={{
                  fontSize: "35px",
                  fontWeight: 600,
                  color: "#ffffff",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Dr. Ghita Ouazzani
                <br />
                Tnacheri
              </h1>

              {/* Paragraph 1 (bold / larger) */}
              <p
                className="mb-5 leading-relaxed"
                style={{
                  fontSize: "18px",
                  color: "#F0F0F0",
                  fontWeight: 500,
                  maxWidth: 480,
                }}
              >
                Redéfinir la santé bucco-dentaire à travers un prisme de précision
                esthétique et d'excellence clinique. Pour le Dr Ghita, la dentisterie
                est là où l'architecture rencontre l'intégrité biologique.
              </p>

              {/* Paragraph 2 (lighter) */}
              <p
                className="leading-relaxed"
                style={{
                  fontSize: "18px",
                  color: "#F0F0F0",
                  fontWeight: 500,
                  maxWidth: 480,
                }}
              >
                Redéfinir la santé bucco-dentaire à travers un prisme de précision
                esthétique et d'excellence clinique. Pour le Dr Ghita, la dentisterie
                est là où l'architecture rencontre l'intégrité biologique.
              </p>
            </div>

            {/* Right: doctor image card — matches Figma rounded card with warm gradient bg */}
            <div
  className="doctor-card-wrapper relative flex-shrink-0 flex items-center justify-end"
  style={{
    width: 490,
    paddingRight: "24px",
     marginRight:"200px",
     marginBottom:"80px"
  }}
>
  {/* Outer burgundy area */}
  <div
    className="doctor-image-container"
    style={{
      position: "relative",
      width: 300,
      height: 520,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
    }}
  >
    {/* Half background card */}
    <div
      className="doctor-bg-card"
      style={{
        position: "absolute",
        top: 40,
        width: 400,
        height: 420,
        borderRadius: "30px 30px 0px 0px",
        marginTop:"75px",
        background:
          "linear-gradient(180deg, #F4E7D3 0%, #EAD7C1 55%, #B56C7D 100%)",
        overflow: "hidden",
        zIndex: 1,
      }}
    >
     {/* Outside bottom fade */}

    </div>

    {/* Doctor image OUTSIDE background */}
    <img
      className="doctor-image"
      src="/images/docterpc.png"
      alt="Doctor"
      style={{
        position: "absolute",
        bottom: 0,
        width: 320,
        height: "auto",
        objectFit: "contain",
        zIndex: 3,
        marginBottom:"127px",
        transform:"scale(1.8) ",
       
      }}
    />

    {/* Social icons */}
    <div
      className="doctor-social-icons"
      style={{
        position: "absolute",
        top: 130,
        right: -14,
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        zIndex: 5,
      }}
    >
      {[
        { icon: <InstagramIcon />, label: "Instagram" },
        { icon: <FacebookIcon />, label: "Facebook" },
        { icon: <TikTokIcon />, label: "TikTok" },
      ].map(({ icon, label }) => (
        <button
          key={label}
          className="doctor-social-btn"
          aria-label={label}
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            border: "none",
            background: "#711C31",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#8B2944";
            e.currentTarget.style.transform = "scale(1.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#711C31";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {icon}
        </button>
      ))}
    </div>
    <div
      className="doctor-fade-overlay"
 style={{
  position: "absolute",
  bottom: -20,
  left: "50%",
  transform: "translateX(-50%)",
  width: 420,
  height: 220,
  background:
    "linear-gradient(to top, rgba(113,28,49,1) 15%, rgba(113,28,49,0.85) 35%, rgba(113,28,49,0) 100%)",
  zIndex: 10,
  pointerEvents: "none",
  filter: "blur(1px)",
  opacity: 2.5,
}}
/>
  </div>
</div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════
            SECTION 2 — PHILOSOPHY + START YOUR JOURNEY
        ══════════════════════════════════════════════════════════ */}
       <div className="philosophy-section relative z-10 bg-[#FFFFFF] rounded-2xl mx-8 mb-10  mt-10 "> 
        <section
          className="philosophy-container w-full px-10 py-12 "
          style={{  }}
        >
          <div
            className="philosophy-flex rounded-2xl overflow-hidden flex"
            style={{ background: "transparent", gap: 16, }}
          >
            {/* Left card — Philosophy of Care */}
            <div
              className="philosophy-card flex-1 rounded-2xl p-8 flex flex-col justify-between"
              style={{ background: "#D3D3D3", minHeight: 280,border:'1px solid #753141' }}
            >
              <div>
                <p
                  className="mb-5 philosophy-card"
                  style={{
                   
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#711C31",
                  }}
                >
                  Philosophy of Care
                </p>
                <p
                  className=" mb-6"
                  style={{
                    fontSize: 17.5,
                    color: "#5D5153",
                  
                    fontWeight: 500,
                    lineHeight: 1.65,
                    borderLeft: "none",
                  }}
                >
                  "I believe that clinical excellence should never feel sterile. My approach combines
                  the rigorous standards of modern medical science with the bespoke attention of a
                  boutique studio. We don't just treat symptoms; we curate smiles that reflect the
                  individual's character and vitality."
              </p>
              </div>

              {/* Badges */}
              <div className="philosophy-badges flex items-center gap-6 mt-2">
                <div className="philosophy-badge flex items-center gap-2">
                   <img className="w-[14px]" src="/images/icon4.png" />
                  <span
                    className="tracking-widest"
                    style={{ fontSize: 11, fontWeight: 600, color: "#5a4040", letterSpacing: "0.12em" }}
                  >
                    BOARD CERTIFIED
                  </span>
                </div>
                <div className="philosophy-badge flex items-center gap-2">
                 <img className="w-[14px]" src="/images/icon2.png" />
                  <span
                    className="tracking-widest"
                    style={{ fontSize: 11, fontWeight: 600, color: "#5a4040", letterSpacing: "0.12em" }}
                  >
                    5+ YEARS OF EXCELLENCE
                  </span>
                </div>
              </div>
            </div>

            {/* Right card — Start Your Journey */}
            <div
              className="journey-card rounded-2xl p-8 flex flex-col items-center justify-center text-center"
          style={{ background: "#711C31", width: 260, flexShrink: 0 }}
            >
              {/* Calendar icon */}
              <div className="mb-4" style={{ color: "#FFFFFF" }}>
                <CalendarIcon />
              </div>

              <p
                className="mb-3"
                style={{
                 
                  fontSize: 19,
                  fontWeight: 500,
                  color: "#ffffff",
                }}
              >
                Start Your Journey
              </p>
              <p
                className="mb-6 leading-relaxed"
                style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", fontWeight: 300 }}
              >
                Consultations available for cosmetic and restorative procedures.
              </p>

              <Link href="/pages/Appointment">
  <button
    className="journey-btn transition-colors"
    style={{
      background: "transparent",
      border: "1px solid #FFFFFF",
      color: "#fff",
      padding: "10px 22px",
      borderRadius: 50,
      fontSize: 13,
      cursor: "pointer",
      letterSpacing: "0.3px",
    }}
    onMouseEnter={(e) =>
      ((e.currentTarget as HTMLButtonElement).style.background =
        "rgba(255,255,255,0.12)")
    }
    onMouseLeave={(e) =>
      ((e.currentTarget as HTMLButtonElement).style.background =
        "transparent")
    }
  >
    Book Appointment
  </button>
</Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 3 — CLINICAL SPECIALITIES
        ══════════════════════════════════════════════════════════ */}
      <section className="specialities-section w-full px-10 pb-14">
  <div
    className="specialities-container rounded-2xl overflow-hidden relative flex"
    style={{
      minHeight: 320,
      background: "#711C31",
    }}
  >
    {/* Right Side Image */}
   <div className="specialities-image absolute bottom-10 right-10 h-full w-[380px] overflow-hidden scale-128">
  <img
    src="/images/chiar.png"
    alt="Clinic"
    className="w-full h-full object-cover scale-x-[-1]"
    style={{
     
    }}
  />

    </div>

    {/* Maroon Gradient Overlay */}
    <div
      className="absolute inset-0"
      style={{
       
         background:
  "linear-gradient(to top, rgba(40,8,15,0.98) 0%, rgba(113,28,49,0.38) 100%, rgba(160,70,95,0.30) 100%)",
      }}
    />

    {/* Main Content */}
    <div className="specialities-content relative z-10 flex-1 p-8 md:p-10">
      <p
        className="specialities-title mb-7"
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: "#FFFFFF",
          letterSpacing: "0.3px",
        }}
      >
        Clinical Specialities
      </p>

      {/* Grid */}
      <div
        className="specialities-grid grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8"
        style={{ maxWidth: 700 }}
      >
        <SpecialityItem
          icon={<ScissorsIcon />}
          title="Cosmetic Sculpting"
          desc="Minimal-prep veneers and digital smile design for natural aesthetics."
        />

        <SpecialityItem
          icon={<LeafIcon />}
          title="Biological Restorations"
          desc="Biocompatible materials focused on long term systemic health."
        />

        <SpecialityItem
          icon={<AlignIcon />}
          title="Precision Orthodontics"
          desc="Advanced aligner therapy integrated with structural facial analysis."
        />

        <SpecialityItem
          icon={<ImplantIcon />}
          title="Implant Microsurgery"
          desc="High-resolution guided surgery for seamless tooth replacement."
        />
      </div>
    </div>
  </div>
</section>
        </div>
        <div className="h-10 bg-[#711C31]"></div>
        </div>
      </main>
    </>
  );
}

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

        .hero-about-flex {
          align-items: flex-start !important;
        }

        .hero-about-section-first {
          padding-bottom: 14px !important;
        }

        .doctor-second-block {
          margin-top: 18px;
        }

        .doctor-sections-divider {
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          margin: 18px 56px 18px;
        }

        .hero-about-section-alt {
          margin-top: 0 !important;
          padding-top: 14px !important;
          padding-bottom: 16px !important;
          border-top: none !important;
          min-height: 0 !important;
        }

        /* ──────────────────────────────────────── MOBILE (≤ 768px) ──────────────────────────────────────── */
      @media (min-width: 426px) and (max-width: 768px) {

  .hero-about-flex {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
  }

  .hero-about-text {
    text-align: left !important;
    max-width: 62% !important;
    margin-bottom: 0 !important;
  }

  .doctor-card-wrapper {
    max-width: 45% !important;
    margin: 0 !important;
    display: flex !important;
    justify-content: center !important;
  }

  .doctor-image-container {
    height: 360px !important;
    justify-content: center !important;
    align-items: flex-end !important;
  }
}
      
        @media (max-width: 360px) {



  .doctor-image-container {
    width: 100% !important;
    overflow: hidden !important;
  }

  .doctor-bg-card {
    width: 100% !important;
    max-width: 290px !important;
  }

  .doctor-image {
    width: 200px !important;
    transform: scale(1.1) !important;
    margin-bottom: 46px !important;
  }
    .doctor-card-wrapper {
  width: 100% !important;
  margin: 0 auto !important;
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

}
        
        @media (max-width: 768px) {
          /* Hero Section */
          .hero-about-section {
            height: auto !important;
            padding: 24px 16px !important;
          }

          .hero-about-section-first {
            margin-top: 130px !important;
            padding-bottom: 14px !important;
          }

          .hero-about-section-alt {
            margin-top: 0 !important;
            padding-top: 14px !important;
            padding-bottom: 12px !important;
            min-height: 0 !important;
          }

          .doctor-second-block {
            margin-top: 12px !important;
          }

          .doctor-sections-divider {
            margin: 14px 16px !important;
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

          .hero-about-desc {
            font-size: 15.5px !important;
            line-height: 1.45 !important;
            margin-bottom: 10px !important;
            max-width: 100% !important;
          }

          .hero-about-desc:last-of-type {
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
            height: 370px !important;
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
            right: 24px !important;
            gap: 10px !important;
          }

          .doctor-social-btn {
            width: 26px !important;
            height: 26px !important;
          }

          .doctor-fade-overlay {
            width: 100% !important;
  max-width: 100% !important;
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
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
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
           display:none;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {

          html,
  body {
    overflow-x: hidden !important;
    width: 100%;
  }

  * {
    box-sizing: border-box;
  }
        
        
        /* Hero Section */
          .hero-about-section {
            height: auto !important;
            padding: 40px 10px !important;
            margin-left:50px;
          }

          .hero-about-section-first {
            margin-top: 130px !important;
            padding-bottom: 14px !important;
          }

          .hero-about-section-alt {
            margin-top: 0 !important;
            padding-top: 14px !important;
            padding-bottom: 16px !important;
            min-height: 0 !important;
          }

          .doctor-second-block {
            margin-top: 14px !important;
          }

          .doctor-sections-divider {
            margin: 16px 16px !important;
          }

          .hero-about-flex {
            flex-direction: row !important;
            align-items: flex-start !important;
          }

          .hero-about-text {
            max-width: 100% !important;
            padding: 0 !important;
            margin-bottom: 10px !important;
          }

          .hero-about-text h1 {
            font-size: 28px !important;
            line-height: 1.4 !important;
            margin-bottom: 16px !important;
          }

          .hero-about-desc {
            font-size: 16px !important;
            line-height: 1.45 !important;
            margin-bottom: 10px !important;
            max-width: 100% !important;
          }

          /* Doctor Image Card */
          .doctor-card-wrapper {
            width: 100% !important;
            padding: 0 !important;
            
            margin-right: 120px !important;
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
            top: 10px !important;
            width: 370px !important;
            height: 360px !important;
            margin-top: 10px !important;
          }

          .doctor-image {
            width: 480px !important;
            margin-bottom: 80px !important;
            transform: scale(1.6) !important;
          }

          .doctor-social-icons {
            top:50px !important;
            right: 0 !important;
          }

          .doctor-fade-overlay {
            width: 460px !important;
            height: 210px !important;
            bottom: -60px !important;
          }
}

        /* ──────────────────────────────────────── TABLET (769px–1024px) ──────────────────────────────────────── */
        @media (min-width: 1025px) and (max-width: 1440px) {
           html,
  body {
    overflow-x: hidden !important;
    width: 100%;
  }

  * {
    box-sizing: border-box;
  }
        
        
        /* Hero Section */
          .hero-about-section {
            height: auto !important;
            padding: 0 60px !important;
          }

          .hero-about-section-first {
            margin-top: 130px !important;
            padding-top: 48px !important;
            padding-bottom: 14px !important;
          }

          .hero-about-section-alt {
            margin-top: 0 !important;
            padding-top: 14px !important;
            padding-bottom: 16px !important;
            min-height: 0 !important;
          }

          .doctor-second-block {
            margin-top: 14px !important;
          }

          .doctor-sections-divider {
            margin: 18px 56px !important;
          }

          .hero-about-flex {
            flex-direction: row !important;
            align-items: flex-start !important;
          }

          .hero-about-text {
            max-width: 100% !important;
            padding: 0 !important;
            margin-bottom: 0 !important;
          }

          .hero-about-text h1 {
            font-size: 35px !important;
            line-height: 1.4 !important;
            margin-bottom: 16px !important;
          }

          .hero-about-desc {
            font-size: 16px !important;
            line-height: 1.45 !important;
            margin-bottom: 10px !important;
            max-width: 100% !important;
          }

          /* Doctor Image Card */
          .doctor-card-wrapper {
            width: 100% !important;
            padding: 0 !important;
            margin-right: 120px !important;
            margin-bottom: 0 !important;
          }

          .doctor-image-container {
            width: 100% !important;
            height: 340px !important;
            display: flex !important;
            align-items: flex-end !important;
            justify-content: center !important;
          }

          .doctor-bg-card {
            top: 10px !important;
            width: 370px !important;
            height: 360px !important;
            margin-top: 10px !important;
          }

          .doctor-image {
            width: 480px !important;
            margin-bottom: 80px !important;
            transform: scale(1.6) !important;
          }

          .doctor-social-icons {
            top:50px !important;
            right: 0 !important;
          }

          .doctor-fade-overlay {
            width: 460px !important;
            height: 210px !important;
            bottom: -60px !important;
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
            flex-direction: row !important;
            gap: 16px !important;
          }

          .philosophy-card {
            padding: 20px !important;
            min-height: 20px !important;
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
          className="hero-about-section hero-about-section-first relative w-full"
          style={{ height: 520, marginTop: "130px ", paddingBottom: 0 }}
        >
          <div className="hero-about-flex flex items-stretch w-full h-full">
            {/* Left: text content */}
            <div className="hero-about-text flex-1 flex flex-col justify-center px-19 pt-16 pb-6 pr-8 lg:max-w-[65%] w-full">
              {/* Small italic label */}
              <p
                className="hero-about-text-label text-[14px] font-light mb-3"
                style={{
                  color: "#FFFFFF",
                  fontStyle: "italic",
                  letterSpacing: "0.3px",
                }}
              >
                Notre équipe
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

              {/* Paragraph 1 */}
              <p
                className="hero-about-desc mb-3"
                style={{
                  fontSize: "16px",
                  lineHeight: 1.45,
                  color: "#F0F0F0",
                  fontWeight: 300,
                  maxWidth: 680,
                }}
              >
                Diplômée de la Faculté de Médecine Dentaire de Rabat –Université 
                Mohammed V, Dr. Ghita OuazzaniTnacheri incarne une approche moderne de la 
                dentisterie, où expertise clinique, innovation et esthétique se rencontrent.

              </p>

              {/* Paragraph 2 */}
              <p
                className="hero-about-desc"
                style={{
                  fontSize: "16px",
                  lineHeight: 1.45,
                  color: "#F0F0F0",
                  fontWeight: 300,
                  maxWidth: 680,
                }}
              >
                Animée par une recherche constante d’excellence, elle enrichit 
               continuellement sa pratique à travers des formations avancées nationales et 
              internationales en dentisterie esthétique et numérique, orthodontie, 
              endodontie, pédodontie, urgences, prothèse, réhabilitation orale. Titulaire d’un Diplôme Universitaire d’Orthodontie de l’université de Murcie en Espagne et 
              forte d’une immersion clinique à Barcelone dédiée à la dentisterie esthétique 
              et à la réhabilitation globale du sourire, elle propose une approche 
              multidisciplinaire alliant précisionet harmonie esthétique. <br/>

              Dr. Ghita Ouazzani Tnacheriaccorde une importance particulière aux détails, au confort du patient et à l’utilisation des techniques les plus actuelles. Son 
              approche associe rigueur scientifiqueet sens de l’esthétique pour garantir une prise en charge conforme aux standards internationaux les plus élevés.
              </p>
            </div>

            {/* Right: doctor image card — matches Figma rounded card with warm gradient bg */}
  <div
  className="doctor-card-wrapper relative flex items-center justify-center w-full lg:justify-end"
  style={{
    maxWidth: 490,
    margin: "0 auto",
    paddingRight: "24px",
    boxSizing: "border-box",
  }}
>
  {/* Outer burgundy area */}
  <div
    className="doctor-image-container"
    style={{
      position: "relative",
    width: "100%",
maxWidth: 300,
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

        <div className="doctor-second-block">
          <div className="doctor-sections-divider" aria-hidden="true" />

        {/* ══════════════════════════════════════════════════════════
            SECTION 1B — DR SAMI KANDIL
        ══════════════════════════════════════════════════════════ */}
        <section
          className="hero-about-section hero-about-section-alt relative w-full"
          style={{
            height: "auto",
            marginTop: 0,
            paddingTop: 0,
            paddingBottom: 16,
          }}
        >
          <div className="hero-about-flex flex items-stretch w-full h-full">
            {/* Left: text content */}
            <div className="hero-about-text flex-1 flex flex-col justify-center px-19 pt-2 pb-6 pr-8 lg:max-w-[65%] w-full">
              <h2
                className="mb-5 leading-[1.3]"
                style={{
                  fontSize: "35px",
                  fontWeight: 600,
                  color: "#ffffff",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Dr. Sami Kandil
              </h2>

              <p
                className="hero-about-desc mb-3"
                style={{
                  fontSize: "16px",
                  lineHeight: 1.45,
                  color: "#F0F0F0",
                  fontWeight: 300,
                  maxWidth: 680,
                }}
              >
                Diplômé de la Faculté de Médecine Dentaire de Casablanca – Université Hassan II,
                Dr Sami Kandil consacre sa pratique à l&apos;implantologie, à la chirurgie et aux
                réhabilitations complexes du sourire.
              </p>

              <p
                className="hero-about-desc mb-3"
                style={{
                  fontSize: "16px",
                  lineHeight: 1.45,
                  color: "#F0F0F0",
                  fontWeight: 300,
                  maxWidth: 680,
                }}
              >
                Titulaire de formations universitaires avancées en implantologie et dentisterie esthétique
                à la New York University, ainsi qu&apos;en chirurgie parodontale avancée en Corée du Sud,
                il prend en charge l&apos;ensemble des traitements chirurgicaux et implantaires, des cas les
                plus simples aux réhabilitations les plus complexes.
              </p>

              <p
                className="hero-about-desc"
                style={{
                  fontSize: "16px",
                  lineHeight: 1.45,
                  color: "#F0F0F0",
                  fontWeight: 300,
                  maxWidth: 680,
                }}
              >
                Son approche allie excellence chirurgicale et planification rigoureuse afin
                d&apos;offrir à chaque patient des traitements précis, durables et conformes aux standards
                internationaux les plus exigeants.
              </p>
            </div>

            {/* Right: doctor image card */}
            <div
              className="doctor-card-wrapper relative flex items-center justify-center w-full lg:justify-end"
              style={{
                maxWidth: 490,
                margin: "0 auto",
                paddingRight: "24px",
                boxSizing: "border-box",
              }}
            >
              <div
                className="doctor-image-container"
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 300,
                  height: 520,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <div
                  className="doctor-bg-card"
                  style={{
                    position: "absolute",
                    top: 40,
                    width: 400,
                    height: 420,
                    borderRadius: "30px 30px 0px 0px",
                    marginTop: "75px",
                    background:
                      "linear-gradient(180deg, #F4E7D3 0%, #EAD7C1 55%, #B56C7D 100%)",
                    overflow: "hidden",
                    zIndex: 1,
                  }}
                />

                <img
                  className="doctor-image"
                  src="/images/udrimag.png"
                  alt="Dr. Sami Kandil"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: 320,
                    height: "auto",
                    objectFit: "contain",
                    zIndex: 3,
                    marginBottom: "127px",
                    transform: "scale(1.55)",
                  }}
                />

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
        </div>

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
                  Notre philosophie
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
                  "Notre approche repose sur une dentisterie fondée sur les preuves scientifiques (evidence-based dentistry), associée aux technologies les plus avancées et à 
une planification rigoureuse des traitements. Chaque décision clinique est 
guidée par les données scientifiques actuelles, avec pour objectif d’assurer des résultats prévisibles, durables et conformes aux standards internationaux les 
plus exigeants."
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

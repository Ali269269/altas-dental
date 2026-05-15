"use client";

import Image from 'next/image';
import { useState } from "react";
import Link from "next/link";
const cards = [
  { tag: "Pédodontie", title: "Teeth Whitening", sub: "Professional-grade whitening treatments that restore your smile's natural brilliance in just one session.", image: '/images/card10.png' },
  { tag: "Restorative", title: "Dental Implants", sub: "Permanent, natural-looking replacements for missing teeth that feel and function just like your own.", image: '/images/cardbg1.jpg' },
  { tag: "Orthodontics", title: "Invisible Aligners", sub: "Discreet, comfortable alignment systems tailored to your smile goals without traditional braces.", image: '/images/cardbg2.png' },
  { tag: "Preventive", title: "Deep Cleaning", sub: "Thorough scaling and root planing to eliminate buildup and protect long-term gum health.", image: '/images/cardbg3.png' },
  { tag: "Emergency", title: "Same-Day Care", sub: "Urgent dental pain or injury? We offer same-day emergency appointments for immediate relief.", image: '/images/cardgb4.png' },
  { tag: "Pediatric", title: "Children's Dentistry", sub: "Gentle, playful care designed to make young patients comfortable and cavity-free for life.", image: '/images/cardgb5.png' },
  { tag: "Cosmetic", title: "Porcelain Veneers", sub: "Ultra-thin ceramic shells that correct chips, stains, and gaps for a flawless, confident smile.", image: '/images/cardbg6.png' },
  { tag: "Restorative", title: "Crowns & Bridges", sub: "Durable restorations that rebuild damaged teeth and fill gaps with seamless precision.", image: '/images/cardbg7.jpg' },
  { tag: "Cosmetic", title: "Smile Design", sub: "A full digital preview of your transformed smile before any treatment begins.", image: '/images/cardbg8.png' },
  { tag: "Preventive", title: "Oral Cancer Screening", sub: "Early detection saves lives. Our painless screening takes just minutes and provides peace of mind.", image: '/images/cardbg9.jpg' },
];

const reviews = [
  { name: "Paul H.", text: "\"J'ai eu une expérience incroyable chez le dentiste aujourd'hui. Toute la visite a été incroyablement professionnelle du début à la fin. Le personnel était accueillant et m'a mis à l'aise immédiatement.\"", bg: "#c8a87a", stars: 5 },
  { name: "Nic C.", text: "\"J'ai eu une expérience merveilleuse ici ! Le personnel est incroyablement amical et se soucie vraiment du bien-être de ses patients. Je me suis vraiment senti à l'aise ici.\"", bg: "#7a3a4a", stars: 5 },
  { name: "Paul H.", text: "\"J'ai eu une expérience incroyable chez le dentiste aujourd'hui. Toute la visite a été incroyablement professionnelle du début à la fin. Le personnel était accueillant et m'a mis à l'aise immédiatement.\"", bg: "#e8dcc8", stars: 5 },
  { name: "Ashley N.", text: "\"Je suis incroyablement anxieux quand il s'agit du dentiste. J'ai dû subir une procédure difficile, mais ils m'ont aidé à la traverser. Je ne peux pas imaginer avoir une équipe plus patiente et.\"", bg: "#b09070", stars: 5 },
  { name: "Paul H.", text: "\"J'ai eu une expérience incroyable chez le dentiste aujourd'hui. Toute la visite a été incroyablement professionnelle du début à la fin. Le personnel était accueillant et m'a mis à l'aise immédiatement.\"", bg: "#8a4a5a", stars: 5 },
];

const blogPosts = [
  { image: '/images/blog1.jpg', date: 'May 19, 2023', title: "L'évolution de l'expérience patient : fusionner l'excellence clinique avec le confort moderne", slug: "evolution-experience-patient" },
  { image: '/images/blog2.jpg', date: 'May 19, 2023', title: "Naviguer dans la frontière dentaire numérique : comment les outils intelligents et les données transforment vos soins", slug: "frontiere-dentaire-numerique" },
  { image: '/images/blog3.jpg', date: 'May 19, 2023', title: "L'évolution de l'expérience patient : fusionner l'excellence clinique avec le confort moderne", slug: "rehabilitation-totale-sourire" },
  { image: '/images/blog1.jpg', date: 'May 19, 2023', title: "Naviguer dans la frontière dentaire numérique : comment les outils intelligents et les données transforment vos soins", slug: "frontiere-dentaire-2" },
  { image: '/images/blog2.jpg', date: 'May 19, 2023', title: "L'évolution de l'expérience patient : fusionner l'excellence clinique avec le confort moderne", slug: "frontiere-dentaire-3" },
  { image: '/images/blog3.jpg', date: 'May 19, 2023', title: "Naviguer dans la frontière dentaire numérique : comment les outils intelligents et les données transforment vos soins", slug: "evolution-experience-2" },
];

const TOTAL_PAGES = 3;

// ─── ReviewCard component ───────────────────────────────────────────────────
function ReviewCard({
  review,
  topRight = false,
}: {
  review: { name: string; text: string; bg: string; stars: number };
  topRight?: boolean;
}) {
  const isLight = review.bg === "#e8dcc8" || review.bg === "#c8a87a" || review.bg === "#b09070";
  const textColor = isLight ? "#3d0818" : "#f0e6d3";
  const nameColor = isLight ? "#6b1228" : "#e8c97a";

  return (
    <div
      style={{
        background: review.bg,
        borderRadius: "20px",
        borderTopRightRadius: topRight ? "60px" : "20px",
        padding: "28px 26px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "200px",
      }}
    >
      <div style={{ marginBottom: "12px", display: "flex", gap: "3px" }}>
        {[...Array(review.stars)].map((_, i) => (
          <span key={i} style={{ color: "#c8960a", fontSize: "16px" }}>★</span>
        ))}
      </div>
      <p style={{ color: textColor, fontSize: "13px", lineHeight: 1.75, fontFamily: "var(--font-seasons-reg)", fontWeight: 500, flex: 1, marginBottom: "18px" }}>
        {review.text}
      </p>
      <p style={{ color: nameColor, fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-seasons-reg)", letterSpacing: "0.02em" }}>
        -{review.name}
      </p>
    </div>
  );
}

// ─── BlogCard component ─────────────────────────────────────────────────────
function BlogCard({ post, onPause, onResume }: { post: { image: string; date: string; title: string; slug: string };
   onPause: () => void;
  onResume: () => void; }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/pages/Blogs/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
    <div
        onMouseEnter={() => {
        setHovered(true);
        onPause();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onResume();
      }}
      
      style={{
        flexShrink: 0,
        width: '380px',
        borderRadius: '24px',
        background: hovered ? '#5c0d2a' : '#ffe9bf',
        padding: '14px 14px 24px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'background 0.4s ease',
        position: 'relative',
      }}
    >
      {/* Image */}
      <div
        style={{
          width: '100%',
          height: '220px',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '16px',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <Image src={post.image} alt={post.title} fill style={{ objectFit: 'cover' }} />
      </div>

      {/* Date */}
      <p
        style={{
          color: hovered ? '#ffffff' : '#3d0818',
          fontSize: '14px',
          letterSpacing: '0.03em',
          textAlign: 'right',
          marginBottom: '10px',
          fontFamily: "var(--font-seasons-reg)",
          transition: 'color 0.4s',
          paddingRight: '4px',
        }}
      >
        {post.date}
      </p>

      {/* Title + Arrow */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', paddingLeft: '6px', paddingRight: '6px' }}>
        <h3
          style={{
            color: hovered ? '#f0e6d3' : '#3d0818',
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: 1.6,
            fontFamily: "var(--font-seasons-reg)",
            flex: 1,
            transition: 'color 0.4s',
          }}
        >
          {post.title}
        </h3>
        <div
          style={{
            flexShrink: 0,
            width: '49px',
            height: '49px',
            borderRadius: '50%',
            background: hovered ? '#f2e5c5' : '#5c0d2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: hovered ? '#711c31':'#FFD52F',
            fontSize:'25px',
            marginBottom: '2px',
          }}
        >
          ↗
        </div>
      </div>
    </div>
    </Link>
  );
}
// ─── FaqSection component ───────────────────────────────────────────────────
function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What kind of care and support do you provide?",
      a: "Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet augue est arcu. Sit congue dolor neque orci sed ornare arcu adipiscing. Nec mollis ut tellus auctor.",
    },
    {
      q: "How do you tailor your services to individual needs?",
      a: "Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet augue est arcu. Sit congue dolor neque orci sed ornare arcu adipiscing. Nec mollis ut tellus auctor.",
    },
    {
      q: "Can I meet the team members and the Senior Consultant?",
      a: "Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet augue est arcu. Sit congue dolor neque orci sed ornare arcu adipiscing. Nec mollis ut tellus auctor.",
    },
    {
      q: "How do you ensure the quality of care provided?",
      a: "Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet augue est arcu. Sit congue dolor neque orci sed ornare arcu adipiscing. Nec mollis ut tellus auctor.",
    },
    {
      q: "What is the process for getting started with your services?",
      a: "Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet augue est arcu. Sit congue dolor neque orci sed ornare arcu adipiscing. Nec mollis ut tellus auctor.",
    },
    { 
      q: "How can I contact you for more information or to schedule a consultation?",
      a: "Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet augue est arcu. Sit congue dolor neque orci sed ornare arcu adipiscing. Nec mollis ut tellus auctor.",
    },
  ];

  return (
    <section
      style={{
        background: '#f4eee1',
        fontFamily: "var(--font-seasons-reg)",
        padding: '80px 0 100px',
      }}
    >
      <div
        className="faq-inner"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '90px',
          alignItems: 'flex-start',
          marginRight:"62px"
        }}
      >
        {/* LEFT: Title + description */}
        <div style={{ flex: '0 0 340px' }}>
          <h2
            style={{
              color: '#6b1228',
              fontSize: '29px',
              fontWeight: 600,
              fontFamily: "var(--font-cinzel)",
              lineHeight: 1.2,
              marginBottom: '28px',
              letterSpacing: '0.01em',
            }}
          >
            Frequently Asked Questions (FAQ)
          </h2>
          <p
            style={{
              color: '#45383B',
              fontSize: '18px',
              lineHeight: 1.60,
              fontFamily: "var(--font-seasons-reg)",
              fontWeight: 400,
            }}
          >
            Nous répondons à certaines des questions les plus courantes concernant notre équipe,
            nos services et notre approche des soins. Que vous cherchiez des informations sur nos
            soins compatissants pour les personnes âgées et vulnérables, ou que vous soyez
            curieux à propos de notre Consultant Senior et de l'expertise que nous apportons à
            chaque client
          </p>
        </div>

        {/* RIGHT: Accordion */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                style={{
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '22px 24px',
                    background: isOpen ? '#fff1d3' : '#ffe9bf',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '20px',
                    transition: 'background 0.3s',
                    borderRadius: isOpen ? '12px 12px 0 0' : '0',
                  }}
                >
                  <span
                    style={{
                      color: isOpen ? '#6b1220' : '#591727',
                      fontSize: '17px',
                      fontWeight: 500,
                      fontFamily: "var(--font-seasons-reg)",
                      lineHeight: 1.4,
                      letterSpacing: '0.01em',
                      transition: 'color 0.3s',
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    style={{
                      color: isOpen ? '#6b1228' : '#300E16',
                      fontSize: '18px',
                      flexShrink: 0,
                      transition: 'transform 0.3s, color 0.3s',
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(0deg)',
                      lineHeight: 1,
                    }}
                  >
                    {isOpen ? '▲' : '▼'}
                  </span>
                </button>

                {/* Answer panel */}
                <div
                  style={{
                    background: '#fff1d3',
                    maxHeight: isOpen ? '200px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s cubic-bezier(.4,0,.2,1)',
                    borderRadius: isOpen ? '0 0 12px 12px' : '0',
                  }}
                >
                  <p
                    style={{
                      color: '#591727',
                      fontSize: '16px',
                      lineHeight: 1.8,
                      fontFamily: "var(--font-seasons-reg)",
                      fontWeight: 400,
                      padding: '4px 24px 24px',
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [isBlogPaused, setIsBlogPaused] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
 

  return (
    <div className="flex flex-col">

      {/* ───────────────── Mobile Responsive Styles ───────────────── */}
      <style>{`
        @keyframes carousel-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-vertical {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes blog-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes reviews-scroll {
          0%, 25% { transform: translateX(0); }
          33%, 58% { transform: translateX(-25%); }
          66%, 91% { transform: translateX(-50%); }
          100% { transform: translateX(-75%); }
        }
        @keyframes dots-scroll {
          0%, 25% { transform: translateX(0); }
          33%, 58% { transform: translateX(20px); }
          66%, 91% { transform: translateX(40px); }
          100% { transform: translateX(0); }
        }
        .reviews-section:hover .reviews-track,
        .reviews-section:hover .active-dot-indicator {
          animation-play-state: paused;
        }
        .reviews-track {
          display: flex;
          gap: 0px;
          width: max-content;
          will-change: transform;
          animation: reviews-scroll 12s ease-in-out infinite;
        }

        /* ── MOBILE ONLY (≤768px) ── */
        @media (max-width: 768px) {

          /* Hero */
          .hero-section {
            flex-direction: column !important;
            min-height: unset !important;
            padding: 80px 20px 30px !important;
            align-items: flex-start !important;
          }
          .hero-text {
            max-width: 100% !important;
          }
          .hero-text h1 {
            font-size: 26px !important;
            transform: translateY(0) !important;
          }
          .hero-text p {
            font-size: 15px !important;
            transform: translateY(0) !important;
          }
          .hero-cards-row {
            margin-left: 0 !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
            margin-top: 20px !important;
          }
          .hero-cards-row > div {
            width: calc(50% - 6px) !important;
            min-width: 140px !important;
          }
          .hero-doctor-img {
            display: none !important;
          }

          /* Services/Stats */
          .stats-section-text {
            padding: 40px 20px 20px !important;
            max-width: 100% !important;
          }
          .stats-section-text h2 {
            font-size: 22px !important;
          }
          .stats-row {
            flex-direction: column !important;
            padding: 0 20px !important;
          }
          .stats-row > div {
            margin-left: 0 !important;
            padding: 14px 16px !important;
            border-left: none !important;
            border-top: 2px solid #711C31 !important;
          }
          .stats-row > div > div[style*="position: absolute"] {
            display: none !important;
          }

          /* Card Carousel */
          .carousel-header {
            padding: 0 20px !important;
          }

          /* About/Doctor Section */
          .about-section {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: 0 !important;
            margin-top: 40px !important;
            border-radius: 0 !important;
            height: auto !important;
          }
          .about-inner {
            flex-direction: column !important;
          }
          .about-left {
            flex: unset !important;
            padding: 40px 24px 30px !important;
          }
          .about-left h2 {
            font-size: 20px !important;
          }
          .about-left p {
            font-size: 16px !important;
          }
          .about-doc-img {
            display: none !important;
          }

          /* Reviews Section */
          .reviews-section {
            padding: 40px 16px 20px !important;
          }
          .reviews-track > div {
            grid-template-columns: repeat(1, 90vw) !important;
            grid-template-rows: unset !important;
            padding-left: 0 !important;
          }
          .reviews-track > div > div {
            width: 90vw !important;
            height: auto !important;
            min-height: 200px !important;
          }

          /* Blog Section */
          .blog-header {
            padding: 0 20px !important;
            margin-left: 0 !important;
          }
          .blog-track > div {
            width: 280px !important;
          }
          .blog-track {
            padding-left: 20px !important;
          }

          /* FAQ Section */
          .faq-inner {
            flex-direction: column !important;
            gap: 32px !important;
            padding: 0 20px !important;
            margin-right: 0 !important;
          }
          .faq-inner > div:first-child {
            flex: unset !important;
          }

          /* Why Choose Us / Video Section */
          .why-section {
            padding: 0 20px !important;
            margin-bottom: 40px !important;
          }
          .why-header {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .why-header > div:first-child {
            flex: unset !important;
            margin-left: 0 !important;
          }
          .why-body {
            flex-direction: column !important;
            margin-left: 0 !important;
          }
          .why-video-col {
            flex: unset !important;
            width: 100% !important;
          }
          .why-right-col {
            flex: unset !important;
            width: 100% !important;
          }
        }

        /* ── TABLET (769px–1024px) ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          .hero-section {
            padding: 80px 30px 30px !important;
          }
          .hero-text h1 {
            font-size: 28px !important;
            transform: translateY(0) !important;
          }
          .hero-text p {
            transform: translateY(0) !important;
          }
          .hero-cards-row {
            margin-left: 0 !important;
            margin-top: 20px !important;
          }
          .hero-doctor-img {
            width: 280px !important;
            height: 340px !important;
          }
          .about-section {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: 0 !important;
            border-radius: 12px !important;
          }
          .faq-inner {
            flex-direction: column !important;
            gap: 32px !important;
            padding: 0 30px !important;
            margin-right: 0 !important;
          }
          .faq-inner > div:first-child {
            flex: unset !important;
          }
          .why-section {
            padding: 0 30px !important;
          }
          .why-header {
            gap: 40px !important;
          }
          .why-body {
            flex-direction: column !important;
          }
          .why-video-col {
            flex: unset !important;
            width: 100% !important;
          }
          .why-right-col {
            flex: unset !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* ───────────────── Hero Section ───────────────── */}
      <section
        className="hero-section relative overflow-hidden flex items-center min-h-[520px] px-15 pt-16 pb-10"
        style={{
          backgroundImage: "url('/images/bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          fontFamily: "var(--font-seasons-reg)",
        }}
      >
        <div className="absolute pointer-events-none" style={{ top: '-40%', left: '-5%', width: '50%', height: '200%', background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.035) 50%, transparent 60%)' }} />

        <div className="hero-text relative z-10 flex flex-col max-w-[520px]">
          <h1 className="text-white font-bold uppercase leading-tight mb-8" style={{ fontFamily: "var(--font-cinzel)", fontSize: '34px', letterSpacing: '0.01em', transform: 'translateY(90px)' }}>
            Votre sourire le plus<br />sain,{' '}
            <span style={{ color: '#e8c97a', fontSize: '34px' }}>simplifié.</span>
          </h1>
          <p className="font-light leading-relaxed\ mb-11 max-w-[420px]" style={{ fontSize: '17px', letterSpacing: '0.01em', transform: 'translateY(70px)',color:'#F0F0F0' }}>
            Fournir des soins doux et experts dans un environnement<br /> chaleureux.
            Des premiers examens aux restaurations qui <br /> changent la vie.
          </p>

          <div className="hero-cards-row flex items-end relative z-20 gap-3.5 ml-[470px]">
            {/* Card 1 — Subscribe */}
            <div className="rounded-2xl flex-shrink-0 relative overflow-hidden flex flex-col items-center justify-end" style={{ background: '#5c0d2a', width: '183px', minHeight: '180px', padding: '10px', border: '1.5px solid #c8960a' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("/images/cardhero.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.45, zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1, background: '#f5edda', borderRadius: '10px', padding: '14px 12px 18px', width: '100%', marginBottom: '18px' }}>
                <div style={{ position: 'absolute', bottom: '-14px', right: '0px', width: 0, height: 0, borderTop: '26px solid #f5edda', borderLeft: '19px solid transparent', borderRight: '2px solid transparent' }} />
                <p style={{ color: '#6b1228', fontSize: '13px', lineHeight: 1.55, textAlign: 'center', fontFamily: "var(--font-seasons-reg)", fontWeight: 600, margin: 0 }}>
                  Abonnez-vous à<br />nos actualités et<br />mises à jour
                </p>
              </div>
              <button style={{ position: 'relative', zIndex: 1, background: '#f5edda', color: '#6b1228', border: 'none', padding: '7px 22px', borderRadius: '999px', fontFamily: "var(--font-seasons-reg)", fontSize: '12px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em', transform: 'translateY(-10px)' }}>
                S'abonner
              </button>
            </div>

            {/* Card 2 — Reservation */}
           <Link href="/pages/Appointment" className="block relative z-50">
  <div
    className="rounded-2xl flex flex-col items-center justify-center shadow-xl flex-shrink-0 cursor-pointer"
    style={{
      border: "1.5px solid #c8960a",
      background: "#c8a87a",
      width: "182px",
      minHeight: "180px",
      padding: "22px 18px 20px",
      gap: "14px",
      position: "relative",
      zIndex: 50, // 🔥 important
    }}
  >
    <div
      style={{
        position: "relative",
        width: "70px",
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src="/images/teeth.png"
        alt="Dental doctor"
        fill
        className="object-contain object-bottom translate-y-1 scale-190"
        priority
      />

      <div
        style={{
          position: "absolute",
          top: "-8px",
          bottom: "-11px",
          right: "0px",
          width: "22px",
          height: "22px",
          background: "#711C31",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFD52F",
          fontSize: "18px",
          fontWeight: 700,
          lineHeight: 1,
          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        }}
      >
        +
      </div>
    </div>

    <p
      className="text-center"
      style={{
        color: "#3d0a1e",
        fontSize: "14px",
        lineHeight: 1.4,
        fontFamily: "var(--font-seasons-reg)",
        fontWeight: 700,
      }}
    >
      Réservation en ligne instantanée
    </p>
  </div>
</Link>
          </div>
        </div>

        <div className="hero-doctor-img relative z-0 flex flex-1 justify-end items-end self-stretch pointer-events-none">
          <div className="relative w-[390px] h-[460px]">
            <Image src="/images/doctor.png" alt="Dental doctor" fill className="object-contain object-bottom translate-y-4 scale-150" priority />
          </div>
        </div>
      </section>

      {/* ───────────────── Services / Stats Section ───────────────── */}
      <section style={{ background: '#f4eee1', fontFamily: "var(--font-seasons-reg)" }} className="w-full">
        <div className="stats-section-text px-22 pt-16 pb-8" style={{ maxWidth: '700px' }}>
          <h2 style={{ color: '#5A1628', fontSize: '29px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.3, marginBottom: '14px', }}>
            Pourquoi choisir notre centre dentaire ?
          </h2>
          <p style={{ color: '#4a3728', fontSize: '17px', lineHeight: 1.75, fontFamily: "var(--font-seasons-reg)", fontWeight: 500, maxWidth: '620px' }}>
            Choisissez notre centre dentaire pour une combinaison parfaite de technologie avancée
            et de soins compatissants. Notre équipe d'experts est dédiée à fournir des traitements
            précis et sans stress dans un environnement moderne conçu pour votre confort.
          </p>
        </div>
        <div style={{ background: '#ffe9bf' }}>
          <div className="stats-row flex items-stretch">
            {[
              { value: '3000+', label: 'Patients', icon: '/images/icon1.png' },
              { value: '3+', label: 'Years of Experience', icon: '/images/icon2.png' },
              { value: '300+', label: 'Surgeries Performed', icon: '/images/icon3.png' },
              { value: '10+', label: 'Advanced Certifications', icon: '/images/icon4.png' },
              { value: '300+', label: 'Modern Technologies', icon: '/images/icon6.png' },
            ].map((stat, i) => (
              <div key={i} className="flex-1 flex flex-col justify-center" style={{ padding: '14px 20px 20px', marginLeft: '90px', position: 'relative' }}>
                {i < 5 && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: '70%', width: '2px', background: '#711C31' }} />}
                <div style={{ marginBottom: '10px', width: '36px', height: '36px' }}>
                  <img src={stat.icon} alt={stat.label} style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                </div>
                <p style={{ fontFamily: "var(--font-cinzel)", fontSize: '36px', fontWeight: 700, lineHeight: 1, marginBottom: '6px', display: 'flex', alignItems: 'flex-start', gap: '2px' }}>
                  <span style={{ color: '#711C31', textShadow: '0 0 1px #E3D083, 0 1px 0 rgba(0,0,0,0.2)' }}>{stat.value.replace('+', '')}</span>
                  <span style={{ color: '#711C31', fontWeight: 900, fontSize: '30px', marginTop: '5px', lineHeight: 1, WebkitTextStroke: '0.1px rgba(255, 213, 47, 0.6)', textShadow: '0 0 2px rgba(227, 208, 131, 0.85)' }}>+</span>
                </p>
                <p style={{ color: '#6b1228', fontSize: '12px', fontWeight: 500, letterSpacing: '0.03em', fontFamily: "var(--font-seasons-reg)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Card Carousel Section ───────────────── */}
      <section className="overflow-hidden py-10" style={{ background: '#f4eee1', fontFamily: "var(--font-seasons-reg)" }}>
  <div className="carousel-header px-20 mb-10" style={{ maxWidth: '900px' }}>
    <h2 style={{ color: '#5A1628', fontSize: '29px', fontWeight: 600, marginBottom: '8px', fontFamily: "var(--font-cinzel)" }}>
      Nos spécialités
    </h2>
  </div>
  <div className="overflow-hidden w-full">
    <div
      className="overflow-hidden w-full"
      onMouseLeave={() => setOpenIndex(null)}
    >
      <div
        className="flex"
        style={{
          gap: '20px',
          width: 'max-content',
          animation: 'carousel-scroll 32s linear infinite',
          animationPlayState: openIndex !== null ? 'paused' : 'running',
        }}
      >
        {[...cards, ...cards].map((card, i) => {
          const realIndex = i % cards.length;
          const isOpen = openIndex === realIndex;
          return (
            <div
              key={`card-${i}`}
              className="flex-shrink-0 flex flex-col justify-between relative overflow-hidden rounded-2xl"
              onMouseEnter={() => setOpenIndex(realIndex)}
              style={{ width: isOpen ? '290px' : '200px', minHeight: '200px', padding: '24px 20px 20px', background: isOpen ? '#0a1520' : '#ffe9bf', transition: 'width 0.5s cubic-bezier(.4,0,.2,1), background 0.4s', cursor: 'pointer' }}
            >
              <div style={{ position: 'absolute', width: '212px', height: '212px', top: '100px', left: '-80px', background: '#F2E5C5', opacity: 0.99, borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, backgroundImage: isOpen ? `linear-gradient(135deg, rgba(90,22,39,0.7), rgba(113,28,49,0.9)), url(${card.image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', opacity: isOpen ? 1 : 0, transition: 'opacity 0.5s', zIndex: 0, borderRadius: '16px' }} />
              <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '16px', letterSpacing: '2px', fontWeight: '700', textTransform: 'uppercase', color: isOpen ? '#ffffff' : '#65192b', marginBottom: '10px', display: 'block' }}>{card.tag}</span>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: isOpen ? '#ffffff' : '#711C31', lineHeight: 1.4, marginBottom: '14px', fontFamily: "var(--font-cinzel)" }}>{card.title}</h3>
                <div style={{ fontSize: '12px', color: isOpen ? '#ffffff' : '#711C31', lineHeight: 1.7, overflow: 'hidden', maxHeight: isOpen ? '100px' : '0px', opacity: isOpen ? 1 : 0, transition: 'max-height 0.5s cubic-bezier(.4,0,.2,1), opacity 0.4s', fontFamily: "var(--font-seasons-reg)" }}>{card.sub}</div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                <button style={{ fontSize: '11px', letterSpacing: '1.5px', fontWeight: '700', textTransform: 'uppercase', color: isOpen ? '#ffffff' : '#711C31', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "var(--font-seasons-reg)", padding: 0, transition: 'color 0.2s' }}>Read More</button>
                <div style={{ position: 'absolute', right: isOpen ? 'auto' : '0px', left: isOpen ? '90px' : 'auto', width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid #b8955a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', color: isOpen ? '#711C31' : '#FFD52F', background: isOpen ? '#F2D9A3' : '#711C31', transform: isOpen ? 'rotate(0deg)' : 'rotate(320deg)', transition: 'transform 0.4s ease, background 0.3s, color 0.3s' }}>→</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</section>

      {/* ───────────────── About / Doctor Section ───────────────── */}
      <section
        className="about-section"
        style={{ background: 'linear-gradient(135deg, #5c0d2a 0%, #3d0818 50%, #2a0510 100%)', fontFamily: "", height: '640px', width: '1150px', maxWidth: '95%', marginTop: '80px', marginLeft:'100px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)', zIndex: 1, pointerEvents: 'none' }} />

        <div className="about-inner" style={{ display: 'flex', minHeight: '220px', position: 'relative', zIndex: 2 }}>
          <div className="about-left" style={{ flex: '0 0 62%', padding: '60px 56px 60px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '1.5px', background: '#c8960a' }} />
              <span style={{ color: '#c8960a', fontSize: '14px', fontStyle: 'italic', letterSpacing: '0.04em', fontFamily: "var(--font-seasons-reg)" }}>À propos</span>
            </div>
            <h2
              style={{
                color: '#FAE1AA',
                fontSize: 'clamp(22px, 2.5vw, 24px)',
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: '28px',
                fontFamily: "var(--font-cinzel)",
                letterSpacing: '0.01em',
                display: 'inline-block',
                maxWidth: '100%',
              }}
            >
              Dr. Ghita Ouazzani Tnacheri
            </h2>
            <p style={{ color: '#f0e6d3', fontSize: '20px', lineHeight: 1.35, marginBottom: '28px', fontWeight: 400, textIndent: '2.5em' }}>
              Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet augue est arcu.
              Sit congue dolor neque orci sed ornare arcu adipiscing. Nec mollis ut tellus auctor.
              Sed etiam a ut non lacinia sagittis id. Pretium scelerisque urna eget sit vitae risus
              tellus arcu. Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet augue
              est arcu. Sit congue dolor neque orci sed ornare arcu adipiscing. Nec mollis ut
              tellus auctor. Sed etiam a ut non lacinia sagittis id. Pretium scelerisque urna eget
              sit vitae risus tellus arcu.
            </p>
            <p style={{ color: '#f0e6d3', fontSize: '20px', lineHeight: 1.35, marginBottom: '44px', fontFamily: "var(--font-seasons-reg)", fontWeight: 400, textIndent: '2.5em' }}>
              Sed etiam a ut non lacinia sagittis id. Pretium scelerisque urna eget sit vitae
              risus tellus arcu. Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet au.
            </p>
            <div>
             <Link href="/pages/Appointment">
  <button
    style={{
      background: 'transparent',
      border: '1.5px solid #c8960a',
      color: '#f0e6d3',
      padding: '12px 30px',
      borderRadius: '999px',
      fontSize: '14px',
      fontFamily: "var(--font-seasons-reg)",
      fontWeight: 500,
      letterSpacing: '0.04em',
      cursor: 'pointer',
      transition: 'background 0.3s, color 0.3s',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLButtonElement).style.background = '#591727'; // maroon
      (e.currentTarget as HTMLButtonElement).style.color = '#f0e6d3';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      (e.currentTarget as HTMLButtonElement).style.color = '#f0e6d3';
    }}
  >
    Prendre rendez-vous
  </button>
</Link>
            </div>
            <div className="about-doc-img">
              <Image
                src="/images/aboutDoc.png"
                alt="Dr. Ghita Ouazzani Tnacheri"
                fill
                style={{
                  filter: 'grayscale(100%)',
                  marginTop:'46px',
                  objectFit: 'contain',
                  objectPosition: 'bottom right',
                  transform: 'translateX(480px) scale(0.88)',
                  minHeight:'520px'
                }}
                priority
              />
            </div>
          </div>
          <div style={{ flex: '1', position: 'relative', minHeight: '320px', zIndex: 10 }} />
        </div>
      </section>

      {/* ───────────────── Reviews Section ───────────────── */}
      <section
        className="reviews-section"
        style={{
          background: '#f4eee1',
          
          overflow: 'hidden',
          padding: '60px 79px 10px',
          position: 'relative',
        }}
      >
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div className="reviews-track">
            {[0, 1, 2, 0].map((setIndex, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 388px)',
                  gridTemplateRows: '305px 300px',
                  gap: '0px',
                  flexShrink: 0,
                  paddingLeft: '30px',
                }}
              >
                {/* ── Row 1, Col 1: Title card ── */}
                <div style={{ width: '360px', height: '280px', borderRadius: '24px', padding: '20px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div>
                    <h2 style={{ color: '#6b1228', fontSize: '25px', fontWeight: 700, fontFamily: "'Cinzel', serif", textTransform: 'uppercase', lineHeight: 1.1, letterSpacing: '0.04em', margin: '0 0 16px', textAlign: 'center' }}>
                      Sourires Faits <br /> Ici
                    </h2>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img src="/images/review.png" alt="image not found" style={{ width: '160px', height: '160px', objectFit: 'contain', display: 'block' }} />
                    </div>
                  </div>
                </div>

                {/* ── Row 1, Col 2 ── */}
                <div style={{ width: '360px', height: '280px', background: '#ffe9bf', borderRadius: '24px', padding: '30px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '26px', letterSpacing: '4px' }}>★★★★★</div>
                  <p style={{ color: '#3d0818', fontSize: '17px', lineHeight: 1.4, fontWeight: 400, margin: '10px 0', flex: 1 }}>"{reviews[setIndex % reviews.length]?.text}"</p>
                  <span style={{ color: '#3d0818', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{reviews[setIndex % reviews.length]?.name}</span>
                </div>

                {/* ── Row 1, Col 3 ── */}
                <div style={{ width: '360px', height: '280px', background: '#a86e70', borderRadius: '25px 180px 25px 25px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '22px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#6b1228', fontSize: '17px', lineHeight: 1.4, fontWeight: 400, margin: '10px 0', flex: 1 }}>"{reviews[(setIndex + 1) % reviews.length]?.text}"</p>
                  <span style={{ color: '#6b1228', fontSize: '17px', fontWeight: 500, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{reviews[(setIndex + 1) % reviews.length]?.name}</span>
                </div>

                {/* ── Row 2, Col 1 ── */}
                <div style={{ width: '360px', height: '280px', background: '#ffe9bf', borderRadius: '25px 25px 25px 180px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', marginLeft:'20px', fontSize: '25px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#3d0818', fontSize: '17px', lineHeight: 1.4,  fontWeight: 400, margin: '10px 20px', flex: 1 }}>"{reviews[(setIndex + 2) % reviews.length]?.text}"</p>
                  <span style={{ color: '#3d0818', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif", marginLeft: '56px' }}>-{reviews[(setIndex + 2) % reviews.length]?.name}</span>
                </div>

                {/* ── Row 2, Col 2 ── */}
                <div style={{ width: '360px', height: '280px', background: '#c7ae9a', borderRadius: '24px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '22px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#3d0818', fontSize: '17px', lineHeight: 1.4,  fontWeight: 400, margin: '10px 0', flex: 1 }}>"{reviews[(setIndex + 3) % reviews.length]?.text}"</p>
                  <span style={{ color: '#3d0818', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{reviews[(setIndex + 3) % reviews.length]?.name}</span>
                </div>

                {/* ── Row 2, Col 3 ── */}
                <div style={{ width: '360px', height: '280px', background: '#936562', borderRadius: '25px 25px 180px 25px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '22px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#6b1228', fontSize: '17px', lineHeight: 1.4,fontWeight: 400, margin: '10px 0', flex: 1 }}>"{reviews[(setIndex + 4) % reviews.length]?.text}"</p>
                  <span style={{ color: '#6b1228', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{reviews[(setIndex + 4) % reviews.length]?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
          <div style={{ position: 'relative', display: 'flex', gap: '10px' }}>
            {[...Array(TOTAL_PAGES)].map((_, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c4a87a' }} />
            ))}
            <div
              className="active-dot-indicator"
              style={{ position: 'absolute', left: '0px', width: '32px', height: '10px', borderRadius: '999px', background: '#6b1228', animation: 'dots-scroll 12s ease-in-out infinite', marginLeft: '-11px' }}
            />
          </div>
        </div>
      </section>

      {/* ───────────────── Blog Carousel Section ───────────────── */}
      <section style={{ background: '#f4eee1', fontFamily: "var(--font-seasons-reg)", padding: '70px 0 80px', overflow: 'hidden' }}>
        <div className="blog-header" style={{ padding: '0 70px', marginBottom: '48px', marginLeft:"15px" }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ width: '36px', height: '1.1px', background: '#6b1228' }} />
            <span style={{ color: '#6b1228', fontSize: '15px', fontStyle: 'italic', letterSpacing: '0.04em' }}>Perspicacité et Inspiration</span>
          </div>
          <h2 style={{ color: '#6b1228', fontSize: '29px', fontWeight: 600, fontFamily: "var(--font-cinzel)", lineHeight: 1.1, marginBottom: '20px', letterSpacing: '0.01em' }}>
            Nos blogs
          </h2>
          <p style={{ color: '#6b1228', fontSize: '18px', lineHeight: 1.75, maxWidth: '620px', fontFamily: "var(--font-seasons-reg)", fontWeight: 400 }}>
            Explorez l'intersection du confort et de la technologie alors que nous partageons des
            mises à jour sur les outils innovants et les méthodes douces que nous utilisons pour
            transformer votre expérience dentaire.
          </p>
        </div>
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div className="blog-track" style={{ 
            display: 'flex', 
            gap: '24px', 
            width: 'max-content', 
            animation: 'blog-scroll 30s linear infinite',
            animationPlayState: isBlogPaused ? 'paused' : 'running',
            paddingLeft: '60px' 
          }}>
            {[...blogPosts, ...blogPosts].map((post, i) => (
              <BlogCard 
                key={i} 
                post={post} 
                onPause={() => setIsBlogPaused(true)} 
                onResume={() => setIsBlogPaused(false)} 
              />
            ))}
          </div>
        </div>
      </section>

      <FaqSection />

      {/* ───────────────── Why Choose Us Video Section ───────────────── */}
      <section
        className="why-section"
        style={{
          background: '#f4eee1',
          fontFamily: "var(--font-seasons-reg)",
          padding: '0px 60px',
          marginBottom:'70px'
        }}
      >
        {/* Top: two-column header */}
        <div
          className="why-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '48px',
            gap: '410px',
          }}
        >
          {/* LEFT: title */}
          <div style={{ flex: '0 0 380px', marginLeft:'25px' }}>
            <p style={{ color: '#6b1228', fontSize: '16px', fontStyle: 'italic', marginBottom: '16px', marginTop:'20px', letterSpacing: '0.04em' }}>
              Nous servons des patients du monde entier.
            </p>
            <h2 style={{ color: '#6b1228', fontSize: '29px', fontWeight: 600, fontFamily: "var(--font-cinzel)", textTransform: 'uppercase', lineHeight: 1.1, letterSpacing: '0.02em' }}>
              Pourquoi nous choisir
            </h2>
          </div>

          {/* RIGHT: description + button */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', paddingTop: '28px' }}>
            <p style={{ color: '#6b1228', fontSize: '17px', lineHeight: 1.6, fontFamily: "var(--font-seasons-reg)", fontWeight: 400, maxWidth: '480px' }}>
              Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet augue est arcu.
              Sit congue dolor neque orci sed ornare arcu adipiscing. Nec mollis ut tellus auctor.
            </p>
           <Link href="/pages/Appointment">
  <button
    style={{
      background: '#5c0d2a',
      border: 'none',
      color: '#f0e6d3',
      padding: '14px 32px',
      borderRadius: '999px',
      fontSize: '15px',
      fontFamily: "var(--font-seasons-reg)",
      fontWeight: 600,
      letterSpacing: '0.04em',
      cursor: 'pointer',
      transition: 'background 0.3s',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = '#7a1038')}
    onMouseLeave={e => (e.currentTarget.style.background = '#5c0d2a')}
  >
    Prendre rendez-vous
  </button>
</Link>
          </div>
        </div>

        {/* Bottom: video + right column */}
        <div className="why-body" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginLeft:'10px' }}>
          {/* LEFT: Video player */}
          <div
            className="why-video-col"
            style={{ flex: '0 0 62%', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#1a1008', aspectRatio: '17/9', cursor: 'pointer' }}
            onMouseEnter={() => setIsVideoHovered(true)}
            onMouseLeave={() => setIsVideoHovered(false)}
            onClick={() => {
              const vid = document.getElementById('why-video') as HTMLVideoElement;
              if (vid) {
                if (vid.paused) { vid.play(); setIsVideoPlaying(true); }
                else { vid.pause(); setIsVideoPlaying(false); }
              }
            }}
          >
            <video
              id="why-video"
              src="/videos/teethvideo.mp4"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              playsInline
              loop
            />
            {(!isVideoPlaying || isVideoHovered) && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid #c8960a', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8960a', fontSize: '26px' }}>
                  ▶
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: image + text */}
          <div className="why-right-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', position: 'relative', aspectRatio: '5/3' }}>
              <Image src="/images/treatment.jpg" alt="Clinic treatment" fill style={{ objectFit: 'cover' }} />
            </div>
            <p style={{ color: '#5c0d2a', fontSize: '17px', lineHeight: 1.4, fontFamily: "var(--font-seasons-reg)", fontWeight: 400 }}>
              Nous croyons que des soins de santé de qualité sont la base d'une vie épanouissante.
              Nos services de santé complets sont conçus pour améliorer votre bien-être global,
              offrant des soins personnalisés et des solutions innovantes pour répondre à vos besoins
              uniques.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

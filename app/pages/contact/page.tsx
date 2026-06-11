"use client";

import { useState } from "react";
import { submitContactFormApi } from "@/utils/subscribersApi";

// ─── Icons ────────────────────────────────────────────────────────────────────
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.28-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
    </svg>
  );
}

// ─── Contact Info Row ─────────────────────────────────────────────────────────
function ContactRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-3"
      style={{
        border: "1px solid #711C31",
        borderRadius: 10,
        padding: "12px 16px",
        background: "#fff",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 2,
          border: "1px solid #711C31",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7B2D3E",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 13, color: "#591727", lineHeight: 1.6, fontWeight: "500" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [form, setForm] = useState({ nom: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const result = await submitContactFormApi({
        name: form.nom.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setFeedback({ type: "success", message: result.message });
      setForm({ nom: "", email: "", message: "" });
      setTimeout(() => {
        setSent(false);
        setFeedback(null);
      }, 4000);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to submit the form. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
   width: "100%",
    background: "transparent",
    border: "1px solid #FFFFFF",
    borderRadius: 3,
    padding: "12px 16px",
    color: "#fff",
    fontSize: 13.5,
    fontFamily: "'Jost', sans-serif",
    fontWeight: 300,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <>
      <style>{`

        /* LARGE DESKTOPS */
        @media (min-width: 1440px) {
          .cta-outer {
            padding: 0 100px !important;
          }
        }

        /* TABLET / SMALL LAPTOP */
        @media (max-width: 1024px) and (min-width: 769px) {
          .cta-outer {
            padding: 0 48px !important;
          }
            .contact-card-wrapper {
    display: flex !important;
    flex-direction: row !important; /* keep row */
  }

  .contact-form-panel {
    width: 50% !important;
    padding: 32px 24px !important;
  }

  .contact-card-section {
    padding: 10px 60px 30px 60px !important;
  }

  button[type="submit"] {
    width: 100% !important;
  }


        }

        @media (max-width: 768px) {

          /* Section 1 — Title */
          .contact-title-section {
            padding: 140px 20px 30px !important;
          }
          .contact-title-section h1 {
            font-size: 22px !important;
            letter-spacing: 0.5px !important;
          }

          /* Section 2 — Card wrapper */
          .contact-card-section {
            padding: 10px 16px 30px 16px !important;
          }
          .contact-card-wrapper {
            flex-direction: column !important;
            height: auto !important;
            border-radius: 14px !important;
          }

          /* Left panel — Form */
          .contact-form-panel {
            width: 100% !important;
            padding: 32px 20px !important;
            align-items: stretch !important;
          }
          .contact-form-panel h2 {
            font-size: 18px !important;
          }
          .contact-form-accent-line {
            margin-left: 0 !important;
          }
          .contact-input,
          .contact-form-panel input,
          .contact-form-panel textarea,
          .contact-form-panel button[type="submit"] {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .contact-form-panel form {
            width: 100% !important;
          }

          /* Right panel — Info */
          .contact-info-panel {
            padding: 28px 20px !important;
            gap: 16px !important;
          }

          /* CTA outer wrapper */
          .cta-outer {
            padding: 0 16px !important;
          }

          /* CTA inner card */
          .cta-wrapper {
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
          .contact-cta-hand {
            display: none !important;
          }
        }
      `}</style>

      <main style={{ fontFamily: "'Jost', sans-serif", background: "#FFFFFF" }}>

        {/* ═══════════════════════════════════════════════════════
            SECTION 1 — PAGE TITLE
        ═══════════════════════════════════════════════════════ */}
        <section
          className="contact-title-section"
          style={{ background: "#FFFFFF", padding: "156px 80px 40px", textAlign: "center" }}
        >
          <h1
            style={{
              fontSize: 34,
              fontWeight: 500,
              color: "#711C31",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Connectez-vous avec nous
          </h1>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2 — CONTACT CARD (two panels)
        ═══════════════════════════════════════════════════════ */}
        <section
          className="contact-card-section"
          style={{ padding: "10px 100px 30px 100px" }}
        >
          <div
            className="contact-card-wrapper"
            style={{
              borderRadius: 20,
              overflow: "hidden",
              display: "flex",
              boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
              height: 630,
            }}
          >
            {/* ── Left panel: Form ── */}
            <div
              className="contact-form-panel"
              style={{
                background: "#711C31",
                width: "48%",
                flexShrink: 0,
                padding: "48px 44px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: "#fff",
                  marginBottom: 8,
                  letterSpacing: "0.3px",
                }}
              >
                Prenez contact
              </h2>
              <div
                className="contact-form-accent-line"
                style={{
                  width: 59,
                  marginLeft: "-140px",
                  height: 4,
                  background: "#FFFFFF",
                  borderRadius: 2,
                  marginBottom: 32,
                }}
              />

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, width: "100%" }}
              >
                <input
                  className="contact-input"
                  type="text"
                  placeholder="Votre nom"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  style={inputStyle}
                  required
                />
                <input
                  className="contact-input"
                  type="email"
                  placeholder="Votre email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                  required
                />
                <textarea
                  className="contact-input"
                  placeholder="Votre message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  style={{ ...inputStyle, resize: "none" }}
                  required
                />

                {feedback ? (
                  <p
                    role="alert"
                    style={{
                      margin: 0,
                      padding: "10px 12px",
                      borderRadius: 6,
                      fontSize: 13,
                      lineHeight: 1.45,
                      background: feedback.type === "success" ? "#fff5f5" : "#fff0f0",
                      color: feedback.type === "success" ? "#591727" : "#8B1A2E",
                      border: "1px solid #e8a0a8",
                    }}
                  >
                    {feedback.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    marginTop: 4,
                    width: "100%",
                    maxWidth: "100%",
                    background: "#ffffff",
                    border: "1px solid #ffffff",
                    borderRadius: 3,
                    color: "#300E16",
                    fontSize: 17,
                    fontWeight: 500,
                    padding: "13px 0",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    transition: "background 0.25s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#F0F0F0")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#F0F0F0")
                  }
                >
                  {sent ? "Envoyé ✓" : submitting ? "Envoi…" : "Envoyez"}
                </button>
              </form>
            </div>

            {/* ── Right panel: Info ── */}
            <div
              className="contact-info-panel"
              style={{
                flex: 1,
                background: "#F0F0F0",
                padding: "48px 44px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <p style={{ fontSize: 14, color: "#5a4040", lineHeight: 1.75, fontWeight: 300, marginBottom: 4 }}>
                Borem ipsum dolor sit amet, consectetur adipiscing elit.
                Nunc vulputate libero et velit interdum, ac aliquet odio
                mattis.
              </p>

              {/* Map */}
              <div
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#ddd",
                  flexShrink: 0,
                }}
              >
                <iframe
                  className="map-iframe"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3307.8412092259664!2d-6.846475!3d33.9966122!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda76dab52891b6f%3A0x3e544619ba730692!2sAtlas%20Dental%20Center%20-%20Dr%20Ghita%20Ouazzani%20T.!5e0!3m2!1sen!2s!4v1778524410125!5m2!1sen!2s"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ width: "100%", height: "100%", border: 0, borderRadius: 10 }}
                />
              </div>

              {/* Contact rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <ContactRow icon={<PhoneIcon />}>
                  <div>05 37 77 77 79</div>
                  <div>06 68 20 10 10</div>
                </ContactRow>
                <ContactRow icon={<MailIcon />}>
                  contact@atlasdentalcenter.com
                </ContactRow>
                <ContactRow icon={<MapPinIcon />}>
                  Ang Av Atlas, 61 rue Oued Oum Errabi<br />
                  n. 5, 2ème étage, Agdal - RABAT
                </ContactRow>
              </div>

              {/* Social icons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: "auto" }}>
                {[
                  { icon: <InstagramIcon />, label: "Instagram" },
                  { icon: <YoutubeIcon />, label: "YouTube" },
                  { icon: <TikTokIcon />, label: "TikTok" },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    aria-label={label}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "1px solid rgba(123,45,62,0.25)",
                      background: "transparent",
                      color: "#7B2D3E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = "#7B2D3E";
                      b.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = "transparent";
                      b.style.color = "#7B2D3E";
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 3 — CTA
        ═══════════════════════════════════════════════════════ */}
        {/* ── Outer padding wrapper — keeps left/right edge spacing on all screen sizes ── */}
        <div className="cta-outer" style={{ padding: "0 100px", boxSizing: "border-box" }}>
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
              marginTop: "60px",
              marginBottom: "60px",
              boxSizing: "border-box",
            }}
          >
            {/* Hand image */}
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
                className="contact-cta-hand"
                style={{
                  width: 220,
                  objectFit: "contain",
                  display: "block",
                  transform: "scaleX(-1) scale(1.3) translateY(15px)",
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
        </div>

      </main>
    </>
  );
}

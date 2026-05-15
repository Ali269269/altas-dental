"use client";


import { useState } from "react";

const sections = [
  {
    title: "Introduction",
    content:
      "Au Centre dentaire Atlas, nous accordons une grande importance à la protection de votre vie privée et nous nous engageons à protéger vos renseignements personnels. La présente politique de confidentialité décrit nos pratiques en matière de collecte, utilisation et divulgation de vos données lorsque vous utilisez nos services cliniques et notre site Web. Nous nous efforçons de maintenir les normes les plus élevées en matière d'intégrité des données et de confidentialité des patients.",
  },
  {
    title: "Collecte de données",
    content:
      "Nous collectons uniquement les données nécessaires à la fourniture de nos services dentaires. Cela inclut vos informations personnelles (nom, prénom, date de naissance), vos coordonnées (adresse, téléphone, email), ainsi que vos antécédents médicaux et dentaires indispensables à votre prise en charge.",
  },
  {
    title: "Comment nous utilisons vos informations",
    content:
      "Vos informations sont utilisées exclusivement pour vous fournir des soins dentaires de qualité, gérer vos rendez-vous, vous envoyer des rappels et communications liés à votre traitement, et respecter nos obligations légales et réglementaires en matière de santé.",
  },
  {
    title: "Coordonnées",
    content:
      "Pour toute question relative à cette politique de confidentialité ou à l'utilisation de vos données personnelles, veuillez nous contacter à : contact@atlasdentalcenter.com ou par téléphone au 05 37 77 77 79.",
  },
];

function ChevronUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function PrivacyPolicypage() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? -1 : i);

  return (
    <>
      <style>{`
        

        .pp-page {
          background: #f4eee1;
          min-height: 100vh;
          
        }

        .pp-title {
         font-size: 36px;
          font-weight: 600;
          color: #591727;
          text-align: center;
          line-height: 1.25;
          margin-bottom: 10px;
          letter-spacing: 0.01em;
        }

        .pp-date {
          
          font-size: 15.5px;
          font-weight: 400;
          
          color: #7a6a5a;
          text-align: center;
          margin-bottom: 0;
          letter-spacing: 0.01em;
        }

        .pp-accordion-wrap {
          max-width: 760px;
        
          
          margin: 52px auto 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pp-accordion-item {
          background: #faf7f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 8px rgba(80,40,20,0.07);
        }

        .pp-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 22px;
          font-size: 18px;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.18s;
        }

        .pp-accordion-header:hover {
          background: rgba(113,28,49,0.03);
        }

        .pp-accordion-title {
        font-size: 22px;
          font-weight: 500;
         
          color: #591727;
          margin-bottom: 14px;
          line-height: 1.3;
        }

        .pp-accordion-icon {
          color: #711C31;
          flex-shrink: 0;
          margin-left: 16px;
          display: flex;
          align-items: center;
          transition: transform 0.25s ease;
        }

        .pp-accordion-body {
          padding: 0 32px 28px;
        }

        .pp-accordion-inner {
         background: #ede8dc;
  border-radius: 8px;
  padding: 24px 28px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 500;
  font-size: 18px;
  color: #2a1e14;
  line-height: 1.75;
        }

        .pp-accordion-text {
          
  font-size: 16px;        /* larger than before — matches the screenshot size */
  font-weight: 500;       /* medium weight for that high-contrast look */
  color: #2a1e14;         /* very dark brown, almost black */
  line-height: 1.35;
  letter-spacing: 0.01em;
  margin: 0;
        }

        .pp-accordion-content {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pp-accordion-content.open {
          grid-template-rows: 1fr;
        }

        .pp-accordion-content-inner {
          overflow: hidden;
        }
      `}</style>

      <main className="pp-page">
        <section style={{ padding: "180px 80px 80px", background: "#f4eee1" }}>

          {/* Main Title */}
          <h1 className="pp-title">
            Politique de<br />Confidentialité
          </h1>

          {/* Date */}
          <p className="pp-date">
            Dernière mise à jour : 24 Mai 2024
          </p>

          {/* Accordion */}
          <div className="pp-accordion-wrap">
            {sections.map((section, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="pp-accordion-item">
                  {/* Header */}
                  <button
                    className="pp-accordion-header"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                  >
                    <span className="pp-accordion-title">{section.title}</span>
                    <span className="pp-accordion-icon">
                      {isOpen ? <ChevronUp /> : <ChevronDown />}
                    </span>
                  </button>

                  {/* Animated body */}
                  <div className={`pp-accordion-content${isOpen ? " open" : ""}`}>
                    <div className="pp-accordion-content-inner">
                      <div className="pp-accordion-body">
                        <div className="pp-accordion-inner">
                          <p className="pp-accordion-text">{section.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </section>
      </main>
    </>
  );
}

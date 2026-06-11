"use client";

import Image from 'next/image';
import { useState, useEffect } from "react";
import Link from "next/link";
import { blogImageUrl, fetchPublicBlogs } from "@/utils/blogsApi";
import {
  fetchPublicSpecialities,
  specialityImageUrl,
  specialityPagePath,
} from "@/utils/specialitiesApi";

type CarouselCard = {
  title: string;
  sub: string;
  image: string;
  href?: string;
};

const cards: CarouselCard[] = [
  {
    title: "Smile Design",
    sub: "Prévisualisation numérique complète de votre futur sourire avant même le début du traitement.",
    image: '/images/card10.png'
  },
  {
    title: "Facettes Dentaires",
    sub: "Sublimez la forme, la couleur et l’harmonie du sourire avec des restaurations fines et naturelles.",
    image: '/images/cardbg1.jpg'
  },
  {
    title: "Composites Stratifiés sous Digue",
    sub: "Des restaurations esthétiques réalisées avec précision pour un rendu naturel et durable.",
    image: '/images/cardbg2.png'
  },
  {
    title: "Blanchiment Dentaire",
    sub: "Des protocoles modernes pour révéler l’éclat naturel du sourire en douceur.",
    image: '/images/cardbg3.png'
  },
  {
    title: "Couronnes & Bridges",
    sub: "Des restaurations alliant esthétique, confort et intégration naturelle au sourire.",
    image: '/images/cardgb4.png'
  },
  {
    title: "Implants Dentaires",
    sub: "Une solution moderne, biocompatible et durable pour retrouver fonction, stabilité et confiance.",
    image: '/images/cardgb5.png'
  },
  {
    title: "Orthodontie Invisible",
    sub: "Des aligneurs transparents pour harmoniser le sourire avec discrétion et confort.",
    image: '/images/cardbg6.png'
  },
  {
    title: "Orthodontie",
    sub: "Une approche sur mesure visant à améliorer l’alignement des dents, l’harmonie du sourire et l’équilibre du profil facial.",
    image: '/images/cardbg7.jpg'
  },
  {
    title: "Dentisterie Numérique",
    sub: "Des technologies de pointe permettant des soins plus précis, fluides et confortables.",
    image: '/images/cardbg8.png'
  },
  {
    title: "Scanner Intra-Oral",
    sub: "Une empreinte numérique haute précision pour une expérience moderne et sans inconfort.",
    image: '/images/cardbg9.jpg'
  },
  {
    title: "Imagerie 3D & CBCT",
    sub: "Une visualisation avancée pour des diagnostics précis et une planification optimale des traitements.",
    image: '/images/cardbg10.jpg'
  },
  {
    title: "Endodontie sous Microscope",
    sub: "Une approche endodontique de haute précision réalisés sous magnification permettant une prise en charge conservatrice.",
    image: '/images/cardbg11.jpg'
  },
  {
    title: "Dentisterie sous Microscope",
    sub: "Une approche microscopique moderne permettant une précision accrue dans les soins dentaires.",
    image: '/images/cardbg12.jpg'
  },
  {
    title: "Soins Conservateurs",
    sub: "Préserver la structure naturelle des dents grâce à des traitements précis et minimalement invasifs.",
    image: '/images/cardbg13.jpg'
  },
  {
    title: "Parodontologie",
    sub: "Des soins spécialisés et techniques avancées dédiés à la santé et à la stabilité des gencives.",
    image: '/images/cardbg14.jpg'
  },
  {
    title: "NETTOYAGE PRÉVENTIF EN PROFONDEUR",
    sub: "Détartrage et surfaçage radiculaire approfondis afin d’éliminer les dépôts et préserver durablement la santé gingivale.",
    image: '/images/cardbg15.jpg'
  },
  {
    title: "Réhabilitation Orale",
    sub: "Une prise en charge globale visant à restaurer esthétique, fonction et harmonie du sourire.",
    image: '/images/cardbg16.jpg'
  },
  {
    title: "Chirurgie Dentaire",
    sub: "Des interventions réalisées avec précision dans une approche moderne et maîtrisée.",
    image: '/images/cardbg17.jpg'
  },
  {
    title: "Dentisterie Laser",
    sub: "Une technologie avancée favorisant précision, confort et récupération optimisée.",
    image: '/images/cardbg18.jpg'
  },
  {
    title: "Urgences Dentaires",
    sub: "Une prise en charge le jour même : intervention rapide et attentive face aux douleurs et situations d’urgence pour un soulagement immédiat.",
    image: '/images/cardbg19.jpg'
  },
  {
    title: "Dentisterie Pédiatrique",
    sub: "Une approche douce, ludique et adaptée pour accompagner les enfants dans leur santé bucco-dentaire.",
    image: '/images/cardbg20.jpg'
  }
];

const reviews = [
  { name: "Nihad Cherkaoui Sellami.", text: 'J’ai eu une urgence dentaire le jour de l’aid et Dr Ghita a gentiment accepté de me recevoir rapidement. Elle a pris le temps de m’expliquer l’origine du problème et de me soulager rapidement. Un grand merci pour ta bienveillance, je recommande vivement!.', bg: "#c8a87a", stars: 5 },
  { name: "driss baddouri.", text: "Première visite à l’Atlas Dental Center et je suis pleinement satisfait. Une prise en charge sérieuse, des soins de qualité et une équipe professionnelle. Je recommande.​​​​​​​​​​​​​​​​", bg: "#7a3a4a", stars: 5 },
  { name: "youssef sehbani.", text: "Très beau cabinet accueillant. Médecin a l’écoute , travail minutieux et résultat satisfaisant . Très bonne expérience sachant que j’ai la phobie.", bg: "#e8dcc8", stars: 5 },
  { name: "REDA EL.", text: "I was very satisfied with my experience at this dental practice in Rabat. The dentist was very professional, attentive, and reassuring. The practice is modern, clean, and well-organized. I highly recommend it.", bg: "#b09070", stars: 5 },
  { name: "Oumaima Ainouz.", text: "Docteur Ghita est très compétente et douce. Elle explique chaque étape avant d’agir, ce qui rend l’expérience rassurante. Le cabinet est moderne, équipé d’un matériel de pointe. Une excellente expérience, je recommande!", bg: "#8a4a5a", stars: 5 },
];

const TOTAL_PAGES = 4;

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
      <p style={{ color: textColor, fontSize: "13px", lineHeight: 1.75, fontFamily: "var(--font-seasons-reg)", fontWeight: 100, flex: 1, marginBottom: "198px" }}>
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
    className="blog-card-wrapper"
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
        height: '370px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderRadius: '24px',
        background: hovered ? '#5c0d2a' : '#f0f0f0',
        padding: '14px 14px 24px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'background 0.4s ease',
        position: 'relative',
        border:'1px solid #753141'
      }}
    >
      {/* Image */}
      <div className="blogimg"
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
        <Image src={blogImageUrl(post.image) || "/images/blog1.jpg"} alt={post.title} fill style={{ objectFit: 'cover' }} unoptimized />
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

      {/* Title + Arrow — fixed slot so arrow stays in the same place on every card */}
      <div className="blog-card-footer" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 0 }}>
        <div className="blog-card-footer-row" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', paddingLeft: '6px', paddingRight: '6px', minHeight: '72px' }}>
          <h3
            style={{
              color: hovered ? '#f0e6d3' : '#3d0818',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1.6,
              fontFamily: "var(--font-seasons-reg)",
              flex: 1,
              margin: 0,
              minHeight: '72px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
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
              background: hovered ? '#F0F0F0' : '#5c0d2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hovered ? '#711c31':'#FFFFFF',
              fontSize:'25px',
              marginBottom: '2px',
              alignSelf: 'flex-end',
            }}
          >
            ↗
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
}
// ─── FAQ data ───────────────────────────────────────────────────────────────
type FaqEntry = { id: string; q: string; a: string };
type FaqCategory = { id: string; name: string; items: FaqEntry[] };

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "soins-generaux",
    name: "Soins Généraux",
    items: [
      {
        id: "sg-1",
        q: "Les soins dentaires sont-ils douloureux ?",
        a: "Les techniques modernes et les anesthésies utilisées permettent de réaliser les soins dans des conditions optimales de confort.",
      },
      {
        id: "sg-2",
        q: "À quelle fréquence faut-il consulter ?",
        a: "Un contrôle tous les 6 à 12 mois est recommandé afin de prévenir les problèmes bucco-dentaires et maintenir une bonne santé orale.",
      },
      {
        id: "sg-3",
        q: "Combien de détartrages faut-il faire par an ?",
        a: "Un à deux détartrages par an sont généralement recommandés selon l’hygiène bucco-dentaire et les besoins de chaque patient.",
      },
      {
        id: "sg-4",
        q: "Prenez-vous en charge les urgences dentaires ?",
        a: "Oui, les urgences dentaires sont prises en charge rapidement afin de soulager douleur et inconfort.",
      },
    ],
  },
  {
    id: "esthetique",
    name: "Esthétique du Sourire",
    items: [
      {
        id: "es-1",
        q: "Qu’est-ce que le Smile Design ?",
        a: "Le SmileDesign permet d’analyser et planifier l’esthétique du sourire afin d’obtenir un résultat harmonieux et personnalisé.",
      },
      {
        id: "es-2",
        q: "Proposez-vous le blanchiment au fauteuil ou par gouttières ?",
        a: "Le centre propose le blanchiment au fauteuil, le blanchiment ambulatoire par gouttières, ou une combinaison des deux selon les besoins et objectifs du patient.",
      },
      {
        id: "es-3",
        q: "Quelle est la durée d’un blanchiment dentaire ?",
        a: "Une séance dure généralement entre 45 minutes et 1h30 selon le protocole et les besoins du patient.",
      },
      {
        id: "es-4",
        q: "Le blanchiment dentaire abîme-t-il les dents ?",
        a: "Réalisé sous contrôle professionnel, le blanchiment respecte les structures dentaires et suit des protocoles sécurisés.",
      },
      {
        id: "es-5",
        q: "Les facettes dentaires donnent-elles un résultat naturel ?",
        a: "Les facettes sont conçues pour s’intégrer harmonieusement au sourire tout en respectant l’esthétique naturelle du visage.",
      },
    ],
  },
  {
    id: "orthodontie",
    name: "Orthodontie & Aligneurs",
    items: [
      {
        id: "or-1",
        q: "Proposez-vous des aligneurs invisibles ?",
        a: "Oui, des traitements par aligneurs transparents sont proposés pour corriger l’alignement dentaire discrètement.",
      },
      {
        id: "or-2",
        q: "L’orthodontie est-elle réservée aux adolescents ?",
        a: "Non, les traitements orthodontiques peuvent être réalisés à tout âge selon les besoins du patient.",
      },
      {
        id: "or-3",
        q: "Combien de temps dure un traitement orthodontique ?",
        a: "La durée varie selon la complexité du cas et les objectifs du traitement.",
      },
    ],
  },
  {
    id: "implants",
    name: "Implants & Réhabilitation",
    items: [
      {
        id: "im-1",
        q: "Est-il important de remplacer rapidement une dent absente ?",
        a: "Oui, remplacer une dent manquante permet de préserver l’équilibre de l’occlusion, la fonction masticatoire et l’alignement des dents voisines.",
      },
      {
        id: "im-2",
        q: "Les implants dentaires sont-ils durables ?",
        a: "Les implants constituent une solution fiable et durable lorsqu’ils sont correctement entretenus.",
      },
      {
        id: "im-3",
        q: "Peut-on remplacer plusieurs dents manquantes ?",
        a: "Oui, différentes solutions de réhabilitation permettent de restaurer fonction et esthétique du sourire.",
      },
      {
        id: "im-4",
        q: "Quelle est la différence entre une couronne et un bridge ?",
        a: "Une couronne restaure une dent tandis qu’un bridge permet de remplacer une ou plusieurs dents absentes.",
      },
    ],
  },
  {
    id: "endodontie",
    name: "Endodontie & Soins Conservateurs",
    items: [
      {
        id: "en-1",
        q: "Pourquoi utiliser un microscope en endodontie ?",
        a: "Le microscope opératoire améliore la visualisation du système canalaire et la précision des traitements.",
      },
      {
        id: "en-2",
        q: "Peut-on sauver une dent infectée ?",
        a: "Dans de nombreux cas, un traitement endodontique permet de conserver la dent naturelle.",
      },
    ],
  },
  {
    id: "numerique",
    name: "Dentisterie Numérique",
    items: [
      {
        id: "dn-1",
        q: "Utilisez-vous des technologies numériques ?",
        a: "Le cabinet est équipé de technologies modernes telles que le scanner intra-oral, l’imagerie 3D (CBCT) et le laser.",
      },
      {
        id: "dn-2",
        q: "Le scanner intra-oral remplace-t-il les empreintes classiques ?",
        a: "Oui, il permet de réaliser des empreintes numériques plus confortables et précises.",
      },
      {
        id: "dn-3",
        q: "Qu’est-ce que l’imagerie 3D CBCT ?",
        a: "Le CBCT permet une analyse tridimensionnelle précise pour améliorer le diagnostic et la planification des traitements.",
      },
      {
        id: "dn-4",
        q: "Quels sont les avantages de la dentisterie numérique ?",
        a: "Elle permet des traitements plus précis, plus confortables et une meilleure prévisibilité des résultats.",
      },
    ],
  },
  {
    id: "confort",
    name: "Confort & Expérience Patient",
    items: [
      {
        id: "co-1",
        q: "Les soins sont-ils adaptés aux patients anxieux ?",
        a: "Une approche douce et personnalisée est privilégiée afin d’assurer une expérience rassurante et confortable.",
      },
      {
        id: "co-2",
        q: "Qu’est-ce que la sédation consciente ?",
        a: "La sédation consciente au protoxyde d’azote aide à réduire le stress et améliorer le confort pendant les soins.",
      },
      {
        id: "co-3",
        q: "Les enfants peuvent-ils être pris en charge au centre ?",
        a: "Oui, des soins adaptés aux enfants sont proposés dans une approche rassurante et bienveillante.",
      },
    ],
  },
];

const FEATURED_FAQS = FAQ_CATEGORIES.map((category) => ({
  categoryId: category.id,
  categoryName: category.name,
  ...category.items[0],
}));

function FaqNestedItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqEntry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderTop: "1px solid #d4c4c8" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "16px",
        }}
      >
        <span
          style={{
            color: "#591727",
            fontSize: "15px",
            fontWeight: 500,
            fontFamily: "var(--font-seasons-reg)",
            lineHeight: 1.45,
          }}
        >
          {item.q}
        </span>
        <span style={{ color: "#6b1228", fontSize: "14px", flexShrink: 0 }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? "400px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.35s ease",
        }}
      >
        <p
          style={{
            color: "#591727",
            fontSize: "15px",
            lineHeight: 1.75,
            fontFamily: "var(--font-seasons-reg)",
            fontWeight: 400,
            padding: "0 0 16px",
            margin: 0,
          }}
        >
          {item.a}
        </p>
      </div>
    </div>
  );
}

// ─── FaqSection component ───────────────────────────────────────────────────
function FaqSection() {
  const [openFeaturedId, setOpenFeaturedId] = useState<string | null>(null);
  const [showCategoryMore, setShowCategoryMore] = useState(false);
  const [openNestedId, setOpenNestedId] = useState<string | null>(null);

  const toggleFeatured = (id: string) => {
    if (openFeaturedId === id) {
      setOpenFeaturedId(null);
      setShowCategoryMore(false);
      setOpenNestedId(null);
      return;
    }
    setOpenFeaturedId(id);
    setShowCategoryMore(false);
    setOpenNestedId(null);
  };

  return (
    <section
      style={{
        background: "#FFFFFF",
        fontFamily: "var(--font-seasons-reg)",
        padding: "80px 0 100px",
      }}
    >
      <div
        className="faq-inner"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          gap: "90px",
          alignItems: "flex-start",
          marginRight: "62px",
        }}
      >
        <div style={{ flex: "0 0 340px" }}>
          <h2
            style={{
              color: "#6b1228",
              fontSize: "29px",
              fontWeight: 600,
              fontFamily: "var(--font-cinzel)",
              lineHeight: 1.2,
              marginBottom: "28px",
              letterSpacing: "0.01em",
            }}
          >
            Frequently Asked Questions (FAQ)
          </h2>
          <p
            style={{
              color: "#45383B",
              fontSize: "18px",
              lineHeight: 1.6,
              fontFamily: "var(--font-seasons-reg)",
              fontWeight: 400,
            }}
          >
            Explorez les questions les plus fréquentes sur nos traitements, notre approche
            clinique et les technologies modernes utilisées au sein du centre.
          </p>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          {FEATURED_FAQS.map((faq) => {
            const isOpen = openFeaturedId === faq.id;
            const category = FAQ_CATEGORIES.find((c) => c.id === faq.categoryId);
            const relatedItems =
              category?.items.filter((item) => item.id !== faq.id) ?? [];

            return (
              <div
                key={faq.id}
                style={{
                  overflow: "hidden",
                  border: "1px solid #753141",
                  borderRadius: isOpen ? "12px" : "0",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFeatured(faq.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "22px 24px",
                    background: "#f0f0f0",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "20px",
                    borderRadius: isOpen ? "12px 12px 0 0" : "0",
                  }}
                >
                  <span
                    style={{
                      color: isOpen ? "#6b1220" : "#591727",
                      fontSize: "17px",
                      fontWeight: 500,
                      fontFamily: "var(--font-seasons-reg)",
                      lineHeight: 1.4,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {faq.q}
                  </span>
                  <span style={{ color: isOpen ? "#6b1228" : "#300E16", fontSize: "18px", flexShrink: 0 }}>
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                <div
                  style={{
                    background: "#F0F0F0",
                    maxHeight: isOpen ? "1200px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.45s cubic-bezier(.4,0,.2,1)",
                    borderRadius: isOpen ? "0 0 12px 12px" : "0",
                  }}
                >
                  <div style={{ padding: "4px 24px 20px" }}>
                    <p
                      style={{
                        color: "#591727",
                        fontSize: "16px",
                        lineHeight: 1.8,
                        fontFamily: "var(--font-seasons-reg)",
                        fontWeight: 400,
                        margin: "0 0 16px",
                      }}
                    >
                      {faq.a}
                    </p>

                    {relatedItems.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCategoryMore((prev) => !prev);
                            setOpenNestedId(null);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontFamily: "var(--font-seasons-reg)",
                            fontSize: "15px",
                            lineHeight: 1.5,
                            textAlign: "left",
                          }}
                        >
                          <span style={{ color: "#591727" }}>En savoir plus — </span>
                          <span
                            style={{
                              color: "#6b1228",
                              fontWeight: 600,
                              textDecoration: "underline",
                              textUnderlineOffset: "3px",
                            }}
                          >
                            {faq.categoryName}
                          </span>
                          <span style={{ color: "#591727" }}> {showCategoryMore && isOpen ? "▲" : "▼"}</span>
                        </button>

                        {showCategoryMore && (
                          <div
                            style={{
                              marginTop: "12px",
                              paddingTop: "4px",
                              borderTop: "1px solid #c9b4b8",
                            }}
                          >
                            {relatedItems.map((item) => (
                              <FaqNestedItem
                                key={item.id}
                                item={item}
                                isOpen={openNestedId === item.id}
                                onToggle={() =>
                                  setOpenNestedId((prev) => (prev === item.id ? null : item.id))
                                }
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
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
  const [carouselCards, setCarouselCards] = useState<CarouselCard[]>(cards);
  const [page, setPage] = useState(0);
  const [isBlogPaused, setIsBlogPaused] = useState(false);
  const [blogPosts, setBlogPosts] = useState<
    { image: string; date: string; title: string; slug: string }[]
  >([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [isMobileStats, setIsMobileStats] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateMobile = () => setIsMobileStats(mediaQuery.matches);
    updateMobile();
    const listener = () => updateMobile();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, []);

  useEffect(() => {
    fetchPublicBlogs({ page: 1, limit: 8, sort: "recent" })
      .then((data) => {
        setBlogPosts(
          data.blogs.map((blog) => ({
            image: blog.image,
            date: blog.date,
            title: blog.title,
            slug: blog.slug,
          }))
        );
      })
      .catch(() => setBlogPosts([]));
  }, []);

  useEffect(() => {
    fetchPublicSpecialities()
      .then((specs) => {
        const dynamic: CarouselCard[] = specs.map((s) => ({
          title: s.title,
          sub:
            s.description?.slice(0, 140) ||
            "Découvrez nos soins spécialisés à Atlas Dental Center.",
          image: specialityImageUrl(s.heroImageUrl) || "/images/card10.png",
          href: specialityPagePath(s.slug),
        }));
        setCarouselCards([...cards, ...dynamic]);
      })
      .catch(() => setCarouselCards(cards));
  }, []);

  // Blog slider sizing + seamless animation math.
  // BlogCard width is fixed at 380px and the slider gap is 24px.
  const blogCardWidth = 380;
  const blogCardGap = 24;
  const blogShiftPx =
    blogPosts.length > 0 ? blogPosts.length * (blogCardWidth + blogCardGap) : 0;

  const statsData = [
    { value: '3000+', label: 'Patients', icon: '/images/icon1.png' },
    { value: '3+', label: 'Years of Experience', icon: '/images/icon2.png' },
    { value: '300+', label: 'Surgeries Performed', icon: '/images/icon3.png' },
    { value: '10+', label: 'Advanced Certifications', icon: '/images/icon4.png' },
    { value: '300+', label: 'Modern Technologies', icon: '/images/icon6.png' },
  ];

  const statsList = isMobileStats ? [...statsData, ...statsData] : statsData;

  return (
    <div className="flex flex-col">

      {/* ───────────────── All Styles (desktop unchanged + mobile additions) ───────────────── */}
      <style>{`

       @media (min-width: 426px) and (max-width: 769px) {

          body, html { overflow-x: hidden !important; max-width: 100vw !important; }

          .hero-section {
            flex-direction: row !important;
            align-items: flex-end !important;
            min-height: 480px !important;
            padding: 120px 20px 0px !important;
            overflow: visible !important;
            position: relative !important;
          }

            .hero-text h1 {
            font-size: 20px !important;
            transform: translateY(50px) !important;
            margin-bottom: 6px !important;
            line-height: 1.3 !important;
            white-space: normal !important;
            word-break: break-word !important;
            max-width: 400px !important;
          }

    @media (min-width: 426px) and (max-width: 769px) {

  .hero-mobile-doctor-col {
    display: flex !important;
    flex: 1 !important;
    justify-content: center !important;
    align-items: flex-end !important;
    overflow: hidden !important;
    transform: translateX(39px) !important;
    height: 260px !important;
    position: relative !important;
  }

  /* TARGET IMAGE */
  .hero-mobile-doctor-col img {
    transform: scale(1.9) !important;
    transform-origin: bottom center !important;
    width: auto !important;
    height: 100% !important;
    object-fit: contain !important;
    margin-left:40px !important;
  }

}
            .card2 {
    width: 182px !important;
    white-space: normal !important;
  }

  .card2 p,
  .card2 h3,
  .card2 span {
    white-space: normal !important;
    word-break: break-word !important;
    line-height: 2.3 !important;
  }

     
      }
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
          100% { transform: translateX(calc(-1 * var(--blog-shift, 0px))); }
        }
        @keyframes reviews-scroll {
          0%,   24% { transform: translateX(0%);   }
          33%,  57% { transform: translateX(-25%); }
          66%,  90% { transform: translateX(-50%); }
          100%      { transform: translateX(-75%); }
        }
        @keyframes reviews-scroll-mobile {
          0%,   24% { transform: translateX(0px); }
          33%,  57% { transform: translateX(calc(-1 * (100vw))); }
          66%,  90% { transform: translateX(calc(-2 * (100vw))); }
          99.9%     { transform: translateX(calc(-3 * (100vw))); }
          100%      { transform: translateX(0px); }
        }
        @keyframes dots-scroll {
          0%,   24% { transform: translateX(0px);  }
          33%,  57% { transform: translateX(18px); }
          66%,  90% { transform: translateX(36px); }
          99.9%     { transform: translateX(36px); opacity: 0; }
          100%      { transform: translateX(0px);  opacity: 1; }
        }
        @keyframes stats-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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
          animation: reviews-scroll 16s linear infinite;
        }



        /* ── DESKTOP GUARD: hide mobile-only hero elements on big screens ── */
     @media (max-width: 320px) {

   

  .hero-mobile-doctor-col {
    width: 100% !important;
    height: 80px !important;
    margin-top: 120px;
    overflow: hidden;
    position: relative;
  }

  .hero-mobile-doctor-col img {
     transform: scale(1.08) translateX(-16px) !important;
    object-fit: cover !important;
   transformOrigin: 'bottom right' !important;
  }

  .hero-mobile-doctor-col span img {
    transform: scale(1.08) !important;
  }
 .hero-mobile-cards-col {
  gap: 12px !important;
  transform: translateX(-10px);
}

.hero-mobile-cards-col > * {
  width: 48% !important;
}
   .card1p{
   margin-bottom:9px !important ;
   width:102px !important;
   }

}  
        @media (max-width:375px){
         .card1b{
   padding-bottom:2px !important ;
   width:70px !important;
   
  
   }
        }
   
        @media (min-width: 769px) {
          .hero-mobile-bottom-row { display: none !important; }
          .about-doc-img-desktop  { display: block !important; }
          .about-doc-img-mobile   { display: none !important; }
        
        }





        /* ── MOBILE (≤768px) ── */
        
        @media (max-width: 768px) {

          /* prevent full-page horizontal overflow */
          body, html { overflow-x: hidden !important; max-width: 100vw !important; }

          /* ── HERO ── */
          .hero-section {
            flex-direction: column !important;
            min-height: unset !important;
            padding: 100px 14px 0px !important;
            align-items: flex-start !important;
          }
          .hero-text {
            max-width: 100% !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 0 !important;
          }
          .hero-text h1 {
            font-size: 23px !important;
            transform: translateY(0) !important;
            margin-bottom: 3px !important;
            width: 100% !important;
            line-height: 1.3 !important;
          }
          .hero-text p {
            font-size: 11px !important;
            transform: translateY(0) !important;
            margin-bottom: 10px !important;
            max-width: 100% !important;
            width: 100% !important;
            line-height: 1.5 !important;
          }
          .hero-cards-row  { display: none !important; }
          .hero-doctor-img { display: none !important; }

          /* Mobile hero bottom row */
          .hero-mobile-bottom-row {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-end !important;
            width: 100% !important;
            gap: 10px !important;
            margin-top: 0 !important;
          }
          .hero-mobile-cards-col {
            display: flex !important;
            flex-direction: row !important;
            gap: 7px !important;
            flex: 0 0 58% !important;
            width: 58% !important;
            align-items: stretch !important;
          }
          .hero-mobile-cards-col > * {
            flex: 1 1 0% !important;
            min-width: 100px !important;
            width: 50% !important;
            min-height: 120px !important;
            height: 100px !important;
            margin-bottom: 12px !important;
          }
          .hero-mobile-doctor-col {
            display: flex !important;
            flex: 1 !important;
            justify-content: center !important;
            align-items: flex-end !important;
            overflow: visible !important;
            transform: translateX(29px);
          }
          .hero-mobile-doctor-col .relative {
            width: 100% !important;
            height: 230px !important;
            
          }
                .card1p{
   margin-bottom:-2px !important ;
   width:92px !important;
   }
             .card1b{
      position: relative !important;
   top: 8px !important;
   transform: translateY(2px) !important;
   }  
    .card2 p {
    margin-top:10px !important;
    font-size: 10px !important;
    line-height: 1.2 !important;
    max-width: 95px !important;
    min-width: 95px !important;
    white-space: normal !important;
    word-break: keep-all !important;
  }
          /* ── STATS ── */
          .stats-section-text {
            padding: 40px 20px 20px !important;
            max-width: 100% !important;
          }
          .stats-section-text h2 { font-size: 22px !important; }
          .stats-section-text p  { font-size: 15px !important; }
          .stats-wrapper { overflow: hidden !important; }
          .stats-row {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            padding: 0 !important;
            width: max-content !important;
            animation: stats-scroll 12s linear infinite !important;
            will-change: transform;
          }
          .stats-row:hover { animation-play-state: paused !important; }
          .stats-row > div {
            flex: 0 0 auto !important;
            width: min(200px, 44vw) !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding: 14px 16px !important;
            border-left: none !important;
            border-top: none !important;
            border-right: 2px solid #711C31 !important;
          }
          .stats-row > div > div[style*="position: absolute"] { display: none !important; }

          /* ── CARD CAROUSEL ── */
          .carousel-header {
            padding: 0 20px !important;
            margin-bottom: 24px !important;
          }
          .carousel-header h2 { font-size: 22px !important; }

          /* ── ABOUT / DOCTOR SECTION ── */
          .about-section {
            width: calc(100% - 28px) !important;
            max-width: 100% !important;
            margin-left: 14px !important;
            margin-right: 14px !important;
            margin-top: 24px !important;
            border-radius: 16px !important;
            height: 320px !important;
            overflow: hidden !important;
            position: relative !important;
          }
          .about-inner {
            flex-direction: row !important;
            min-height: unset !important;
            height: 100% !important;
          }
          .about-left {
            flex: 0 0 58% !important;
            width: 58% !important;
            padding: 22px 10px 20px 18px !important;
            justify-content: flex-start !important;
            z-index: 3 !important;
          }
          .about-left > div:first-child { margin-bottom: 8px !important; }
          .about-left > div:first-child span { font-size: 11px !important; }
          .about-left h2 {
            font-size: 13px !important;
            margin-bottom: 10px !important;
            line-height: 1.3 !important;
          }
          .about-left p {
            font-size: 10.5px !important;
            line-height: 1.5 !important;
            margin-bottom: 10px !important;
            text-indent: 0 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 4 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .about-left p:last-of-type { display: none !important; }
          .about-left button { font-size: 10px !important; padding: 7px 14px !important; }
          .about-doc-img-desktop { display: none !important; }
          .about-doc-img-mobile {
            display: block !important;
            position: absolute !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 44% !important;
            height: 100% !important;
            z-index: 4 !important;
            pointer-events: none !important;
          }

          @media (max-width: 768px) {

  /* hide last row cards */
  .reviews-track > div > div:nth-child(4),
  .reviews-track > div > div:nth-child(5) {
    display: none !important;
  }
}
          .reviews-section {
            padding: 60px 0px 16px !important;
            overflow: hidden !important;
          }
          .reviews-container-wrapper {
            overflow: hidden !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Switch track to mobile per-slide animation */
          .reviews-track {
            animation: reviews-scroll-mobile 15s linear infinite !important;
            gap: 0px !important;
            width: max-content !important;
          }
          /* Each "set" div becomes one full-viewport-width slide */
          .reviews-track > div {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto auto !important;
            gap: 12px !important;
            width: 100vw !important;
            min-width: 100vw !important;
            max-width: 100vw !important;
            box-sizing: border-box !important;
            flex-shrink: 0 !important;
            overflow: hidden !important;
            padding: 0 16px !important;
          }
          /* Adjust grid for max 4 cards (plus title card) */
          /* Since the prompt asks for max 4 cards in a row, but mobile is 2x2, we ensure cards are well spaced */
          .reviews-track > div > div {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 140px !important;
            max-height: none !important;
            padding: 14px !important;
            box-sizing: border-box !important;
            border-radius: 14px !important;
            border-top-left-radius: 14px !important;
            border-top-right-radius: 14px !important;
            border-bottom-left-radius: 14px !important;
            border-bottom-right-radius: 14px !important;
          }
          /* Text inside cards */
          .reviews-track > div > div p {
            font-size: 11px !important;
            line-height: 1.45 !important;
            margin: 5px 0 !important;
            text-indent: 0 !important;
            margin-left: 0 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 4 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .reviews-track > div > div span {
            font-size: 11px !important;
            margin-left: 0 !important;
            letter-spacing: 0 !important;
          }
          .reviews-track > div > div > div:first-child {
            font-size: 12px !important;
            margin-bottom: 4px !important;
            margin-left: 0 !important;
            letter-spacing: 1px !important;
          }
          /* Title card (first child) — spans both columns */
          .reviews-track > div > div:first-child {
            grid-column: 1 / 0 !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
            padding: 10px 14px !important;
            min-height: unset !important;
            height: auto !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .reviews-track > div > div:first-child h2 {
            font-size: 14px !important;
            margin: 0 !important;
            text-align: center !important;
            line-height: 1.2 !important;
          }
          .reviews-track > div > div:first-child img {
            width:  86px !important;
            height: 86px !important;
            flex-shrink: 0 !important;
            margin-top:12px !important;
          }

          /* ── BLOG ── */
         /* ── BLOG ── */
.blog-header {
  padding: 0 20px !important;
  margin-left: 0 !important;
  margin-bottom: 30px !important;
}
.blog-header h2  { font-size: 22px !important; }
.blog-header p   { font-size: 15px !important; }

.blog-track {
  padding-left: 14px !important;
  gap: 12px !important;
}

.blog-track .blog-card-wrapper {
  width: 165px !important;
  min-width: 205px !important;
  max-width: 195px !important;
  height: 240px !important;
  min-height: 240px !important;
  max-height: 240px !important;
  padding: 8px 8px 14px !important;
  border-radius: 14px !important;
  flex-shrink: 0 !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
}

.blog-track .blog-card-wrapper .blogimg {
  height: 9px !important;
  min-height: 95px !important;
  max-height: 95px !important;
  flex-shrink: 0 !important;
  border-radius: 10px !important;
  margin-bottom: 22px !important;
}

.blog-track .blog-card-wrapper p {
  font-size: 10px !important;
  margin-bottom: 4px !important;
  flex-shrink: 0 !important;
}

.blog-track .blog-card-wrapper h3 {
  font-size: 11px !important;
  line-height: 1.35 !important;
  flex: 1 !important;
  min-height: 45px !important;
  overflow: hidden !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 3 !important;
  -webkit-box-orient: vertical !important;
}

.blog-track .blog-card-footer-row {
  min-height: 45px !important;
}

.blog-track .blog-card-wrapper > div:last-child {
  flex-shrink: 0 !important;
  align-items: flex-end !important;
}

.blog-track .blog-card-wrapper > div:last-child > div:last-child {
  width: 30px !important;
  height: 30px !important;
  font-size: 15px !important;
  flex-shrink: 0 !important;
}

          /* ── FAQ ── */
          .faq-inner {
            flex-direction: column !important;
            gap: 32px !important;
            padding: 0 20px !important;
            margin-right: 0 !important;
            margin-top: -90px !important;
           
          }
          .faq-inner > div:first-child { flex: unset !important; }
          .faq-inner > div:first-child h2 { font-size: 22px !important; }
          .faq-inner > div:first-child p  { font-size: 15px !important; }

          /* ── WHY CHOOSE US / VIDEO ── */
          .why-section {
            padding: 0 20px !important;
            margin-bottom: 40px !important;
          }
          .why-header {
            flex-direction: column !important;
            gap: 16px !important;
            margin-bottom: 28px !important;
          }
          .why-header > div:first-child {
            flex: unset !important;
            margin-left: 0 !important;
          }
          .why-header > div:first-child h2 { font-size: 22px !important; }
          .why-header > div:last-child { padding-top: 0 !important; }
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
          .why-right-col p { font-size: 15px !important; }
        }

        /* ── TABLET (769px–1024px) ── */
        @media (min-width: 769px) and (max-width: 1024px) {
       Add these rules inside your existing @media (min-width: 769px) and (max-width: 1024px) block:

/* ── prevent all horizontal overflow ── */
body, html { overflow-x: hidden !important; max-width: 100vw !important; }

/* ── About section: override fixed 1150px width ── */
.about-section {
  width: calc(100% - 40px) !important;
  max-width: calc(100% - 40px) !important;
  margin-left: 20px !important;
  margin-right: 20px !important;
  height: auto !important;
  min-height: 400px !important;
  border-radius: 16px !important;
}

/* ── Reviews: fluid grid columns instead of fixed 388px ── */
.reviews-section {
  padding: 60px 10px 10px !important;
  overflow: hidden !important;
}
.reviews-container-wrapper {
  overflow: hidden !important;
  width: 100% !important;
}
.reviews-track > div {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 12px !important;
  width: 100vw !important;
  min-width: 100vw !important;
  max-width: 100vw !important;
  box-sizing: border-box !important;
  padding: 0 20px !important;
  flex-shrink: 0 !important;
}
.reviews-track > div > div {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: auto !important;
  min-height: 220px !important;
  box-sizing: border-box !important;
  
}
/* Switch animation to per-slide (same as mobile) */
.reviews-track {
  animation: reviews-scroll-mobile 15s linear infinite !important;
  gap: 0px !important;
  width: max-content !important;
}

/* ── Hero section ── */
.hero-section {
  padding: 140px 24px 30px !important;
  overflow: hidden !important;
}
.hero-text h1 { transform: translateY(0) !important; }
.hero-text p  { transform: translateY(0) !important; }
.hero-cards-row {
  margin-left: 0 !important;
  margin-top: 20px !important;
  position: relative !important;
}

/* ── Stats ── */
.stats-section-text {
  padding: 40px 24px 20px !important;
  max-width: 100% !important;
}
.stats-wrapper { overflow: hidden !important; }

/* ── Card carousel header ── */
.carousel-header { padding: 0 24px !important; }

/* ── Blog ── */
.blog-header {
  padding: 0 24px !important;
  margin-left: 0 !important;
}

/* ── FAQ ── */
.faq-inner {
  padding: 0 24px !important;
  margin-right: 0 !important;
  flex-direction: column !important;
  gap: 32px !important;
}
.faq-inner > div:first-child { flex: unset !important; }

/* ── Why section ── */
.why-section { padding: 0 24px !important; }
.why-header {
  flex-direction: row !important;
  gap: 90px !important;
  margin-bottom: 28px !important;
}
.why-header > div:first-child {
  flex: unset !important;
  margin-left: 0 !important;
}
.why-body { flex-direction: row !important; margin-left: 0 !important; }
.why-video-col { flex: unset !important; width: 100% !important; }
.why-right-col  { flex: unset !important; width: 100% !important; }


        /* ── MEDIUM DESKTOP (1000px–1280px) — fix about + why overflow ── */
        @media (min-width: 1025px) and (max-width: 1280px) {
          .about-section {
            width: calc(100% - 80px) !important;
            max-width: calc(100% - 80px) !important;
            margin-left: 60px !important;
            margin-right: 40px !important;
          }
          .why-header {
            gap: 60px !important;
          }
          .why-header > div:first-child {
            flex: 0 0 280px !important;
          }
          .reviews-container-wrapper { overflow: hidden !important; }
          .reviews-section { padding: 60px 30px 10px !important; }
        }

        @media (min-width: 1400px) {
  .about-section {
  margin-left:-200px !important;
    transform: translateX(-100px);
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
        <div className="hero-text relative z-10 flex flex-col max-w-[520px]">

          <h1
            className="text-white font-bold uppercase leading-tight mb-8"
            style={{ fontFamily: "var(--font-cinzel)", fontSize: '34px', letterSpacing: '0.01em', transform: 'translateY(90px)' }}
          >
            L' art du sourire{' '}
            <span style={{ color: '#D3D3D3', fontSize: '34px' }}>naturel.</span>
          </h1>

          <p
            className="font-light leading-relaxed mb-11 max-w-[420px]"
            style={{ fontSize: '17px', letterSpacing: '0.01em', transform: 'translateY(70px)', color: '#F0F0F0' }}
          >
            Des soins dentaires précis et personnalisés réalisés <br /> 
            avec expertise et attention. <br /> 
          </p>

          {/* ── MOBILE ONLY: 2 cards + doctor in one row ── */}
          <div  className="hero-mobile-bottom-row" style={{ display: 'none' }}>
            <div className=" hero-mobile-cards-col">
              {/* Card 1 — Subscribe */}
              <div
                className="card1 rounded-2xl relative overflow-hidden flex flex-col items-center justify-end"
                style={{ background: '#5c0d2a', padding: '8px', border: '1.5px solid #FFFFFF' }}
              >
                <div  style={{ position: 'absolute', inset: 0, backgroundImage: 'url("/images/cardhero.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.45, zIndex: 0 }} />
                <div  className="card1p" style={{ position: 'relative', zIndex: 1, background: '#F0F0F0', borderRadius: '8px', padding: '8px 8px 12px', width: '100%', marginBottom: '10px' }}>
                  <div   style={{ position: 'absolute', bottom: '-10px', right: '0px', width: 0, height: 0, borderTop: '18px solid #F0F0F0', borderLeft: '14px solid transparent', borderRight: '2px solid transparent' }} />
                  <p style={{ color: '#6b1228', fontSize: '10.5px', lineHeight: 1.45, textAlign: 'center', fontFamily: "var(--font-seasons-reg)", fontWeight: 600, margin: 0 }}>
                    Abonnez-vous à<br />nos actualités et<br />mises à jour
                  </p>
                </div>
                <div className="card1b">
                <button  style={{ position: 'relative', zIndex: 1, background: '#F0F0F0', color: '#6b1228', border: 'none', padding: '4px 12px', borderRadius: '999px', fontFamily: "var(--font-seasons-reg)", fontSize: '10px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em', transform: 'translateY(-6px)' }}>
                  S'abonner
                </button>
                </div>
              </div>

              {/* Card 2 — Reservation */}
              <Link href="/pages/Appointment" className="block relative z-50" style={{ flex: 1, display: 'flex' }}>
                <div
                  className=" card2 rounded-2xl flex flex-col items-center justify-center cursor-pointer"
                  style={{ border: "1.5px solid #FFFFFF", background: "#898989", padding: "12px 8px", gap: "8px", position: "relative", zIndex: 50, width: '100%' }}
                >
                  <div style={{ position: "relative", width: "46px", height: "46px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Image src="/images/teeth.png" alt="Dental doctor" fill className="object-contain object-bottom translate-y-1 scale-190" priority />
                    <div style={{ position: "absolute", top: "-5px", right: "-4px", width: "17px", height: "17px", background: "#711C31", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, lineHeight: 1 }}>
                      +
                    </div>
                  </div>
                  <p
  className="text-center"
  style={{
    color: "#3d0a1e",
    fontSize: "10.5px",
    lineHeight: 1.35,
    fontFamily: "var(--font-seasons-reg)",
    fontWeight: 700,
    margin: 0,
  }}
>
  Réservation en ligne <br />
  instantanée
</p>
                </div>
              </Link>
            </div>

            {/* Right: Doctor image */}
            <div className="hero-mobile-doctor-col">
              <div className="relative" style={{ width: '100%', height: '230px', position: 'relative' }}>
                <Image
                  src="/images/udrimage.png"
                  alt="Dental doctor"
                  fill
                  className="object-contain object-bottom"
                  style={{ transform: 'translateY(4px) scale(1.55)', transformOrigin: 'bottom right'}}
                  priority
                />
              </div>
            </div>
          </div>

          {/* ── DESKTOP ONLY: original cards row ── */}
          <div className="hero-cards-row flex items-end relative z-20 gap-3.5 ml-[470px]">
            {/* Card 1 — Subscribe */}
            <div className="rounded-2xl flex-shrink-0 relative overflow-hidden flex flex-col items-center justify-end" style={{ background: '#5c0d2a', width: '183px', minHeight: '180px', padding: '10px', border: '1.5px solid #FFFFFF' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("/images/cardhero.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.45, zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1, background: '#F0F0F0', borderRadius: '10px', padding: '14px 12px 18px', width: '100%', marginBottom: '18px' }}>
                <div style={{ position: 'absolute', bottom: '-14px', right: '0px', width: 0, height: 0, borderTop: '26px solid #F0F0F0', borderLeft: '19px solid transparent', borderRight: '2px solid transparent' }} />
                <p style={{ color: '#6b1228', fontSize: '13px', lineHeight: 1.55, textAlign: 'center', fontFamily: "var(--font-seasons-reg)", fontWeight: 600, margin: 0 }}>
                  Abonnez-vous à<br />nos actualités et<br />mises à jour
                </p>
              </div>
              <button style={{ position: 'relative', zIndex: 1, background: '#F0F0F0', color: '#6b1228', border: 'none', padding: '7px 22px', borderRadius: '999px', fontFamily: "var(--font-seasons-reg)", fontSize: '12px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em', transform: 'translateY(-10px)' }}>
                S'abonner
              </button>
            </div>

            {/* Card 2 — Reservation */}
            <Link href="/pages/Appointment" className="block relative z-50">
              <div className="rounded-2xl flex flex-col items-center justify-center shadow-xl flex-shrink-0 cursor-pointer" style={{ border: "1.5px solid #FFFFFF", background: "#898989", width: "182px", minHeight: "180px", padding: "22px 18px 20px", gap: "14px", position: "relative", zIndex: 50 }}>
                <div style={{ position: "relative", width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Image src="/images/teeth.png" alt="Dental doctor" fill className="object-contain object-bottom translate-y-1 scale-190" priority />
                  <div style={{ position: "absolute", top: "-8px", bottom: "-11px", right: "0px", width: "22px", height: "22px", background: "#711C31", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "18px", fontWeight: 700, lineHeight: 1, boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>
                    +
                  </div>
                </div>
                <p className="text-center" style={{ color: "#3d0a1e", fontSize: "14px", lineHeight: 1.4, fontFamily: "var(--font-seasons-reg)", fontWeight: 700 }}>
                  Réservation en ligne instantanée
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ── DESKTOP ONLY: Doctor image ── */}
        <div className="hero-doctor-img relative z-0 flex flex-1 justify-end items-end self-stretch pointer-events-none">
          <div className="relative w-[380px] h-[460px]">
            <Image src="/images/udrimage.png" alt="Dental doctor" fill className="object-contain object-bottom translate-y-1 scale-130 " priority />
          </div>
        </div>
      </section>

      {/* ───────────────── Stats Section ───────────────── */}
      <section style={{ background: '#FFFFFF', fontFamily: "var(--font-seasons-reg)" }} className="w-full">
        <div className="stats-section-text px-22 pt-16 pb-8" style={{ maxWidth: '700px' }}>
          <h2 style={{ color: '#5A1628', fontSize: '29px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.3, marginBottom: '14px' }}>
            Pourquoi choisir notre centre dentaire ?
          </h2>
          <p style={{ color: '#4a3728', fontSize: '17px', lineHeight: 1.75, fontFamily: "var(--font-seasons-reg)", fontWeight: 500, maxWidth: '620px' }}>
          Choisissez notre centre dentaire pour une combinaison parfaite de technologie 
avancée et de soins personnalisés. Notre équipe d'experts est dédiée à fournir 
des traitements précis et sans stress dans un environnement moderne conçu 
pour votre confort.
          </p>
        </div>
        <div className="stats-wrapper" style={{ background: '#f0f0f0', border: '1px solid #753141' }}>
          <div className="stats-row flex items-stretch">
            {statsList.map((stat, i) => (
              <div
                key={i}
                className={isMobileStats ? 'flex-shrink-0 flex flex-col justify-center' : 'flex-1 flex flex-col justify-center'}
                style={{
                  padding: '14px 20px 20px',
                  marginLeft: isMobileStats ? '0' : '90px',
                  minWidth: isMobileStats ? '180px' : undefined,
                  position: 'relative',
                }}
              >
                {i < statsData.length && <div style={{ display: isMobileStats ? 'none' : 'block', position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: '70%', width: '2px', background: '#711C31' }} />}
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
      <section className="overflow-hidden py-10" style={{ background: '#FFFFFF', fontFamily: "var(--font-seasons-reg)" }}>
        <div className="carousel-header px-20 mb-10" style={{ maxWidth: '900px' }}>
          <h2 style={{ color: '#5A1628', fontSize: '29px', fontWeight: 600, marginBottom: '8px', fontFamily: "var(--font-cinzel)" }}>
            Nos spécialités
          </h2>
        </div>
        <div className="overflow-hidden w-full">
          <div className="overflow-hidden w-full" onMouseLeave={() => setOpenIndex(null)}>
            <div
              className="flex"
              style={{
                gap: '20px',
                width: 'max-content',
                animation: 'carousel-scroll 32s linear infinite',
                animationPlayState: openIndex !== null ? 'paused' : 'running',
              }}
            >
              {[...carouselCards, ...carouselCards].map((card, i) => {
                const realIndex = i % carouselCards.length;
                const isOpen = openIndex === realIndex;
                return (
                  <div
                    key={`card-${i}`}
                    className="flex-shrink-0 flex flex-col justify-between relative overflow-hidden rounded-2xl"
                    onMouseEnter={() => setOpenIndex(realIndex)}
                    style={{ width: isOpen ? '290px' : '200px', minHeight: '200px', border: '1px solid #711C31', padding: '24px 20px 20px', background: isOpen ? '#0a1520' : '#f0f0f0', transition: 'width 0.5s cubic-bezier(.4,0,.2,1), background 0.4s', cursor: 'pointer' }}
                  >
                    <div style={{ position: 'absolute', width: '212px', height: '212px', top: '100px', left: '-80px', background: '#D3D3D3', opacity: 0.99, borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: isOpen ? `linear-gradient(135deg, rgba(90,22,39,0.7), rgba(113,28,49,0.9)), url(${card.image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', opacity: isOpen ? 1 : 0, transition: 'opacity 0.5s', zIndex: 0, borderRadius: '16px' }} />
                    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: isOpen ? '#ffffff' : '#711C31', lineHeight: 1.4, marginBottom: '14px', fontFamily: "var(--font-cinzel)" }}>{card.title}</h3>
                      <div style={{ fontSize: '12px', color: isOpen ? '#ffffff' : '#711C31', lineHeight: 1.7, overflow: 'hidden', maxHeight: isOpen ? '100px' : '0px', opacity: isOpen ? 1 : 0, transition: 'max-height 0.5s cubic-bezier(.4,0,.2,1), opacity 0.4s', fontFamily: "var(--font-seasons-reg)" }}>{card.sub}</div>
                    </div>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                      {card.href ? (
                        <Link href={card.href} style={{ fontSize: '11px', letterSpacing: '1.5px', fontWeight: '700', textTransform: 'uppercase', color: isOpen ? '#ffffff' : '#711C31', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "var(--font-seasons-reg)", padding: 0, transition: 'color 0.2s', textDecoration: 'none' }}>Read More</Link>
                      ) : (
                        <button style={{ fontSize: '11px', letterSpacing: '1.5px', fontWeight: '700', textTransform: 'uppercase', color: isOpen ? '#ffffff' : '#711C31', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "var(--font-seasons-reg)", padding: 0, transition: 'color 0.2s' }}>Read More</button>
                      )}
                      <div style={{ position: 'absolute', right: isOpen ? 'auto' : '0px', left: isOpen ? '90px' : 'auto', width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid #b8955a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', color: isOpen ? '#711C31' : '#FFFFFF', background: isOpen ? '#F0F0F0' : '#711C31', transform: isOpen ? 'rotate(0deg)' : 'rotate(320deg)', transition: 'transform 0.4s ease, background 0.3s, color 0.3s' }}>→</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── About / Doctor Section (hidden on home page) ───────────────── */}
      {false && (
      <section
        className="about-section"
        style={{ background: 'linear-gradient(15deg, #5c0d2a 0%, #5c0d2a 10%, #5c0d2a 100%)', height: '640px', width: '1150px', maxWidth: '95%', marginTop: '80px', marginLeft: '100px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)', zIndex: 1, pointerEvents: 'none' }} />
        <div className="about-inner" style={{ display: 'flex', minHeight: '220px', position: 'relative', zIndex: 2 }}>
          <div className="about-left" style={{ flex: '0 0 62%', padding: '60px 56px 60px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '1.5px', background: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontStyle: 'italic', letterSpacing: '0.04em', fontFamily: "var(--font-seasons-reg)" }}>À propos</span>
            </div>
            <h2 style={{ color: '#FFFFFF', fontSize: 'clamp(22px, 2.5vw, 24px)', fontWeight: 700, lineHeight: 1.2, marginBottom: '28px', fontFamily: "var(--font-cinzel)", letterSpacing: '0.01em', display: 'inline-block', maxWidth: '100%' }}>
              Dr. Ghita Ouazzani Tnacheri
            </h2>
            <p style={{ color: '#FFFFFF', fontSize: '20px', lineHeight: 1.35, marginBottom: '28px', fontWeight: 400, textIndent: '2.5em' }}>
              Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet augue est arcu.
              Sit congue dolor neque orci sed ornare arcu adipiscing. Nec mollis ut tellus auctor.
              Sed etiam a ut non lacinia sagittis id. Pretium scelerisque urna eget sit vitae risus
              tellus arcu. Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet augue
              est arcu. Sit congue dolor neque orci sed ornare arcu adipiscing. Nec mollis ut
              tellus auctor. Sed etiam a ut non lacinia sagittis id. Pretium scelerisque urna eget
              sit vitae risus tellus arcu.
            </p>
            <p style={{ color: '#FFFFFF', fontSize: '20px', lineHeight: 1.35, marginBottom: '44px', fontFamily: "var(--font-seasons-reg)", fontWeight: 400, textIndent: '2.5em' }}>
              Sed etiam a ut non lacinia sagittis id. Pretium scelerisque urna eget sit vitae
              risus tellus arcu. Lorem ipsum dolor sit amet consectetur. Eu mi sed lacus mi amet au.
            </p>
            <div>
              <Link href="/pages/Appointment">
                <button
                  style={{ background: 'transparent', border: '1.5px solid #FFFFFF', color: '#FFFFFF', padding: '12px 30px', borderRadius: '999px', fontSize: '14px', fontFamily: "var(--font-seasons-reg)", fontWeight: 500, letterSpacing: '0.04em', cursor: 'pointer', transition: 'background 0.3s, color 0.3s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#591727'; (e.currentTarget as HTMLButtonElement).style.color = '#f0e6d3'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#f0e6d3'; }}
                >
                  Prendre rendez-vous
                </button>
              </Link>
            </div>

            {/* Desktop image */}
            <div className="about-doc-img-desktop">
              <Image
                src="/images/aboutDoc.png"
                alt="Dr. Ghita Ouazzani Tnacheri"
                fill
                style={{ filter: 'grayscale(100%)', marginTop: '46px', objectFit: 'contain', objectPosition: 'bottom right', transform: 'translateX(480px) scale(0.88)', minHeight: '520px' }}
                priority
              />
            </div>
          </div>
          <div style={{ flex: '1', position: 'relative', minHeight: '320px', zIndex: 10 }} />
        </div>

        {/* Mobile image */}
        <div className="about-doc-img-mobile">
          <Image
            src="/images/aboutDoc.png"
            alt="Dr. Ghita Ouazzani Tnacheri"
            fill
            style={{ filter: 'grayscale(100%)', objectFit: 'contain', objectPosition: 'bottom right' }}
            priority
          />
        </div>
      </section>
      )}

      {/* ───────────────── Reviews Section ───────────────── */}
 <section
        className="reviews-section"
        style={{
          background: '#FFFFFF',
          
          overflow: 'hidden',
          padding: '60px 92px 10px',
          position: 'relative',
        }}
      >
        <div className="reviews-container-wrapper" style={{ overflow: 'hidden', width: '100%' }}>
          <div className="reviews-track">
            {[0, 1, 2, 0].map((setIndex, i) => (
              <div
                key={i}
                className="reviews-grid"

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
                <div style={{ width: '360px', height: '280px', background: '#f0f0f0', borderRadius: '24px', padding: '30px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '26px', letterSpacing: '4px' }}>★★★★★</div>
                  <p style={{ color: '#3d0818', fontSize: '15px', lineHeight: 1.4, fontWeight: 400, margin: '10px 0', flex: 1 }}>"{reviews[setIndex % reviews.length]?.text}"</p>
                  <span style={{ color: '#3d0818', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{reviews[setIndex % reviews.length]?.name}</span>
                </div>

                {/* ── Row 1, Col 3 ── */}
                <div style={{ width: '360px', height: '280px', background: '#a86e70', borderRadius: '25px 180px 25px 25px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '22px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#6b1228', fontSize: '15px', lineHeight: 1.4, fontWeight: 400, margin: '10px 0', flex: 1 }}>"{reviews[(setIndex + 1) % reviews.length]?.text}"</p>
                  <span style={{ color: '#6b1228', fontSize: '17px', fontWeight: 500, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{reviews[(setIndex + 1) % reviews.length]?.name}</span>
                </div>

                {/* ── Row 2, Col 1 ── */}
                <div style={{ width: '360px', height: '280px', background: '#f0f0f0', borderRadius: '25px 25px 25px 180px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', marginLeft:'20px', fontSize: '25px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#3d0818', fontSize: '15px', lineHeight: 1.4,  fontWeight: 400, margin: '10px 20px', flex: 1 }}>"{reviews[(setIndex + 2) % reviews.length]?.text}"</p>
                  <span style={{ color: '#3d0818', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif", marginLeft: '56px' }}>-{reviews[(setIndex + 2) % reviews.length]?.name}</span>
                </div>

                {/* ── Row 2, Col 2 ── */}
                <div style={{ width: '360px', height: '280px', background: '#c7ae9a', borderRadius: '24px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '22px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#3d0818', fontSize: '15px', lineHeight: 1.4,  fontWeight: 400, margin: '10px 0', flex: 1 }}>"{reviews[(setIndex + 3) % reviews.length]?.text}"</p>
                  <span style={{ color: '#3d0818', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{reviews[(setIndex + 3) % reviews.length]?.name}</span>
                </div>

                {/* ── Row 2, Col 3 ── */}
                <div style={{ width: '360px', height: '280px', background: '#936562', borderRadius: '25px 25px 180px 25px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '22px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#6b1228', fontSize: '15px', lineHeight: 1.4,fontWeight: 400, margin: '10px 0', flex: 1 }}>"{reviews[(setIndex + 4) % reviews.length]?.text}"</p>
                  <span style={{ color: '#6b1228', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{reviews[(setIndex + 4) % reviews.length]?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots */}
       {/* Pagination dots */}
{/* Pagination dots */}
<div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
  <div style={{ position: 'relative', display: 'flex', gap: '10px', alignItems: 'center' }}>
    {[...Array(TOTAL_PAGES)].map((_, i) => (
      <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c4a87a' }} />
    ))}
    <div
  className="active-dot-indicator"
  style={{
    position: 'absolute',
    left: '0px',
    width: '10px',
    height: '8px',
    borderRadius: '999px',
    background: '#3d0814',
    animation: 'dots-scroll 15s linear infinite',
  }}
/>
  </div>
</div>
      </section>

      {/* ───────────────── Blog Carousel Section ───────────────── */}
      <section style={{ background: '#FFFFFF', fontFamily: "var(--font-seasons-reg)", padding: '70px 0 80px', overflow: 'hidden' }}>
        <div className="blog-header" style={{ padding: '0 70px', marginBottom: '48px', marginLeft: '15px' }}>
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
            paddingLeft: '60px',
            ['--blog-shift' as any]: `${blogShiftPx}px`,
          }}>
            {(blogPosts.length > 0 ? [...blogPosts, ...blogPosts] : []).map((post, i) => (
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
        style={{ background: '#FFFFFF', fontFamily: "var(--font-seasons-reg)", padding: '0px 60px', marginBottom: '60px' }}
      >
        {/* Header */}
        <div
          className="why-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '410px' }}
        >
          <div style={{ flex: '0 0 380px', marginLeft: '25px' }}>
            <p style={{ color: '#6b1228', fontSize: '16px', fontStyle: 'italic', marginBottom: '16px', marginTop: '20px', letterSpacing: '0.04em' }}>
            Nous accueillons une patientèle locale et internationale.
            </p>
            <h2 style={{ color: '#6b1228', fontSize: '29px', fontWeight: 600, fontFamily: "var(--font-cinzel)", textTransform: 'uppercase', lineHeight: 1.1, letterSpacing: '0.02em' }}>
              Pourquoi nous choisir ?
            </h2>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', paddingTop: '28px' }}>
            <p style={{ color: '#6b1228', fontSize: '17px', lineHeight: 1.6, fontFamily: "var(--font-seasons-reg)", fontWeight: 400, maxWidth: '480px' }}>
            Atlas Dental Center : Le choix d’une patientèle en quête d’excellence.
            </p>
            <Link href="/pages/Appointment">
              <button
                style={{ background: '#5c0d2a', border: 'none', color: '#f0e6d3', padding: '14px 32px', borderRadius: '999px', fontSize: '15px', fontFamily: "var(--font-seasons-reg)", fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer', transition: 'background 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#7a1038')}
                onMouseLeave={e => (e.currentTarget.style.background = '#5c0d2a')}
              >
                Prendre rendez-vous
              </button>
            </Link>
          </div>
        </div>

        {/* Body: video + right col */}
        <div className="why-body" style={{ display: 'flex', gap: '29px', alignItems: 'flex-start', marginLeft: '10px',}}>
          <div
            className="why-video-col"
            style={{ flex: '0 0 62%', position: 'relative', border: '1px solid #753141', borderRadius: '16px', overflow: 'hidden', background: '#1a1008', aspectRatio: '17/9', cursor: 'pointer',marginTop: '110px' }}
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
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid #711C31', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#711C31', fontSize: '26px' }}>
                  ▶
                </div>
              </div>
            )}
          </div>

          <div className="why-right-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '40px' }}>
            <div
              style={{
                width: '100%',
                borderRadius: '16px',
                border: '1px solid #753141',
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '4 / 5',
                lineHeight: 0,
              }}
            >
              <Image
                src="/images/drfooter.jpeg"
                alt="Clinic treatment"
                fill
                sizes="(max-width: 768px) 100vw, 35vw"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center center',
                }}
              />
            </div>
            <p style={{ color: '#5c0d2a', fontSize: '17px', lineHeight: 1.4, fontFamily: "var(--font-seasons-reg)", fontWeight: 40 }}>
            L’équilibre entre santé, esthétique et précision au service de votre sourire.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

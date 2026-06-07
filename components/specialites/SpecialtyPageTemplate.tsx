"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { PublicSpecialityDetail } from "@/utils/specialitiesApi";
import { specialityImageUrl } from "@/utils/specialitiesApi";

type AccordionCard = PublicSpecialityDetail["accordionCards"][number];

function MobileAccordionCards({ cards }: { cards: AccordionCard[] }) {
  const [active, setActive] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(0);
  }, [cards.length]);

  useEffect(() => {
    if (!isVisible || cards.length === 0) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVisible, cards.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (cards.length === 0) return null;

  return (
    <div ref={containerRef}>
      <div
        style={{
          display: "flex",
          gap: 8,
          height: 340,
          padding: "0 16px",
          alignItems: "stretch",
          perspective: "1000px",
          overflow: "hidden",
        }}
      >
        {cards.map((card, index) => {
          const isActive = active === card.id;
          const imgSrc = specialityImageUrl(card.imgSrc);
          return (
            <div
              key={card.id}
              onClick={() => setActive(card.id)}
              style={{
                flex: isActive ? "5 1 0%" : "0.35 1 0%",
                borderRadius: 20,
                overflow: "hidden",
                isolation: "isolate",
                WebkitMaskImage: "-webkit-radial-gradient(white, black)",
                cursor: isActive ? "default" : "pointer",
                transition:
                  "flex 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.8s cubic-bezier(0.4,0,0.2,1)",
                position: "relative",
                background: imgSrc
                  ? "transparent"
                  : `linear-gradient(160deg,${card.accent} 0%,#3a1020 100%)`,
                minWidth: 0,
                transform: !isVisible ? "translateX(60px)" : "translateZ(0)",
                opacity: isVisible ? 1 : 0,
                transitionDelay: !isVisible ? `${index * 0.12}s` : "0s",
                zIndex: isActive ? 10 : 1,
                boxShadow: isActive ? "0 16px 40px -8px rgba(0,0,0,0.55)" : "none",
              }}
            >
              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={card.imgAlt}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 1.2s ease",
                    transform: isActive ? "scale(1.04)" : "scale(1)",
                  }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: isActive
                    ? "linear-gradient(to top,rgba(71,12,26,0.85) 10%,rgba(71,12,26,0.25) 60%,transparent 100%)"
                    : "linear-gradient(to top,rgba(71,12,26,0.85) 0%,rgba(71,12,26,0.55) 100%)",
                  transition: "background 0.6s ease",
                }}
              />
              {!isActive && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform: "rotate(180deg)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "1.5px",
                      whiteSpace: "nowrap",
                      userSelect: "none",
                    }}
                  >
                    {card.label}
                  </span>
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "20px 14px",
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background: "#43121e",
                    borderRadius: 50,
                    padding: "4px 12px",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      color: "#F0F0F0",
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {card.label}
                  </span>
                </div>
                <p
                  style={{
                    color: "#fff",
                    fontSize: 12,
                    lineHeight: 1.5,
                    fontWeight: 300,
                    margin: 0,
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
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? 24 : 7,
              height: 6,
              borderRadius: 3,
              border: "none",
              outline: "none",
              cursor: "pointer",
              background: i === active ? "#7B2D3E" : "rgba(113,28,49,0.3)",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AccordionCards({ cards }: { cards: AccordionCard[] }) {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(0);
  }, [cards.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isHovered || !isVisible || cards.length === 0) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, isVisible, cards.length]);

  if (cards.length === 0) return null;

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
      {cards.map((card, index) => {
        const isActive = active === card.id;
        const imgSrc = specialityImageUrl(card.imgSrc);
        return (
          <div
            key={card.id}
            onClick={() => setActive(card.id)}
            style={{
              flex: isActive ? "5 1 0%" : "0.48 1 0%",
              borderRadius: "32px",
              overflow: "hidden",
              isolation: "isolate",
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
              cursor: isActive ? "default" : "pointer",
              transition:
                "flex 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              background: imgSrc
                ? "transparent"
                : `linear-gradient(160deg, ${card.accent} 0%, #3a1020 100%)`,
              minWidth: 0,
              transform: !isVisible ? "translateX(100px)" : "translateZ(0)",
              opacity: isVisible ? 1 : 0,
              transitionDelay: !isVisible ? `${index * 0.15}s` : "0s",
              zIndex: isActive ? 10 : 1,
              boxShadow: isActive ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "none",
            }}
          >
            {imgSrc && (
              <img
                src={imgSrc}
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
            {!isActive && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 1,
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

const WHY_IMAGE_MAX_WIDTH = 600;
const WHY_IMAGE_MIN_WIDTH = 540;
const WHY_IMAGE_REF_HEIGHT = 430;

function computeWhyImageWidth(
  measuredContentHeight: number,
  bulletCount: number
): number {
  if (bulletCount >= 3) return WHY_IMAGE_MAX_WIDTH;

  const richness = Math.min(
    1,
    Math.max(
      measuredContentHeight / WHY_IMAGE_REF_HEIGHT,
      bulletCount > 0 ? bulletCount / 3 : 0
    )
  );

  return Math.round(
    WHY_IMAGE_MIN_WIDTH + richness * (WHY_IMAGE_MAX_WIDTH - WHY_IMAGE_MIN_WIDTH)
  );
}

function WhyAtlasSection({
  whyImage,
  heading1,
  title,
  description1,
  visibleBullets,
  isMobile,
}: {
  whyImage: string;
  heading1: string;
  title: string;
  description1: string;
  visibleBullets: { title: string; text: string }[];
  isMobile: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [imageWidth, setImageWidth] = useState(WHY_IMAGE_MAX_WIDTH);
  const [contentHeight, setContentHeight] = useState(WHY_IMAGE_REF_HEIGHT);

  useEffect(() => {
    if (isMobile) return;

    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      const height = Math.round(el.getBoundingClientRect().height);
      setContentHeight(height);
      setImageWidth(computeWhyImageWidth(height, visibleBullets.length));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [heading1, description1, visibleBullets, isMobile]);

  return (
    <section
      className="de-why"
      style={{
        background: "#FFFFFF",
        padding: "72px 0px",
        display: "flex",
        gap: 64,
        alignItems: "flex-start",
      }}
    >
      <div
        className="de-why-image"
        style={{
          ...(isMobile
            ? {}
            : {
                width: imageWidth,
                height: contentHeight,
                maxHeight: contentHeight,
                flexShrink: 0,
                alignSelf: "flex-start",
              }),
          borderRadius: "1px 100px 100px 1px",
          overflow: "hidden",
          border: "1px solid #711C31",
          background: "linear-gradient(135deg,#d4c5a9,#9e8070)",
          position: "relative",
        }}
      >
        <img
          src={whyImage}
          alt={heading1 || title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <div
        ref={contentRef}
        className="de-why-content"
        style={{
          flex: 1,
          paddingTop: 8,
          paddingRight: 60,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
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
          {heading1}
        </h2>
        <p
          style={{
            fontSize: 16.5,
            lineHeight: 1.4,
            color: "#5D5153",
            fontWeight: 500,
            marginBottom: visibleBullets.length > 0 ? 28 : 0,
            paddingRight: 50,
          }}
        >
          {description1}
        </p>
        {visibleBullets.length > 0 && (
          <div
            className="de-why-bullets"
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            {visibleBullets.map((bullet, i) => (
              <BulletItem key={i} title={bullet.title} text={bullet.text} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

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
        <strong
          style={{
            fontWeight: 540,
            fontSize: "19px",
            color: "#4F1422",
            fontFamily: "var(--font-seasons)",
          }}
        >
          {title}
        </strong>{" "}
        {text}
      </p>
    </div>
  );
}

export default function SpecialtyPageTemplate({
  data,
}: {
  data: PublicSpecialityDetail;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const heroImage = specialityImageUrl(data.heroImageUrl) || "/images/heroimg1.jpg";
  const whyImage = specialityImageUrl(data.image1Url) || "/images/afterimg.jpg";

  const visibleBullets = useMemo(
    () =>
      (data.bullets ?? []).filter(
        (b) => b.title?.trim() || b.text?.trim()
      ),
    [data.bullets]
  );

  const cards = useMemo(
    () =>
      (data.accordionCards ?? [])
        .filter((c) => c.label?.trim() || c.desc?.trim() || c.imgSrc?.trim())
        .map((c, index) => ({ ...c, id: index })),
    [data.accordionCards]
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 1440px) {
        .de-intro-shadow {
  display:none !important;
}
               @media (max-width: 1024px) {
        .de-intro-shadow {
   display:none !important;
}
        @media (max-width: 768px) {
        .de-intro-shadow {
  display: none !important;
}

          .de-hero {
            height: 240px !important;
            margin-top: 130px !important;
          }
          .de-hero-title {
            bottom: 20px !important;
            left: 20px !important;
            right: 20px !important;
          }
          .de-hero-title h1 {
            font-size: 18px !important;
          }
          .de-hero-title h1 span:last-child {
            font-size: 13px !important;
          }

          .de-intro {
            padding: 36px 20px !important;
          }
          .de-intro p {
            font-size: 14px !important;
            max-width: 100% !important;
          }

          .de-why {
            flex-direction: column !important;
            padding: 40px 20px !important;
            gap: 28px !important;
          }
          .de-why-image {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 600 / 430 !important;
            min-height: 0 !important;
            flex-shrink: unset !important;
            border-radius: 16px !important;
          }
          .de-why-content {
            padding-right: 0 !important;
            padding-top: 0 !important;
          }
          .de-why-content h2 {
            font-size: 20px !important;
            margin-bottom: 12px !important;
          }
          .de-why-content h2 br { display: none !important; }
          .de-why-content > p {
            font-size: 14px !important;
            padding-right: 0 !important;
            margin-bottom: 20px !important;
          }

          .de-accordion-section {
            padding-bottom: 40px !important;
          }
          .de-accordion-section h2 {
            font-size: 22px !important;
            margin-bottom: 24px !important;
            padding: 0 16px !important;
          }

          .de-cta {
            padding: 0 20px 48px !important;
          }
        }

        @media (max-width: 400px) {
          .de-hero { height: 200px !important; }
        }
      `}</style>

      <main style={{ background: "#FFFFFF" }}>
        <section
          className="de-hero"
          style={{
            position: "relative",
            width: "100%",
            height: 380,
            marginTop: "120px",
            background: "linear-gradient(135deg,#3a1a20 0%,#1a0a10 100%)",
            overflow: "hidden",
          }}
        >
          <img
            src={heroImage}
            alt={data.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 44%",
              transform: "scaleX(-1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right,rgba(0,0,0,0.70) 60%,rgba(0,0,0,0.70) 60%)",
            }}
          />
          <div
            className="de-hero-title"
            style={{ position: "absolute", bottom: 132, left: 48 }}
          >
            <h1
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: "#FFFFFF",
                lineHeight: 1.2,
              }}
            >
              <span style={{ fontWeight: 600 }}>{data.title}</span>
              {data.heroSubtitle ? (
                <>
                  <br />
                  <span
                    style={{
                      fontWeight: 500,
                      fontSize: 16,
                      color: "#FFFFFF",
                      display: "inline-block",
                    }}
                  >
                    {data.heroSubtitle}
                  </span>
                </>
              ) : null}
            </h1>
          </div>
        </section>

        <section
          className="de-intro"
          style={{
            background: "#711C31",
            padding: "56px 160px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "#FFFFFF",
              fontWeight: 300,
              maxWidth: 700,
              margin: "0 auto 28px",
            }}
          >
            {data.description}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: 8,
            }}
          >
            <div style={{ width: 60, height: 1, background: "#FFFFFF" }} />
            <span style={{ color: "#FFFFFF", fontSize: 14 }}>★</span>
            <div style={{ width: 60, height: 1, background: "#FFFFFF" }} />
          </div>
          <div
            className="de-intro-shadow"
            style={{
              position: "absolute",
              bottom: 9,
              left: 0,
              right: 0,
              height: "170px",
              background:
                "linear-gradient(to top, rgba(36, 5, 15, 0.95) 0%, rgba(36, 5, 15, 0.55) 35%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        </section>

        <WhyAtlasSection
          whyImage={whyImage}
          heading1={data.heading1}
          title={data.title}
          description1={data.description1}
          visibleBullets={visibleBullets}
          isMobile={isMobile}
        />

        <section
          className="de-accordion-section"
          style={{ background: "#FAF7F2", paddingBottom: 64 }}
        >
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
            {data.heading2 || data.title}
          </h2>
          {cards.length > 0 ? (
            isMobile ? (
              <MobileAccordionCards cards={cards} />
            ) : (
              <AccordionCards cards={cards} />
            )
          ) : null}
        </section>

        <section
          className="de-cta"
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
              color: "#FFFFFF",
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

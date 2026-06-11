'use client';

import Image from "next/image";
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  fetchPublicSpecialities,
  specialityPagePath,
  type PublicSpecialityListItem,
} from '@/utils/specialitiesApi';

export default function Header() {
  const [specialitesOpen, setSpecialitesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSpecialitesOpen, setMobileSpecialitesOpen] = useState(false);
  const [dynamicSpecialities, setDynamicSpecialities] = useState<PublicSpecialityListItem[]>([]);

  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    fetchPublicSpecialities()
      .then(setDynamicSpecialities)
      .catch(() => setDynamicSpecialities([]));
  }, []);

  const specialiteNavItems = useMemo(
    () =>
      dynamicSpecialities.map((s) => ({
        name: s.title,
        path: specialityPagePath(s.slug),
      })),
    [dynamicSpecialities]
  );

  return (
    <>
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 2000,
          padding: isHomePage ? '10px 32px' : '40px 60px',
          background: 'transparent',
          fontFamily: "var(--font-seasons-reg)",
        }}
      >
        {/* Top row — social icons (HIDE on other pages) */}
        {isHomePage && (
          <div
            className="header-social-top"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '14px',
              marginBottom: '6px',
              marginRight: '8px'
            }}
          >
            {[
              {
                label: 'Instagram',
                href: '#',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1" fill="#FFD52F" stroke="none" />
                  </svg>
                )
              },
              {
                label: 'YouTube',
                href: '#',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#3d0a1e" />
                  </svg>
                )
              },
              {
                label: 'TikTok',
                href: '#',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.03-8.16a8.24 8.24 0 0 0 4.83 1.54V5.26a4.85 4.85 0 0 1-1.03-.57z" />
                  </svg>
                )
              },
            ].map(({ label, href, icon }) => (
              <Link key={label} href={href} aria-label={label} style={{ opacity: 0.85, display: 'flex', alignItems: 'center' }}>
                {icon}
              </Link>
            ))}
          </div>
        )}

        {/* Main row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          {/* Logo */}
          <Image
            src="/images/altaslogo.png"
            alt="Atlas Dental Center"
            width={153}
            height={94}
            className="header-logo"
            style={{
              marginRight: '10px',
              filter: isHomePage
                ? 'none'
                : 'brightness(0) saturate(100%) invert(16%) sepia(41%) saturate(1876%) hue-rotate(314deg) brightness(92%) contrast(95%)'
            }}
          />

          {/* Desktop Nav — hidden on mobile */}
          <nav
            className="header-desktop-nav"
            style={{
              flex: 1,
              maxWidth: '560px',
              border: isHomePage ? '1px solid #FFFFFF' : 'none',
              borderRadius: '50px',
              padding: '8px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '4px',
            }}
          >
            {[{ name: 'Accueil', path: '/' }, { name: 'Notre centre', path: '/pages/notre-centre' }].map((item) => (
              <Link
                key={item.name}
                href={item.path}
                style={{
                  color: isHomePage ? '#FFFFFF' : '#711C31',
                  textDecoration: 'none',
                  fontSize: '14.5px',
                  fontFamily: "var(--font-seasons-reg)",
                  padding: '2px 8px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.name}
              </Link>
            ))}

            <div
              style={{ position: 'relative' }}
              onMouseLeave={() => setSpecialitesOpen(false)}
            >
              <button
                onClick={() => setSpecialitesOpen(!specialitesOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isHomePage ? '#FFFFFF' : '#711C31',
                  fontSize: '14.5px',
                  fontFamily: "var(--font-seasons-reg)",
                  cursor: 'pointer',
                  padding: '2px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                Nos spécialités
                <span style={{ fontSize: '10px' }}>▾</span>
              </button>

              {specialitesOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: '#FFFFFF',
                    border: '1px solid rgba(232,201,122,0.3)',
                    borderRadius: '8px',
                    minWidth: '160px',
                    zIndex: 100,
                    marginTop: '0px',
                    paddingTop: '15px',
                  }}
                >
                  {specialiteNavItems.map((s) => (
                    <Link
                      key={s.name}
                      href={s.path}
                      onClick={() => setSpecialitesOpen(false)}
                      style={{
                        display: 'block',
                        color: '#591727',
                        textDecoration: 'none',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontFamily: "var(--font-seasons-reg)"
                      }}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/pages/a-propos" style={{ color: isHomePage ? '#FFFFFF' : '#711C31', textDecoration: 'none', fontSize: '14.5px', fontFamily: "var(--font-seasons-reg)", whiteSpace: 'nowrap' }}>
              Notre équipe
            </Link>

            <Link href="/pages/avant-apres" style={{ color: isHomePage ? '#FFFFFF' : '#711C31', textDecoration: 'none', fontSize: '14.5px', fontFamily: "var(--font-seasons-reg)", whiteSpace: 'nowrap' }}>
              Avant/Après
            </Link>
          </nav>

          {/* Desktop Contact + Account buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              href="/pages/contact"
              className="header-desktop-contact"
              style={{
                background: isHomePage ? '#FFFFFF' : '#551625',
                color: isHomePage ? '#3d0a1e' : '#FFFFFF',
                borderRadius: '30px',
                padding: isHomePage ? '6px 30px' : '6px 50px',
                fontFamily: "var(--font-seasons-reg)",
                fontSize: '14.5px',
                fontWeight: 500,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                border: '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = isHomePage ? "#551625" : "#FFFFFF";
                el.style.color = isHomePage ? "#FFFFFF" : "#551625";
                el.style.border = isHomePage ? "1px solid #FFFFFF" : "1px solid #551625";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = isHomePage ? "#FFFFFF" : "#551625";
                el.style.color = isHomePage ? "#551625" : "#FFFFFF";
                el.style.border = '1px solid transparent';
              }}
            >
              Contact
            </Link>

          </div>
         
          {/* Hamburger — mobile only */}
          <button
            className="header-hamburger"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              flexDirection: 'column',
              gap: '5px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileMenuOpen ? (
              /* X icon */
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke={isHomePage ? '#FFFFFF' : '#591727'} strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke={isHomePage ? '#FFFFFF' : '#591727'} strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div
          className="header-mobile-drawer"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1999,
            background: isHomePage ? 'rgba(61,10,30,0.97)' : 'rgba(255,255,255,0.98)',
            display: 'flex',
            flexDirection: 'column',
            padding: '100px 32px 40px',
            gap: '0px',
            overflowY: 'auto',
          }}
        >
          {/* Nav links */}
          {[
            { name: 'Accueil', path: '/' },
            { name: 'Notre centre', path: '/pages/notre-centre' },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: isHomePage ? '#FFFFFF' : '#591727',
                textDecoration: 'none',
                fontSize: '18px',
                fontFamily: "var(--font-seasons-reg)",
                padding: '14px 0',
                borderBottom: isHomePage ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(89,23,39,0.15)',
              }}
            >
              {item.name}
            </Link>
          ))}

          {/* Spécialités accordion */}
          <div style={{ borderBottom: isHomePage ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(89,23,39,0.15)' }}>
            <button
              onClick={() => setMobileSpecialitesOpen(o => !o)}
              style={{
                background: 'none',
                border: 'none',
                color: isHomePage ? '#FFFFFF' : '#591727',
                fontSize: '18px',
                fontFamily: "var(--font-seasons-reg)",
                cursor: 'pointer',
                padding: '14px 0',
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              Notre spécialités
              <span style={{ fontSize: '14px', transition: 'transform 0.2s', display: 'inline-block', transform: mobileSpecialitesOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>
            {mobileSpecialitesOpen && (
              <div style={{ paddingLeft: 16, paddingBottom: 8 }}>
                {specialiteNavItems.map((s) => (
                  <Link
                    key={s.name}
                    href={s.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'block',
                      color: isHomePage ? 'rgba(255,255,255,0.8)' : '#711C31',
                      textDecoration: 'none',
                      padding: '10px 0',
                      fontSize: '15px',
                      fontFamily: "var(--font-seasons-reg)",
                    }}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/pages/a-propos"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: isHomePage ? '#FFFFFF' : '#591727',
              textDecoration: 'none',
              fontSize: '18px',
              fontFamily: "var(--font-seasons-reg)",
              padding: '14px 0',
              borderBottom: isHomePage ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(89,23,39,0.15)',
            }}
          >
            À propos de moi
          </Link>

          <Link
            href="/pages/avant-apres"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: isHomePage ? '#FFFFFF' : '#591727',
              textDecoration: 'none',
              fontSize: '18px',
              fontFamily: "var(--font-seasons-reg)",
              padding: '14px 0',
              borderBottom: isHomePage ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(89,23,39,0.15)',
            }}
          >
            Avant/Après
          </Link>

          {/* Contact button */}
          <Link
            href="/pages/contact"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              marginTop: 32,
              textAlign: 'center',
              background: isHomePage ? '#FFFFFF' : '#551625',
              color: isHomePage ? '#3d0a1e' : '#FFFFFF',
              borderRadius: '30px',
              padding: '12px 40px',
              fontFamily: "var(--font-seasons-reg)",
              fontSize: '16px',
              fontWeight: 500,
              textDecoration: 'none',
              alignSelf: 'flex-start',
            }}
          >
            Contact
          </Link>

          {/* Social icons at bottom (home page only) */}
          {isHomePage && (
            <div style={{ display: 'flex', gap: 18, marginTop: 40 }}>
              {[
                {
                  label: 'Instagram', href: '#',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1" fill="#FFD52F" stroke="none" /></svg>
                },
                {
                  label: 'YouTube', href: '#',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#3d0a1e" /></svg>
                },
                {
                  label: 'TikTok', href: '#',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.03-8.16a8.24 8.24 0 0 0 4.83 1.54V5.26a4.85 4.85 0 0 1-1.03-.57z" /></svg>
                },
              ].map(({ label, href, icon }) => (
                <Link key={label} href={href} aria-label={label} style={{ opacity: 0.85 }}>{icon}</Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Responsive CSS ── */}
      <style>{`
        /* Mobile: show hamburger, hide desktop nav + contact */
        @media (max-width: 768px) {
          .header-social-top {
            display: none !important;
          }
          .header-logo {
            margin-left: -15px !important;
            width: 120px !important;
            height: auto !important;
          }
          .header-desktop-nav {
            display: none !important;
          }
          .header-desktop-contact {
            display: none !important;
          }
          .header-hamburger {
            display: flex !important;
            position: relative;
            z-index: 2001; /* Above drawer */
          }
          .header-mobile-drawer {
            display: flex !important;
          }
        }

        /* Tablet (768–1024): also hide nav, show hamburger */
        @media (min-width: 769px) and (max-width: 1024px) {
          .header-desktop-nav {
            display: none !important;
          }
          .header-desktop-contact {
            display: none !important;
          }
          .header-hamburger {
            display: flex !important;
          }
        }

        /* Desktop (1025px+): original layout, no hamburger */
        @media (min-width: 1025px) {
          .header-hamburger {
            display: none !important;
          }
          .header-desktop-nav {
            display: flex !important;
          }
          .header-desktop-contact {
            display: inline-flex !important;
          }
          .header-mobile-drawer {
            display: none !important;
          }
        }
      `}</style>

    </>
  );
}

'use client';

import Image from "next/image";
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [specialitesOpen, setSpecialitesOpen] = useState(false);

  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD52F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD52F">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#3d0a1e" />
                </svg>
              )
            },
            {
              label: 'TikTok',
              href: '#',
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFD52F">
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
          gap: '20px'
        }}
      >

        {/* Logo (maroon on other pages) */}
        <Image
          src="/images/altaslogo.png"
          alt="Atlas Dental Center"
          width={153}
          height={94}
         style={{
  marginRight: '10px',
  filter: isHomePage
    ? 'none'
    : 'brightness(0) saturate(100%) invert(16%) sepia(41%) saturate(1876%) hue-rotate(314deg) brightness(92%) contrast(95%)'
}}
        />

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            maxWidth: '560px',
            border: isHomePage ? '1px solid #FFD52F' : 'none',
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
                color: isHomePage ? '#f0dfa8' : '#711C31',
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

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setSpecialitesOpen(!specialitesOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: isHomePage ? '#f0dfa8' : '#711C31',
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
              Notre spécialités
              <span style={{ fontSize: '10px', opacity: 0.7 }}>▾</span>
            </button>

            {specialitesOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: '#ffe9bf',
                  border: '1px solid rgba(232,201,122,0.3)',
                  borderRadius: '8px',
                  padding: '8px 0',
                  minWidth: '160px',
                  zIndex: 100,
                  marginTop: '6px'
                }}
              >
                {[
                  { name: 'Dentisterie Esthétique', path: '/pages/specialites/Dentisterie_Esthetique' },
                  { name: 'Orthodontie', path: '/specialites/orthodontie' },
                  { name: 'Esthétique', path: '/specialites/esthetique' },
                  { name: 'Chirurgie', path: '/specialites/chirurgie' }
                ].map((s) => (
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

          <Link href="/pages/a-propos" style={{ color: isHomePage ? '#f0dfa8' : '#711C31', textDecoration: 'none' }}>
            À propos de moi
          </Link>

          <Link href="/pages/avant-apres" style={{ color: isHomePage ? '#f0dfa8' : '#711C31', textDecoration: 'none' }}>
            Avant/Après
          </Link>
        </nav>

        {/* Contact */}
        <Link
          href="/pages/contact"
          style={{
            background: isHomePage ? '#F2E5C5' : '#551625',
            color: isHomePage ? '#3d0a1e' : '#F2D9A3',
            borderRadius: '30px',
            padding: isHomePage ? '6px 30px': '6px 50px',
            marginRight:isHomePage ?'5px':'30px',
            fontFamily: "var(--font-seasons-reg)",
            fontSize: '14.5px',
            fontWeight: 500,
            textDecoration: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          Contact
        </Link>
      </div>
    </header>
  );
}
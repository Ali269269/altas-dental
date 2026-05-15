"use client";

import Image from "next/image";
import { useState } from "react";
import { FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

const socialLinkStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  transition: "background 0.3s",
  background: "transparent",
};

function SocialLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      style={{
        ...socialLinkStyle,
        background: hovered ? "#c8960a22" : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: hovered ? "#c8960a" : "#f0e6d3",
        fontSize: "17px",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

function ContactLink({
  href,
  icon,
  children,
}: {
  href?: string;
  icon: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  const content = (
    <>
      <span
        style={{
          color: "#c8960a",
          fontSize: "17px",
          marginTop: "1px",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          color: hovered ? "#c8960a" : "#f0e6d3",
          fontSize: "17px",
          fontFamily: "var(--font-seasons-reg)",
          transition: "color 0.2s",
          lineHeight: 1.2,
        }}
      >
        {children}
      </span>
    </>
  );

  return (
    <div
      style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {href ? (
        <a
          href={href}
          style={{
            display: "flex",
            gap: "12px",
            textDecoration: "none",
            alignItems: "flex-start",
          }}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [btnHovered, setBtnHovered] = useState(false);
  const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Notre centre", href: "/dashboard" },
  { label: "Nos spécialités", href: "/dashboard" },
  { label: "Notre équipe", href: "/notre-equipe" },
  { label: "Blogs", href: "/pages/Blogs" },
];

  return (
    <footer
  style={{
    backgroundImage: `
      linear-gradient(
        to bottom right,
        rgba(20, 0, 8, 0.85) 0%,
        rgba(40, 5, 18, 0.35) 25%,
        rgba(0, 0, 0, 0.05) 60%
      ),
      url('/images/footerbg.png')
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'left',
    backgroundRepeat: 'no-repeat',
    fontFamily: "var(--font-seasons-reg)",
  }}
>
      {/* ── Main content ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "45px",
          padding: "60px 80px 50px",
        }}
      >
        {/* COL 1 */}
       <div
  style={{
    flex: "0 0 300px",
    display: "flex",
    flexDirection: "column",
  }}
>
  {/* Logo + Social */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "2px", // small gap between logo and socials
      marginBottom: "42px", // bigger gap before newsletter
    }}
  >
    {/* Logo */}
    <div
      style={{
        width: "74px",
        height: "74px",
        position: "relative",
      }}
    >
      <Image
        src="/images/logo.png"
        alt="Atlas Dental Center"
        fill
        style={{
          objectFit: "contain",
          transform: "scale(1.99) translateY(-5px)",
          
          marginLeft: "25px",
        }}
      />
    </div>

    {/* Socials */}
    <div
      style={{
        display: "flex",
        gap: "1px",
        marginLeft: "6px",
      }}
    >
      <SocialLink href="#">
        <FaInstagram size={18} color="#c8960a" />
      </SocialLink>

      <SocialLink href="#">
        <FaYoutube size={18} color="#c8960a" />
      </SocialLink>

      <SocialLink href="#">
        <FaTiktok size={18} color="#c8960a" />
      </SocialLink>
    </div>
  </div>

  {/* Newsletter */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      width:"300px",
     
    }}
  >
    <span
      style={{
        color: "#c8960a",
        fontSize: "11px",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        fontWeight: 600,
        marginLeft:"2px",
      }}
    >
      SUBSCRIBE TO OUR NEWSLETTER
    </span>

    <div
      style={{
        display: "flex",
        border: "1.5px solid #c8960a",
        borderRadius: "999px",
        padding: "10px 10px 10px 20px",
        alignItems: "center",
      }}
    >
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre email"
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#f0e6d3",
        }}
      />

      <button
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: btnHovered ? "#e8b020" : "",
          border: "none",
          cursor: "pointer",
          color:"#FFD52F"
        }}
      >
        →
      </button>
    </div>
  </div>
</div>

        {/* COL 2 */}
        <div style={{ flex: 1 }}>
          <h4 style={{ color: "#c8960a", marginBottom: "20px", fontWeight:500 }}>
            Navigation
          </h4>

          {navItems.map((item) => (
  <div key={item.label} style={{ marginBottom: "12px" }}>
    <NavLink href={item.href}>{item.label}</NavLink>
  </div>
))}
        </div>

        {/* COL 3 */}
        <div style={{ flex: 1 }}>
          <h4 style={{ color: "#c8960a", marginBottom: "20px" ,fontWeight:500}}>
            Timings
          </h4>

          <p style={{ color: "#f0e6d3" }}>Monday- Friday:  8am–6 pm</p>
          <p style={{ color: "#f0e6d3" }}>SATURDAY:  8am–6 pm</p>
          <p style={{ color: "#f0e6d3" }}>SUNDAY: Off</p>
        </div>

        {/* COL 4 */}
        <div style={{ flex: 1 }}>
          <h4 style={{ color: "#c8960a", marginBottom: "20px", fontWeight:500}}>
            Contacts
          </h4>

          <ContactLink icon="✉">contact@atlasdentalcenter.com</ContactLink>
          <ContactLink icon="☎">05 37 77 77 79 -
             06 68 20 10 10</ContactLink>
          <ContactLink icon="📍">Ang Av Atlas, 61 rue Oued Oum Errabi n. 5, 2ème étage, Agdal - RABAT</ContactLink>
        </div>
      </div>

      {/* Bottom */}
      <div
        style={{
          borderTop: "1px solid rgba(200,150,10,0.2)",
          padding: "18px 60px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: "#ffffff" }}>
          © Atlas Dental Center 2026
        </span>

        <div style={{ display: "flex", gap: "10px" }}>
          <NavLink href="/pages/Privacy_Policy">Privacy Policy</NavLink>
          <NavLink href="/pages/Terms_condition">Terms & Conditions</NavLink>
        </div>

        <span style={{ color: "#ffffff" }}>
          Designed & Developed by SMB DigitalZone
        </span>
      </div>
    </footer>
  );
}
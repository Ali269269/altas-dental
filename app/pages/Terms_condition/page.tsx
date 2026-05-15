"use client";

export default function TermsConditionpage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');

        .terms-page {
          background: #EFE7CE;
          min-height: 100vh;
          font-family: 'Cormorant Garamond', 'Georgia', serif;
        }

        .terms-eyebrow {
          
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0em;
          text-transform: uppercase;
          color: #591727;
          text-align: center;
          margin-bottom: 14px;
        }

        .terms-main-title {
       
          font-size: 36px;
          font-weight: 600;
          color: #591727;
          text-align: center;
          line-height: 1.25;
          margin-bottom: 10px;
          letter-spacing: 0.01em;
        }

        .terms-main-title span.cap {
        
        }

        .terms-date {
       
          font-size: 20px;
          font-weight: 400;
          
          color: #591727;
          text-align: center;
          margin-bottom: 0;
        }

        .terms-card {
          background: #faf8f3;
          border-radius: 6px;
          padding: 72px 64px 48px;
          margin: 36px auto 0;
          max-width: 900px;
         
        }

        .terms-section {
          margin-bottom: 36px;
        }

        .terms-section:last-of-type {
          margin-bottom: 0;
        }

        .terms-section-title {
       
          font-size: 22px;
          font-weight: 600;
         
          color: #591727;
          margin-bottom: 14px;
          line-height: 1.3;
        }

        .terms-body {
          
          font-size: 18px;
          font-weight: 600;
          color: #5D5153;
          line-height: 1.28;
          margin-bottom: 14px;
        }

        .terms-body:last-child {
          margin-bottom: 0;
        }

        .terms-divider {
          border: none;
          border-top: 1px solid #d4c9b8;
          margin: 44px 0 32px;
        }

        .terms-contact-block {
          text-align: center;
        }

        .terms-contact-text {
          
          font-size: 17.5px;
          font-weight: 600;
          
          color: #5D5153;
          margin-bottom: 8px;
          line-height: 1.6;
        }

        .terms-contact-email {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 18px;
          font-weight: 500;
          color: #591727;
          text-decoration: none;
          display: block;
          text-align: center;
        
        }

        .terms-contact-email:hover {
          opacity: 0.75;
        }
      `}</style>

      <main className="terms-page">
        <section style={{ padding: "180px 80px 72px", background: "#f4eee1" }}>

          {/* Eyebrow */}
          <p className="terms-eyebrow">Informations Légales</p>

          {/* Main Title */}
          <h1 className="terms-main-title">
            <span className="cap">C</span>onditions{" "}
            <span className="cap">G</span>énérales<br />
            d&apos;<span className="cap">U</span>tilisation
          </h1>

          {/* Date */}
          <p className="terms-date">
            Dernière mise à jour : 24 Mai 2024
          </p>

          {/* Content Card */}
          <div className="terms-card">

            {/* 1. Introduction */}
            <div className="terms-section">
              <h2 className="terms-section-title">1. Introduction</h2>
              <p className="terms-body">
                Bienvenue sur le site web d&apos;Atlas Dental Center. En accédant à ce site, vous acceptez de vous
                conformer aux présentes conditions générales d&apos;utilisation. Ces conditions régissent votre utilisation
                de notre site web et des services fournis par Atlas Dental Center.
              </p>
              <p className="terms-body">
                Si vous n&apos;acceptez pas ces conditions, nous vous prions de ne pas utiliser ce site. Nous nous réservons
                le droit de modifier ces termes à tout moment, et il vous appartient de les consulter régulièrement.
              </p>
            </div>

            {/* 2. Utilisation du Site */}
            <div className="terms-section">
              <h2 className="terms-section-title">2. Utilisation du Site</h2>
              <p className="terms-body">
                Le contenu de ce site est fourni à titre d&apos;information générale uniquement. Bien que nous nous
                efforcions de maintenir les informations à jour et exactes, nous ne garantissons pas
                l&apos;exhaustivité ou l&apos;exactitude des informations médicales présentées.
              </p>
              <p className="terms-body">
                L&apos;utilisation de ce site ne remplace en aucun cas une consultation médicale professionnelle, un
                diagnostic ou un traitement. Demandez toujours l&apos;avis de votre dentiste ou d&apos;un autre
                professionnel de santé qualifié pour toute question relative à une condition médicale.
              </p>
            </div>

            {/* 3. Propriété Intellectuelle */}
            <div className="terms-section">
              <h2 className="terms-section-title">3. Propriété Intellectuelle</h2>
              <p className="terms-body">
                L&apos;ensemble du contenu présent sur ce site, incluant les textes, graphismes, logos, images et
                codes sources, est la propriété exclusive d&apos;Atlas Dental Center ou de ses concédants de licence
                et est protégé par les lois internationales sur le droit d&apos;auteur.
              </p>
              <p className="terms-body">
                Toute reproduction, distribution ou modification de ce contenu sans l&apos;autorisation écrite
                préalable d&apos;Atlas Dental Center est strictement interdite.
              </p>
            </div>

            {/* 4. Confidentialité des Données */}
            <div className="terms-section">
              <h2 className="terms-section-title">4. Confidentialité des Données</h2>
              <p className="terms-body">
                Votre vie privée est importante pour nous. Notre politique de confidentialité explique comment
                nous collectons, utilisons et protégeons vos informations personnelles. En utilisant notre site,
                vous consentez au traitement de vos données tel que décrit dans notre politique de
                confidentialité.
              </p>
            </div>

            {/* 5. Limitation de Responsabilité */}
            <div className="terms-section">
              <h2 className="terms-section-title">5. Limitation de Responsabilité</h2>
              <p className="terms-body">
                Atlas Dental Center ne pourra être tenu responsable des dommages directs, indirects ou
                consécutifs résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser ce site web ou les informations
                qu&apos;il contient.
              </p>
            </div>

            {/* Divider */}
            <hr className="terms-divider" />

            {/* Contact block */}
            <div className="terms-contact-block">
              <p className="terms-contact-text">
                Pour toute question concernant ces conditions, veuillez nous contacter à :
              </p>
              <a href="mailto:contact@atlasdentalcenter.com" className="terms-contact-email">
                contact@atlasdentalcenter.com
              </a>
            </div>

          </div>

        </section>
      </main>
    </>
  );
}

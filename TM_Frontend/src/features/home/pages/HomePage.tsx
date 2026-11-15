import { Link } from "react-router-dom";
import { Logo } from "../../../shared/components/brand/Logo";

const features = [
  [
    "01",
    "Your brand on every bilty",
    "Add your carrier name, logo, colors, GSTIN, terms and the labels your customers already know.",
  ],
  [
    "02",
    "Records that stay connected",
    "Keep consignor, consignee, driver, vehicle, freight and delivery details with the consignment.",
  ],
  [
    "03",
    "A copy ready to share",
    "Print or save a clean PDF for each bilty, with a separate layout saved for your business account.",
  ],
];
export function HomePage() {
  return (
    <div className="home-page new-home">
      <header className="home-nav">
        <Link to="/" aria-label="BiltyFlow home">
          <Logo size={160} />
        </Link>
        <nav className="home-nav-links">
          <a href="#features">Features</a>
          <a className="optional" href="#customize">
            Your format
          </a>
          <Link to="/signin">Sign in</Link>
          <Link className="btn" to="/signup">
            Create workspace <span>↗</span>
          </Link>
        </nav>
      </header>
      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <span className="hero-kicker">
              <i /> BUILT FOR EVERY TRANSPORT BUSINESS
            </span>
            <h1>
              Your business.
              <br />
              <em>Your bilty.</em>
            </h1>
            <p>
              Make consignment notes that carry your company’s identity. Keep every trip organized,
              and download a polished PDF whenever you need it.
            </p>
            <div className="hero-actions">
              <Link className="btn" to="/signup">
                Set up your workspace <span>→</span>
              </Link>
              <a className="hero-text-link" href="#features">
                Explore BiltyFlow <span>↓</span>
              </a>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars">
                <b>✓</b>
                <b>↗</b>
                <b>▤</b>
              </div>
              <span>One workspace for each transport company</span>
            </div>
          </div>
          <div className="hero-art" aria-label="Preview of a custom transport consignment note">
            <div className="art-glow" />
            <div className="mini-dashboard">
              <div className="mini-top">
                <span className="mini-logo">BF</span>
                <div>
                  <b>Today’s movement</b>
                  <small>Tuesday · Your transport desk</small>
                </div>
                <span className="mini-live">
                  <i /> LIVE
                </span>
              </div>
              <div className="mini-stats">
                <div>
                  <small>Open bilties</small>
                  <b>24</b>
                </div>
                <div>
                  <small>In transit</small>
                  <b>08</b>
                </div>
                <div>
                  <small>Delivered</small>
                  <b>16</b>
                </div>
              </div>
              <div className="mini-paper">
                <div className="paper-brand">
                  <div className="paper-mark">RC</div>
                  <div>
                    <b>RIVER &amp; CO. CARRIERS</b>
                    <small>Transport · Logistics · Since 1998</small>
                  </div>
                  <span>CONSIGNEE COPY</span>
                </div>
                <div className="paper-title">
                  GOODS CONSIGNMENT NOTE <span>AT OWNER’S RISK</span>
                </div>
                <div className="paper-parties">
                  <div>
                    <small>CONSIGNOR</small>
                    <b>Mehta Industrial Supply</b>
                    <span>GSTIN · 27AAE...</span>
                  </div>
                  <i>→</i>
                  <div>
                    <small>CONSIGNEE</small>
                    <b>Western Parts Depot</b>
                    <span>GSTIN · 24AAD...</span>
                  </div>
                </div>
                <div className="paper-route">
                  <span>
                    VEHICLE <b>MH 12 · AB 4821</b>
                  </span>
                  <span>
                    FROM <b>Pune</b>
                  </span>
                  <span>
                    TO <b>Surat</b>
                  </span>
                </div>
                <div className="paper-goods">
                  <span>GOODS</span>
                  <b>Machine components</b>
                  <span>PACKAGES</span>
                  <b>18</b>
                  <span>FREIGHT</span>
                  <b>Rs. 8,450</b>
                </div>
                <div className="paper-sign">
                  <span>Consignor</span>
                  <span>Consignee</span>
                  <span>For carrier</span>
                </div>
              </div>
              <div className="floating-download">
                <span>↓</span>
                <div>
                  <b>Consignment PDF</b>
                  <small>Ready to save or print</small>
                </div>
                <i>PDF</i>
              </div>
            </div>
          </div>
        </section>
        <div className="home-trust">
          <span>EVERY RECORD, IN ONE PLACE</span>
          <i />
          <span>BILTIES</span>
          <i />
          <span>CUSTOMERS</span>
          <i />
          <span>VEHICLES</span>
          <i />
          <span>YOUR COMPANY’S FORMAT</span>
        </div>
        <section className="home-features" id="features">
          <div className="section-intro">
            <span className="section-kicker">A BETTER WAY TO MOVE PAPER</span>
            <h2>
              One platform. Built around <em>your</em> business.
            </h2>
            <p>
              Your carrier identity and document settings belong to your account, so every transport
              company works in its own voice.
            </p>
          </div>
          <div className="feature-cards">
            {features.map(([n, title, desc]) => (
              <article className="feature-tile" key={n}>
                <span className="feature-number">{n}</span>
                <div className="feature-icon">{n === "01" ? "✳" : n === "02" ? "▤" : "↓"}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="customize-band" id="customize">
          <div>
            <span className="section-kicker">MAKE IT YOURS</span>
            <h2>
              A familiar format, with <em>your</em> details.
            </h2>
            <p>
              Choose your carrier name, logo, colors, GST responsibility, field names and terms.
              Your settings stay with your account and appear on each bilty PDF.
            </p>
            <Link className="btn light" to="/signup">
              Create your company workspace <span>→</span>
            </Link>
          </div>
          <div className="customize-list">
            <span>
              <b>01</b> Carrier details and logo
            </span>
            <span>
              <b>02</b> Terms, copy label and risk note
            </span>
            <span>
              <b>03</b> Field labels and visibility
            </span>
            <span>
              <b>04</b> Freight, charges and signatures
            </span>
          </div>
        </section>
        <footer className="home-footer">
          <Link to="/">
            <Logo size={135} />
          </Link>
          <span>Clear records for the road ahead.</span>
          <div>
            <Link to="/signin">Sign in</Link>
            <Link to="/signup">Create workspace</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

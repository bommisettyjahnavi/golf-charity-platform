import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      className="pt-16 pb-8 px-6"
      style={{
        background: "oklch(16% 0.03 195)",
        borderTop: "1px solid oklch(34% 0.04 195)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full btn-gold flex items-center justify-center">
                <span className="text-xs font-bold">IL</span>
              </div>
              <span className="font-display font-bold text-sm tracking-widest uppercase">
                IMPACT LINK
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Play golf. Win prizes.
              <br />
              Change lives.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
              >
                <SiX size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
              >
                <SiInstagram size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
              >
                <SiFacebook size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-gold mb-4">
              Home
            </p>
            <ul className="space-y-2">
              {["About", "How It Works", "Pricing", "FAQ"].map((l) => (
                <li key={l}>
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-gold mb-4">
              Links
            </p>
            <ul className="space-y-2">
              {[
                "Charities",
                "Monthly Draw",
                "Score Tracker",
                "Leaderboard",
              ].map((l) => (
                <li key={l}>
                  <Link
                    to="/charities"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-gold mb-4">
              Social
            </p>
            <ul className="space-y-2">
              {[
                { label: "Twitter / X", href: "https://x.com" },
                { label: "Instagram", href: "https://instagram.com" },
                { label: "Facebook", href: "https://facebook.com" },
                { label: "LinkedIn", href: "https://linkedin.com" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-gold mb-4">
              Support
            </p>
            <ul className="space-y-2">
              {[
                { label: "Contact Us", href: "mailto:hello@impactlink.com" },
                { label: "Terms of Service", href: "/" },
                { label: "Privacy Policy", href: "/" },
                { label: "Cookie Policy", href: "/" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <button
                type="button"
                className="btn-gold rounded-full px-5 py-2 text-xs tracking-widest uppercase mt-6"
                data-ocid="footer.primary_button"
              >
                Donation
              </button>
            </Link>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground"
          style={{ borderTop: "1px solid oklch(34% 0.04 195)" }}
        >
          <p>
            &copy; {year}. Built with{" "}
            <Heart size={12} className="inline text-gold" /> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p>Impact Link &middot; Play Golf. Win Prizes. Change Lives.</p>
        </div>
      </div>
    </footer>
  );
}

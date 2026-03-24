import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navLinks = [
  { label: "HOME", to: "/" },
  { label: "CHARITIES", to: "/charities" },
  { label: "DRAW", to: "/dashboard" },
  { label: "TRACKER", to: "/dashboard" },
  { label: "HOW IT WORKS", to: "/" },
];

export default function Navbar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      qc.clear();
    } else {
      try {
        await login();
      } catch (err: any) {
        if (err.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "oklch(18% 0.03 195 / 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid oklch(34% 0.04 195 / 0.5)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full btn-gold flex items-center justify-center">
            <span className="text-xs font-bold">IL</span>
          </div>
          <span className="font-display font-bold text-sm tracking-widest uppercase text-foreground">
            IMPACT LINK
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Link to="/dashboard" className="hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs tracking-widest uppercase nav-link"
                data-ocid="nav.dashboard.link"
              >
                DASHBOARD
              </Button>
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/admin" className="hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs tracking-widest uppercase nav-link"
                data-ocid="nav.admin.link"
              >
                ADMIN
              </Button>
            </Link>
          )}
          <Button
            onClick={handleAuth}
            disabled={loginStatus === "logging-in"}
            className="btn-gold rounded-full px-5 py-2 text-xs tracking-widest uppercase hidden md:flex"
            data-ocid="nav.primary_button"
          >
            {loginStatus === "logging-in"
              ? "..."
              : isAuthenticated
                ? "LOGOUT"
                : "GET INVOLVED"}
          </Button>
          <button
            type="button"
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden px-6 pb-4"
            style={{ background: "oklch(18% 0.03 195)" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block py-3 nav-link border-b border-border"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="block py-3 nav-link border-b border-border"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.mobile.dashboard.link"
              >
                DASHBOARD
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/admin"
                className="block py-3 nav-link border-b border-border"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.mobile.admin.link"
              >
                ADMIN
              </Link>
            )}
            <Button
              onClick={() => {
                handleAuth();
                setMobileOpen(false);
              }}
              className="btn-gold rounded-full px-5 py-2 text-xs tracking-widest uppercase mt-4 w-full"
            >
              {isAuthenticated ? "LOGOUT" : "GET INVOLVED"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

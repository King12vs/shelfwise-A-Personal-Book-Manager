"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/books", label: "My shelf" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu automatically on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="relative border-b border-ink/10 bg-parchment/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight">
            Shelfwise
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-card px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? "bg-ink text-parchment" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-ink-soft sm:inline">Hi, {user.name.split(" ")[0]}</span>
          )}
          <button onClick={logout} className="btn-secondary hidden py-2 text-sm sm:inline-flex">
            Log out
          </button>

          {/* Mobile-only menu toggle — replaces the nav links below the sm breakpoint */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-card border border-ink/15 text-ink sm:hidden"
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          className="animate-fade-in border-t border-ink/10 bg-parchment px-6 py-3 sm:hidden"
        >
          {user && <p className="mb-2 px-1 text-sm text-ink-soft">Hi, {user.name.split(" ")[0]}</p>}
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-card px-3 py-2 text-sm font-medium ${
                    active ? "bg-ink text-parchment" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="mt-1 rounded-card px-3 py-2 text-left text-sm font-medium text-shelf-rust-dark hover:bg-shelf-rust/10"
            >
              Log out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

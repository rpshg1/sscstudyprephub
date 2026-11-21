"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  User as UserIcon,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/primitives";
import { TelegramIcon, InstagramIcon, YouTubeIcon } from "@/components/social-icons";
import type { SafeUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Navbar({ user: initialUser = null }: { user?: SafeUser | null }) {
  const [user, setUser] = useState<SafeUser | null>(initialUser);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      const hasHint = document.cookie.includes("ssph_logged_in=1");
      if (!hasHint) {
        await Promise.resolve();
        if (!cancelled) setUser(null);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (res.ok ? await res.json() : { user: null }) as {
          user?: SafeUser | null;
        };
        if (!cancelled) setUser(data.user ?? null);
      } catch {
        // Keep current session UI if network lookup fails transiently
      }
    };

    void syncSession();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" },
    { href: "/roadmaps", label: "Roadmaps" },
    { href: "/pyqs", label: "PYQs" },
    { href: "/syllabus", label: "Syllabus" },
    { href: "/typing", label: "Typing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B1220]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo />

        {/* Desktop Nav */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.split("?")[0]) &&
                  !item.href.includes("?");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-blue-50 text-[#2563EB] font-semibold"
                    : "text-[#172033] hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="flex items-center gap-1 pr-1.5 border-r border-[#E2E8F0] dark:border-slate-800">
            <a
              href="https://t.me/sscstudyprephub"
              target="_blank"
              rel="noopener noreferrer"
              title="Join Telegram (@sscstudyprephub)"
              aria-label="Telegram (@sscstudyprephub)"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
            >
              <TelegramIcon className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com/sscstudyprephub"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow Instagram (@sscstudyprephub)"
              aria-label="Instagram (@sscstudyprephub)"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href="https://youtube.com/@sscstudyprephub"
              target="_blank"
              rel="noopener noreferrer"
              title="Subscribe YouTube (@sscstudyprephub)"
              aria-label="YouTube (@sscstudyprephub)"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <YouTubeIcon className="h-4 w-4" />
            </a>
          </div>

          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#172033] hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4 text-[#2563EB]" />
                Dashboard
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#101B33] px-3 text-sm font-semibold text-white hover:bg-[#1B2B4F]"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-semibold text-[#172033] hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Create Free Account
              </Link>
            </>
          )}
        </div>

        {/* Mobile Theme Toggle & Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle className="h-10 w-10" />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#101B33] hover:bg-slate-50"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#E2E8F0] bg-white px-4 py-4 lg:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#172033] hover:bg-slate-100"
              >
                <BookOpen className="h-4 w-4 text-[#2563EB]" />
                {item.label}
              </Link>
            ))}

            <div className="my-2 border-t border-[#E2E8F0]" />

            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2.5 border border-[#E2E8F0]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#101B33]">
                    <UserIcon className="h-4 w-4 text-[#2563EB]" />
                    <span className="truncate max-w-[170px]">{user.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Free Account
                  </span>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-semibold text-[#172033]"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#2563EB]" />
                  Student Dashboard
                </Link>

                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-11 items-center gap-2 rounded-lg bg-[#101B33] px-3 py-2 text-sm font-semibold text-white"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                )}

                <Button
                  variant="outline"
                  className="min-h-11 w-full justify-start"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center justify-center rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#172033]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <div className="mt-4 border-t border-[#E2E8F0] pt-3 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Join Community (@sscstudyprephub)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href="https://t.me/sscstudyprephub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-sky-200 bg-sky-50/70 p-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300"
                >
                  <TelegramIcon className="h-4 w-4" />
                  <span>Telegram</span>
                </a>
                <a
                  href="https://instagram.com/sscstudyprephub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 p-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  <InstagramIcon className="h-4 w-4" />
                  <span>Instagram</span>
                </a>
                <a
                  href="https://youtube.com/@sscstudyprephub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50/70 p-2 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                >
                  <YouTubeIcon className="h-4 w-4" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

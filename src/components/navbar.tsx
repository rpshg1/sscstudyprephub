"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  User as UserIcon,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/primitives";
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
    { href: "/library", label: "Resource Library" },
    { href: "/library?type=ROADMAP", label: "Roadmaps" },
    { href: "/pricing", label: "Membership" },
    { href: "/about", label: "About" },
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
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
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
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs">
                <span className="font-semibold text-[#101B33]">
                  {user.membershipTier === "LIFETIME"
                    ? "Lifetime Premium"
                    : user.membershipTier === "TEN_BOOKS"
                      ? `10 Books • ${user.bookCredits} left`
                      : "Free Plan"}
                </span>
              </div>

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

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#101B33] hover:bg-slate-50 lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
                  <span className="text-xs font-semibold text-[#2563EB]">
                    {user.membershipTier === "LIFETIME"
                      ? "Lifetime"
                      : user.membershipTier === "TEN_BOOKS"
                        ? `${user.bookCredits} Credits`
                        : "Free"}
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

            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-[#2563EB]"
            >
              <CreditCard className="h-4 w-4" />
              Upgrade: ₹59 Pass / ₹300 Lifetime
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

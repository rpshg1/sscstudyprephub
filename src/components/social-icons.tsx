import React from "react";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function TelegramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function YouTubeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function SocialIcon({
  id,
  className = "h-5 w-5",
}: {
  id: "telegram" | "instagram" | "youtube" | string;
  className?: string;
}) {
  switch (id) {
    case "telegram":
      return <TelegramIcon className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "youtube":
      return <YouTubeIcon className={className} />;
    default:
      return null;
  }
}

export function SocialBadges({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const buttonPaddings = {
    sm: "px-2 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-xs sm:text-sm gap-2",
    lg: "px-4 py-2 text-sm gap-2.5 font-semibold",
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${item.name} (${item.handle})`}
          className={cn(
            "inline-flex items-center rounded-lg border font-medium transition-all shadow-2xs hover:scale-105 active:scale-95",
            buttonPaddings[size],
            item.id === "telegram" &&
              "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-400 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
            item.id === "instagram" &&
              "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-400 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
            item.id === "youtube" &&
              "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
          )}
        >
          <SocialIcon id={item.id} className={iconSizes[size]} />
          <span>{item.name}</span>
          <span className="opacity-75 font-normal text-[0.9em]">{item.handle}</span>
        </a>
      ))}
    </div>
  );
}

export function FooterSocialLinks() {
  return (
    <div className="flex items-center gap-2.5">
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${item.name} (${item.handle})`}
          title={`${item.name} - ${item.handle}`}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:scale-110",
            item.id === "telegram" &&
              "border-sky-400/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white hover:border-sky-500",
            item.id === "instagram" &&
              "border-rose-400/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500",
            item.id === "youtube" &&
              "border-red-400/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500"
          )}
        >
          <SocialIcon id={item.id} className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

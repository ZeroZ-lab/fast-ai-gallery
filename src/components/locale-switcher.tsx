"use client";

import { useTransition, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  type Locale,
} from "@/lib/i18n/config";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type LocaleSwitcherProps = {
  currentLocale: Locale;
};

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (locale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}`;
    setOpen(false);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300"
      >
        <Globe size={14} className="text-zinc-500 dark:text-zinc-400" />
        <span>{LOCALE_LABELS[currentLocale]}</span>
        <span className="text-[10px] text-zinc-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 min-w-[200px] rounded-2xl border border-zinc-200/60 bg-white/95 p-3 text-sm shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="flex flex-col gap-2">
            {LOCALES.map((locale) => (
              <button
                key={locale}
                type="button"
                disabled={isPending}
                onClick={() => handleSelect(locale)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition ${
                  locale === currentLocale
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span>{LOCALE_LABELS[locale]}</span>
                {locale === currentLocale && <span className="text-[10px]">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { Github, Twitter, Home } from "lucide-react";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
        <Link href="/" className="flex items-center gap-3 text-zinc-900 transition hover:opacity-80 dark:text-zinc-50">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-semibold text-white shadow-sm dark:bg-white dark:text-zinc-900">
            AI
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">AI Gallery</p>
            <p className="text-base font-semibold">Demo Library</p>
          </div>
        </Link>
        <nav className="flex items-center gap-3 text-xs uppercase tracking-[0.3em]">
          <Link href="/" className="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1.5 text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-200 dark:hover:text-white">
            <Home size={14} /> Home
          </Link>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1.5 text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-200 dark:hover:text-white"
          >
            <Github size={14} /> GitHub
          </a>
          <a
            href={siteConfig.x}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1.5 text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-200 dark:hover:text-white"
          >
            <Twitter size={14} /> X
          </a>
        </nav>
      </div>
    </header>
  );
}

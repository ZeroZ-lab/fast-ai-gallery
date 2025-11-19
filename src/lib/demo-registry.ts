import { promises as fs } from "node:fs";
import path from "node:path";

export type DemoInfo = {
  slug: string;
  title: string;
  description: string;
  href: string;
  coverImage: string;
};

const APP_DIR = path.join(process.cwd(), "src", "app");
const IGNORED_DIRECTORIES = new Set(["api"]);
const PAGE_FILE_CANDIDATES = ["page.tsx", "page.ts", "page.jsx", "page.js"];

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function slugToTitle(slug: string) {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type DemoConfig = Partial<DemoInfo> & {
  image?: string;
  coverImage?: string;
};

async function getDemoConfig(slug: string) {
  const configPath = path.join(APP_DIR, slug, "demo.json");
  try {
    const raw = await fs.readFile(configPath, "utf8");
    return JSON.parse(raw) as DemoConfig;
  } catch {
    return null;
  }
}

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function getDefaultCoverImage(slug: string) {
  const seed = encodeURIComponent(slug);
  return `https://picsum.photos/seed/${seed}/640/360`;
}

function looksLikeRemote(pathOrUrl?: string) {
  if (!pathOrUrl) return false;
  return /^https?:\/\//i.test(pathOrUrl);
}

async function resolveCoverImage(slug: string, config: DemoConfig | null) {
  const candidate = config?.image ?? config?.coverImage;
  if (!candidate) {
    return getDefaultCoverImage(slug);
  }

  if (looksLikeRemote(candidate) || candidate.startsWith("/")) {
    return candidate;
  }

  const localPath = path.join(APP_DIR, slug, candidate);
  try {
    const buffer = await fs.readFile(localPath);
    const extension = path.extname(localPath).toLowerCase();
    const mime = MIME_TYPES[extension] ?? "image/png";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return getDefaultCoverImage(slug);
  }
}

async function hasPageFile(slug: string) {
  for (const filename of PAGE_FILE_CANDIDATES) {
    if (await fileExists(path.join(APP_DIR, slug, filename))) {
      return true;
    }
  }
  return false;
}

export async function getDemoList(): Promise<DemoInfo[]> {
  const entries = await fs.readdir(APP_DIR, { withFileTypes: true });
  const demos: DemoInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;
    if (entry.name.startsWith("(") || entry.name.startsWith("_")) continue;

    const slug = entry.name;
    if (!(await hasPageFile(slug))) continue;

    const config = await getDemoConfig(slug);
    const coverImage = await resolveCoverImage(slug, config);
    demos.push({
      slug,
      title: config?.title ?? slugToTitle(slug),
      description: config?.description ?? `访问 /${slug} 查看 Demo`,
      href: `/${slug}`,
      coverImage,
    });
  }

  return demos.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
}

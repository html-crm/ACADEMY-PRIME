import type { MetadataRoute } from "next";

const SITE_URL = "https://www.academy-prime.site";

const ROUTES = [
  "",
  "about",
  "library",
  "courses",
  "videos",
  "rewards",
  "partners",
  "learn",
  "learn-and-earn",
  "learn-btc",
  "prime-product-guides",
  "security",
  "shorts",
  "expert",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of ["en", "ar"] as const) {
    for (const route of ROUTES) {
      entries.push({
        url: `${SITE_URL}/${locale}${route ? `/${route}` : ""}`,
        lastModified: now,
        changeFrequency: route === "" || route === "about" ? "weekly" : "monthly",
        priority: route === "" ? 1 : route === "about" ? 0.9 : 0.7,
        alternates: {
          languages: {
            en: `${SITE_URL}/en${route ? `/${route}` : ""}`,
            ar: `${SITE_URL}/ar${route ? `/${route}` : ""}`,
          },
        },
      });
    }
  }

  return entries;
}
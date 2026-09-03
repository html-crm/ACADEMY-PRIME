import type { MetadataRoute } from "next";

const BASE_URL = "https://www.academy-prime.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/en`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/ar`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/en/library`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/ar/library`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/en/courses`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/ar/courses`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/en/rewards`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/ar/rewards`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];
}

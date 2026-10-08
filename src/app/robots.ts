import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/login", "/register", "/watch"],
      },
    ],
    sitemap: "https://www.academy-prime.site/sitemap.xml",
  };
}
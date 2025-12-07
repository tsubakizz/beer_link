import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beer-link.example.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/mypage/", "/submit/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

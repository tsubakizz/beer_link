import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { beers, breweries, beerStyles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

// 動的サイトマップ（DBからコンテンツを取得）
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beer-link.example.com";

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/beers`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/breweries`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/styles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/guides/beginners`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/guides/tasting`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // 動的ページを取得
  const [beerList, breweryList, styleList] = await Promise.all([
    db
      .select({ id: beers.id, updatedAt: beers.updatedAt })
      .from(beers)
      .where(eq(beers.status, "approved")),
    db
      .select({ id: breweries.id, updatedAt: breweries.updatedAt })
      .from(breweries)
      .where(eq(breweries.status, "approved")),
    db
      .select({ id: beerStyles.id, slug: beerStyles.slug, updatedAt: beerStyles.updatedAt })
      .from(beerStyles)
      .where(eq(beerStyles.status, "approved")),
  ]);

  // ビール詳細ページ
  const beerPages: MetadataRoute.Sitemap = beerList.map((beer) => ({
    url: `${siteUrl}/beers/${beer.id}`,
    lastModified: beer.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // ブルワリー詳細ページ
  const breweryPages: MetadataRoute.Sitemap = breweryList.map((brewery) => ({
    url: `${siteUrl}/breweries/${brewery.id}`,
    lastModified: brewery.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // ビアスタイル詳細ページ
  const stylePages: MetadataRoute.Sitemap = styleList.map((style) => ({
    url: `${siteUrl}/styles/${style.slug}`,
    lastModified: style.updatedAt || new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // ビアスタイル別ビール一覧ページ
  const styleBeerPages: MetadataRoute.Sitemap = styleList.map((style) => ({
    url: `${siteUrl}/beers/style-${style.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // ブルワリー別ビール一覧ページ
  const breweryBeerPages: MetadataRoute.Sitemap = breweryList.map((brewery) => ({
    url: `${siteUrl}/beers/brewery-${brewery.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...beerPages,
    ...breweryPages,
    ...stylePages,
    ...styleBeerPages,
    ...breweryBeerPages,
  ];
}

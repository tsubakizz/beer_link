import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { beers, breweries, beerStyles, prefectures } from "@/lib/db/schema";
import { isNotNull, eq } from "drizzle-orm";
import {
  BITTERNESS_RANGES,
  ABV_RANGES,
  type BitternessLevel,
  type AbvLevel,
} from "@/lib/constants/beer-filters";

// 苦味レベル
const BITTERNESS_LEVELS: BitternessLevel[] = ["light", "medium", "strong"];
// アルコール度数レベル
const ABV_LEVELS: AbvLevel[] = ["light", "medium", "strong"];

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
  const [beerList, breweryList, styleList, prefectureList, beersWithIbu, beersWithAbv] = await Promise.all([
    db
      .select({ id: beers.id, updatedAt: beers.updatedAt })
      .from(beers),
    db
      .select({ id: breweries.id, updatedAt: breweries.updatedAt, prefectureId: breweries.prefectureId })
      .from(breweries),
    db
      .select({ id: beerStyles.id, slug: beerStyles.slug, updatedAt: beerStyles.updatedAt })
      .from(beerStyles),
    db
      .selectDistinct({ id: prefectures.id })
      .from(prefectures)
      .innerJoin(breweries, eq(breweries.prefectureId, prefectures.id))
      .innerJoin(beers, eq(beers.breweryId, breweries.id)),
    db
      .select({ ibu: beers.ibu })
      .from(beers)
      .where(isNotNull(beers.ibu)),
    db
      .select({ abv: beers.abv })
      .from(beers)
      .where(isNotNull(beers.abv)),
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
    url: `${siteUrl}/beers/style/${style.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // ブルワリー別ビール一覧ページ
  const breweryBeerPages: MetadataRoute.Sitemap = breweryList.map((brewery) => ({
    url: `${siteUrl}/beers/brewery/${brewery.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // 都道府県別ビール一覧ページ
  const prefectureBeerPages: MetadataRoute.Sitemap = prefectureList.map((prefecture) => ({
    url: `${siteUrl}/beers/prefecture/${prefecture.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // 苦味レベル別ビール一覧ページ（該当ビールがあるレベルのみ）
  const bitternessPages: MetadataRoute.Sitemap = BITTERNESS_LEVELS.filter((level) => {
    const range = BITTERNESS_RANGES[level];
    return beersWithIbu.some((beer) => {
      const ibu = beer.ibu!;
      return ibu >= range.min && (range.max === null || ibu <= range.max);
    });
  }).map((level) => ({
    url: `${siteUrl}/beers/bitterness/${level}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // アルコール度数レベル別ビール一覧ページ（該当ビールがあるレベルのみ）
  const abvPages: MetadataRoute.Sitemap = ABV_LEVELS.filter((level) => {
    const range = ABV_RANGES[level];
    return beersWithAbv.some((beer) => {
      const abv = parseFloat(beer.abv!);
      return abv >= range.min && (range.max === null || abv <= range.max);
    });
  }).map((level) => ({
    url: `${siteUrl}/beers/abv/${level}`,
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
    ...prefectureBeerPages,
    ...bitternessPages,
    ...abvPages,
  ];
}

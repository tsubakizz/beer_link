"use server";

import { db } from "@/lib/db";
import { breweries, prefectures } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getBreweryById(breweryId: number) {
  try {
    const [brewery] = await db
      .select({
        id: breweries.id,
        name: breweries.name,
        shortDescription: breweries.shortDescription,
        description: breweries.description,
        prefectureId: breweries.prefectureId,
        address: breweries.address,
        websiteUrl: breweries.websiteUrl,
        imageUrl: breweries.imageUrl,
        status: breweries.status,
      })
      .from(breweries)
      .where(eq(breweries.id, breweryId));

    if (!brewery) {
      return { success: false, error: "ブルワリーが見つかりません" };
    }

    return { success: true, brewery };
  } catch (error) {
    console.error("Failed to get brewery:", error);
    return { success: false, error: "ブルワリーの取得に失敗しました" };
  }
}

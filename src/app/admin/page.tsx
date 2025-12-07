import { db } from "@/lib/db";
import { beers, beerStyles, breweries, reviews } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  // ビール統計
  const [pendingBeers] = await db
    .select({ count: count() })
    .from(beers)
    .where(eq(beers.status, "pending"));

  const [confirmedBeers] = await db
    .select({ count: count() })
    .from(beers)
    .where(eq(beers.status, "approved"));

  // スタイル統計
  const [pendingStyles] = await db
    .select({ count: count() })
    .from(beerStyles)
    .where(eq(beerStyles.status, "pending"));

  const [confirmedStyles] = await db
    .select({ count: count() })
    .from(beerStyles)
    .where(eq(beerStyles.status, "approved"));

  // ブルワリー統計
  const [pendingBreweries] = await db
    .select({ count: count() })
    .from(breweries)
    .where(eq(breweries.status, "pending"));

  const [confirmedBreweries] = await db
    .select({ count: count() })
    .from(breweries)
    .where(eq(breweries.status, "approved"));

  // レビュー統計
  const [totalReviews] = await db
    .select({ count: count() })
    .from(reviews);

  const pendingTotal = pendingBeers.count + pendingStyles.count + pendingBreweries.count;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>

      {/* 未確認アラート */}
      {pendingTotal > 0 && (
        <div className="alert alert-warning mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{pendingTotal}件の未確認データがあります</span>
        </div>
      )}

      {/* 確認済み統計 */}
      <h2 className="text-xl font-bold mb-4">確認済みデータ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="stat-title">ビール</div>
          <div className="stat-value text-primary">{confirmedBeers.count}</div>
          <div className="stat-desc">確認済み</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="stat-title">ビアスタイル</div>
          <div className="stat-value text-secondary">{confirmedStyles.count}</div>
          <div className="stat-desc">確認済み</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="stat-title">ブルワリー</div>
          <div className="stat-value text-accent">{confirmedBreweries.count}</div>
          <div className="stat-desc">確認済み</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="stat-title">レビュー</div>
          <div className="stat-value text-info">{totalReviews.count}</div>
          <div className="stat-desc">総投稿数</div>
        </div>
      </div>

      {/* 未確認データ */}
      <h2 className="text-xl font-bold mb-4">未確認データ</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">ビール</h2>
            <p className="text-4xl font-bold text-warning">{pendingBeers.count}</p>
            <p className="text-base-content/60">件の未確認</p>
            <div className="card-actions justify-end mt-4">
              <Link href="/admin/beers?status=pending" className="btn btn-primary btn-sm">
                確認する
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">スタイル</h2>
            <p className="text-4xl font-bold text-warning">{pendingStyles.count}</p>
            <p className="text-base-content/60">件の未確認</p>
            <div className="card-actions justify-end mt-4">
              <Link href="/admin/styles?status=pending" className="btn btn-primary btn-sm">
                確認する
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">ブルワリー</h2>
            <p className="text-4xl font-bold text-warning">{pendingBreweries.count}</p>
            <p className="text-base-content/60">件の未確認</p>
            <div className="card-actions justify-end mt-4">
              <Link href="/admin/breweries?status=pending" className="btn btn-primary btn-sm">
                確認する
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

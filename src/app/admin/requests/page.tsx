import { db } from "@/lib/db";
import { beers, beerStyles, breweries, beerStyleRequests, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { RequestTabs } from "./RequestTabs";
import { BeerRequestCard } from "./BeerRequestCard";
import { StyleRequestCard } from "./StyleRequestCard";

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function RequestsPage({ searchParams }: Props) {
  const params = await searchParams;
  const activeTab = params.type || "beer";

  // ビール申請一覧を取得
  const beerRequests = await db
    .select({
      id: beers.id,
      name: beers.name,
      description: beers.description,
      abv: beers.abv,
      ibu: beers.ibu,
      status: beers.status,
      createdAt: beers.createdAt,
      brewery: {
        id: breweries.id,
        name: breweries.name,
      },
      style: {
        id: beerStyles.id,
        name: beerStyles.name,
      },
      submitter: {
        id: users.id,
        displayName: users.displayName,
        email: users.email,
      },
    })
    .from(beers)
    .leftJoin(breweries, eq(beers.breweryId, breweries.id))
    .leftJoin(beerStyles, eq(beers.styleId, beerStyles.id))
    .leftJoin(users, eq(beers.submittedBy, users.id))
    .where(eq(beers.status, "pending"))
    .orderBy(desc(beers.createdAt));

  // 全スタイル一覧を取得（ビール編集用）
  const allStyles = await db
    .select({
      id: beerStyles.id,
      name: beerStyles.name,
    })
    .from(beerStyles)
    .where(eq(beerStyles.status, "approved"))
    .orderBy(beerStyles.name);

  // スタイル申請一覧を取得
  const styleRequests = await db
    .select({
      id: beerStyleRequests.id,
      name: beerStyleRequests.name,
      description: beerStyleRequests.description,
      status: beerStyleRequests.status,
      createdAt: beerStyleRequests.createdAt,
      submitter: {
        id: users.id,
        displayName: users.displayName,
        email: users.email,
      },
    })
    .from(beerStyleRequests)
    .leftJoin(users, eq(beerStyleRequests.submittedBy, users.id))
    .where(eq(beerStyleRequests.status, "pending"))
    .orderBy(desc(beerStyleRequests.createdAt));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">申請管理</h1>

      <RequestTabs
        activeTab={activeTab}
        beerCount={beerRequests.length}
        styleCount={styleRequests.length}
      />

      <div className="mt-6">
        {activeTab === "beer" ? (
          beerRequests.length > 0 ? (
            <div className="space-y-4">
              {beerRequests.map((request) => (
                <BeerRequestCard key={request.id} request={request} styles={allStyles} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-base-100 rounded-lg">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-base-content/60">
                承認待ちのビール申請はありません
              </p>
            </div>
          )
        ) : (
          styleRequests.length > 0 ? (
            <div className="space-y-4">
              {styleRequests.map((request) => (
                <StyleRequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-base-100 rounded-lg">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-base-content/60">
                承認待ちのスタイル申請はありません
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

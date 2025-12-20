import Link from "next/link";
import Image from "next/image";

interface BreweryCardProps {
  brewery: {
    id: number;
    name: string;
    shortDescription?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    address?: string | null;
    prefecture?: {
      id: number;
      name: string;
    } | null;
    beerCount?: number;
  };
}

export function BreweryCard({ brewery }: BreweryCardProps) {
  return (
    <Link href={`/breweries/${brewery.id}`}>
      <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
        <figure className="px-4 pt-4">
          {brewery.imageUrl ? (
            <Image
              src={brewery.imageUrl}
              alt={brewery.name}
              width={200}
              height={200}
              className="rounded-xl h-48 w-full object-cover bg-base-200"
            />
          ) : (
            <div className="rounded-xl h-48 w-full bg-base-200 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-base-content/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                />
              </svg>
            </div>
          )}
        </figure>
        <div className="card-body">
          <h3 className="card-title text-lg">{brewery.name}</h3>

          {brewery.prefecture && (
            <p className="text-sm text-base-content/60">
              {brewery.prefecture.name}
            </p>
          )}

          {(brewery.shortDescription || brewery.description) && (
            <p className="text-sm text-base-content/80 line-clamp-2">
              {brewery.shortDescription || brewery.description}
            </p>
          )}

          {brewery.beerCount !== undefined && (
            <div className="mt-2">
              <span className="badge badge-secondary badge-sm">
                {brewery.beerCount} ビール
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

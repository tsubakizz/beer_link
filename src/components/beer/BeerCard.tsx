import Link from "next/link";
import Image from "next/image";

interface BeerCardProps {
  beer: {
    id: number;
    name: string;
    shortDescription?: string | null;
    description?: string | null;
    abv?: string | null;
    ibu?: number | null;
    imageUrl?: string | null;
    brewery?: {
      id: number;
      name: string;
    } | null;
    style?: {
      id: number;
      name: string;
    } | null;
  };
}

export function BeerCard({ beer }: BeerCardProps) {
  return (
    <Link href={`/beers/${beer.id}`}>
      <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
        <figure className="px-4 pt-4">
          {beer.imageUrl ? (
            <Image
              src={beer.imageUrl}
              alt={beer.name}
              width={200}
              height={200}
              className="rounded-xl h-48 w-full object-contain bg-base-200"
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
          )}
        </figure>
        <div className="card-body">
          <h3 className="card-title text-lg">{beer.name}</h3>

          {beer.brewery && (
            <p className="text-sm text-base-content/60">{beer.brewery.name}</p>
          )}

          {(beer.shortDescription || beer.description) && (
            <p className="text-sm text-base-content/80 line-clamp-2">
              {beer.shortDescription || beer.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {beer.style && (
              <span className="badge badge-primary badge-sm">
                {beer.style.name}
              </span>
            )}
            {beer.abv && (
              <span className="badge badge-outline badge-sm">
                ABV: {beer.abv}%
              </span>
            )}
            {beer.ibu && (
              <span className="badge badge-outline badge-sm">
                IBU: {beer.ibu}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

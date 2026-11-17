import Link from "next/link";

import { metadataPageMapper } from "./mapper";

const keys = Object.keys(
  metadataPageMapper,
) as (keyof typeof metadataPageMapper)[];

export default function Page() {
  return (
    <div>
      Dashboard Metadata Page
      {keys.map((key) => {
        const item = metadataPageMapper[key];

        if (!item) {
          return null;
        }

        const { href, label, description } = item;

        return (
          <Link key={key} href={href}>
            <div className="my-4 rounded border p-4">
              <h2 className="mb-2 text-lg font-semibold">{label}</h2>
              {description}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

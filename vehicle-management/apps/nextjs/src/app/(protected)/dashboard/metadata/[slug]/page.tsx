import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@fleetio/ui/button";

import { metadataPageMapper } from "../mapper";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: keyof typeof metadataPageMapper }>;
}) {
  const { slug } = await params;

  const item = metadataPageMapper[slug];

  if (!item) {
    return <div>Page {slug} - Not found</div>;
  }

  const { component } = item;

  return (
    <div className="flex flex-col space-y-4">
      <Link href={"/dashboard/metadata"}>
        <Button className="cursor-pointer" variant="outline" size={"sm"}>
          <ChevronLeft /> Back to Metadata
        </Button>
      </Link>

      {component}
    </div>
  );
}

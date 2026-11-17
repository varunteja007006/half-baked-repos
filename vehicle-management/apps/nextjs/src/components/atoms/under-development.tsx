import Link from "next/link";
import { Construction } from "lucide-react";

import { Button } from "@fleetio/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@fleetio/ui/empty";

export function UnderDevelopment({
  title = `Under Development`,
  description = `
          The feature you are looking for is under development
  `,
  redirectUrl = "/",
  redirectLabel = "Home",
}: {
  title?: string;
  description?: string;
  redirectUrl?: string;
  redirectLabel?: string;
}) {
  return (
    <Empty className="min-h-screen">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Construction className="size-20" />
        </EmptyMedia>
        <EmptyTitle className="my-5">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href={redirectUrl}>
          <Button>{redirectLabel}</Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}

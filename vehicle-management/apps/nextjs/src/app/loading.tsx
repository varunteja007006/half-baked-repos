import { Loader2 } from "lucide-react";

import { BRAND_ICON_URL, BRAND_NAME } from "@fleetio/custom-config";
import { Card, CardContent } from "@fleetio/ui/card";

export default function Loading() {
  return (
    <div className="from-background via-background to-primary/5 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="bg-background/80 w-full max-w-md border-0 shadow-lg backdrop-blur-sm">
        <CardContent className="space-y-6 p-8 text-center">
          {/* Brand Header */}
          <div className="text-primary flex items-center justify-center">
            {BRAND_ICON_URL}
            <span className="ml-2 text-lg font-semibold">{BRAND_NAME}</span>
          </div>

          {/* Loading Spinner */}
          <div className="relative">
            <div className="mx-auto h-16 w-16">
              <Loader2 className="text-primary h-16 w-16 animate-spin" />
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold">
              Starting Engine...
            </h2>
            <p className="text-muted-foreground text-sm">
              Preparing your vehicle management dashboard
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
            <div className="bg-primary h-1 w-full animate-pulse rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

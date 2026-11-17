import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@fleetio/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fleetio/ui/card";

import { getSession } from "~/auth/server";
import { OtpForm } from "./otp-form";

export async function AuthShowcase() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex h-screen min-w-sm flex-col items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Sign In / Sign Up</CardTitle>
            <CardDescription>
              Sign in or sign up using your phone number with OTP
              authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OtpForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-w-sm flex-col items-center justify-center gap-4">
      <p>
        You are logged in as <strong>{session.user.name}</strong>
      </p>
      <Link href="/dashboard">
        <Button variant="default">Redirect to Dashboard</Button>
      </Link>
    </div>
  );
}

import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@fleetio/ui/button";

import { auth, getSession } from "~/auth/server";

export default async function LogoutBtnServer() {
  const session = await getSession();

  if (session?.user.id) {
    return (
      <form>
        <Button
          size="lg"
          formAction={async () => {
            "use server";
            await auth.api.signOut({
              headers: await headers(),
            });
            redirect("/");
          }}
        >
          Sign out
        </Button>
      </form>
    );
  }

  return null;
}

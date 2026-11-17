import Home from "~/components/template/home";
import { HydrateClient } from "~/trpc/server";

export default function HomePage() {
  return (
    <HydrateClient>
      <Home />
    </HydrateClient>
  );
}

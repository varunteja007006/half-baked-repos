import { useQuery } from "@tanstack/react-query";

import { trpc } from "~/utils/api";

export const useTRPCAuthSession = () => {
  return useQuery(trpc.auth.getSession.queryOptions());
};

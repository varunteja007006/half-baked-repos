"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export default function Page() {
  const trpc = useTRPC();

  const userList = useQuery(
    trpc.user.listUsers.queryOptions({
      currentPage: 1,
      itemsPerPage: 10,
    }),
  );

  return <code>{JSON.stringify(userList.data, null, 4)}</code>;
}

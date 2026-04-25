"use client";

import { useQuery } from "@tanstack/react-query";
import { contentApi } from "@/lib/content-api";
import { gamesApi } from "@/lib/games-api";
import { newsApi } from "@/lib/news-api";
import { queryKeys } from "@/lib/query-keys";

/** Default public-data cache: fresh 5m, kept 30m, no refetch on focus/remount when cached. */
const publicDataQueryOptions = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false as const,
  refetchOnMount: false as const,
  retry: 1,
};

export function usePublicSiteContent() {
  return useQuery({
    queryKey: queryKeys.publicContent,
    queryFn: () => contentApi.getPublicCached(),
    ...publicDataQueryOptions,
  });
}

export function useGamesList() {
  return useQuery({
    queryKey: queryKeys.gamesList,
    queryFn: () => gamesApi.list(),
    ...publicDataQueryOptions,
  });
}

export function useGamesTop() {
  return useQuery({
    queryKey: queryKeys.gamesTop,
    queryFn: () => gamesApi.listTop(),
    ...publicDataQueryOptions,
  });
}

export function useNewsCurrent() {
  return useQuery({
    queryKey: queryKeys.newsCurrent,
    queryFn: () => newsApi.current(),
    ...publicDataQueryOptions,
  });
}

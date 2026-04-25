"use client";

import type { QueryClient } from "@tanstack/react-query";
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

/**
 * Warm TanStack cache for likely-heavy routes so navbar clicks feel instant.
 * Safe to call repeatedly; deduped by the query client.
 */
export function prefetchPublicRouteData(queryClient: QueryClient, href: string) {
  const path = href.split(/[?#]/)[0] || href;
  const opts = publicDataQueryOptions;

  void queryClient.prefetchQuery({
    queryKey: queryKeys.publicContent,
    queryFn: () => contentApi.getPublicCached(),
    ...opts,
  });

  if (path === "/dashboard" || path === "/games") {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.gamesList,
      queryFn: () => gamesApi.list(),
      ...opts,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.gamesTop,
      queryFn: () => gamesApi.listTop(),
      ...opts,
    });
  }

  if (path === "/dashboard") {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.newsCurrent,
      queryFn: () => newsApi.current(),
      ...opts,
    });
  }
}

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

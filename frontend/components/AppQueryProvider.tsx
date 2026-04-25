"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { queryKeys } from "@/lib/query-keys";
import {
  registerQueryCacheBridge,
  unregisterQueryCacheBridge,
} from "@/lib/query-invalidation-bridge";

function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
      },
    },
  });
}

export function AppQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createAppQueryClient);

  useEffect(() => {
    registerQueryCacheBridge({
      invalidatePublicContent: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.publicContent });
      },
      invalidateGamesPublic: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.gamesList });
        void queryClient.invalidateQueries({ queryKey: queryKeys.gamesTop });
      },
      invalidateNewsCurrent: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.newsCurrent });
      },
    });
    return () => unregisterQueryCacheBridge();
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

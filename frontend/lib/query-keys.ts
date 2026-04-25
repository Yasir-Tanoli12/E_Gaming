/** Central TanStack Query keys — use for invalidation and prefetch. */
export const queryKeys = {
  publicContent: ["content", "public"] as const,
  gamesList: ["games", "list"] as const,
  gamesTop: ["games", "top"] as const,
  newsCurrent: ["news", "current"] as const,
};

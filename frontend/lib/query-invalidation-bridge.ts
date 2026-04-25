/**
 * Lets non-React modules (e.g. contentApi cache clears) invalidate TanStack Query
 * after the client provider has mounted.
 */
export type QueryCacheBridge = {
  invalidatePublicContent: () => void;
  invalidateGamesPublic: () => void;
  invalidateNewsCurrent: () => void;
};

let bridge: QueryCacheBridge | null = null;

export function registerQueryCacheBridge(next: QueryCacheBridge) {
  bridge = next;
}

export function unregisterQueryCacheBridge() {
  bridge = null;
}

export function invalidatePublicContentQueries() {
  bridge?.invalidatePublicContent();
}

export function invalidateGamesPublicQueries() {
  bridge?.invalidateGamesPublic();
}

export function invalidateNewsCurrentQueries() {
  bridge?.invalidateNewsCurrent();
}

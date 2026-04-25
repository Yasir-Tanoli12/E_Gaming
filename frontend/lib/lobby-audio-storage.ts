/** Same key as dashboard age gate — entering the site counts as engagement for lobby media sound. */
export const LOBBY_SOUND_ACK_KEY = "dashboard_age_warning_acknowledged";

export function readLobbySoundAllowed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LOBBY_SOUND_ACK_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeLobbySoundAllowed(): void {
  try {
    localStorage.setItem(LOBBY_SOUND_ACK_KEY, "1");
  } catch {
    /* private mode */
  }
}

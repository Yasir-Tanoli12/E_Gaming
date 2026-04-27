/**
 * Per **browser tab session** only (sessionStorage). Clears when the tab/window is
 * closed, so the 18+ gate and lobby sound engagement apply again on the next visit.
 * Tab switches within the same session do not clear this.
 */
export const LOBBY_SOUND_ACK_KEY = "dashboard_age_warning_acknowledged";

export function readLobbySoundAllowed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(LOBBY_SOUND_ACK_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeLobbySoundAllowed(): void {
  try {
    sessionStorage.setItem(LOBBY_SOUND_ACK_KEY, "1");
  } catch {
    /* private mode */
  }
}

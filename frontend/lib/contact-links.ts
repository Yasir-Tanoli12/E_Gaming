/** Normalize WhatsApp number or URL for linking. */
export function whatsappHref(whatsapp: string): string {
  const w = whatsapp.trim();
  if (!w) return "";
  if (w.startsWith("http")) return w;
  return `https://wa.me/${w.replace(/\D/g, "")}`;
}

/** Normalize admin-entered support email (plain address or mailto:). */
export function normalizeSupportEmail(raw: string): string {
  let value = raw.trim();
  if (!value) return "";
  if (value.toLowerCase().startsWith("mailto:")) {
    value = value.slice("mailto:".length);
  }
  // Admins sometimes paste values with spaces/newlines.
  return value.replace(/\s+/g, "");
}

/** Build mailto href from a plain address or existing mailto: string. */
export function mailtoHref(email: string): string {
  const e = normalizeSupportEmail(email);
  if (!e) return "";
  return `mailto:${e}`;
}

/** Telegram username, @handle, t.me/…, or full URL. */
export function telegramHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("http")) return t;
  const user = t.replace(/^@/, "").replace(/^t\.me\//i, "");
  if (!user) return "";
  return `https://t.me/${user}`;
}

/** Instagram profile URL or @handle. */
export function instagramHref(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (s.startsWith("http")) return s;
  return `https://instagram.com/${s.replace(/^@/, "")}`;
}

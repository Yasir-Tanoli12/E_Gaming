/** Normalize WhatsApp number or URL for linking. */
export function whatsappHref(whatsapp: string): string {
  const w = whatsapp.trim();
  if (!w) return "";
  if (w.startsWith("http")) return w;
  return `https://wa.me/${w.replace(/\D/g, "")}`;
}

/** Build mailto href from a plain address or existing mailto: string. */
export function mailtoHref(email: string): string {
  const e = email.trim();
  if (!e) return "";
  if (e.toLowerCase().startsWith("mailto:")) return e;
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

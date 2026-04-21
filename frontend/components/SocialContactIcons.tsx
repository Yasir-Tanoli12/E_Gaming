"use client";

import type { SiteContacts } from "@/lib/content-api";
import {
  instagramHref,
  mailtoHref,
  telegramHref,
  whatsappHref,
} from "@/lib/contact-links";

const sizeClass = {
  sm: "inline-flex h-8 w-8 items-center justify-center rounded-full border transition hover:-translate-y-0.5",
  md: "inline-flex h-9 w-9 items-center justify-center rounded-full border transition hover:-translate-y-0.5",
  lg: "inline-flex h-11 w-11 items-center justify-center rounded-xl border transition hover:-translate-y-0.5",
} as const;

const iconClass = {
  sm: "h-4 w-4",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

type Size = keyof typeof sizeClass;

export function SocialContactIcons({
  contacts,
  size = "md",
  gapClass = "gap-2",
  className = "",
  /** When false, omit the mail icon (e.g. footer already shows the address as text). */
  includeEmailIcon = true,
}: {
  contacts: SiteContacts | null | undefined;
  size?: Size;
  gapClass?: string;
  className?: string;
  includeEmailIcon?: boolean;
}) {
  if (!contacts) return null;

  const wa = contacts.whatsapp ? whatsappHref(contacts.whatsapp) : "";
  const ig = contacts.instagram ? instagramHref(contacts.instagram) : "";
  const tg = contacts.telegram?.trim()
    ? telegramHref(contacts.telegram)
    : "";
  const mail = contacts.email ? mailtoHref(contacts.email) : "";

  const base = sizeClass[size];
  const ic = iconClass[size];

  return (
    <div className={`flex flex-wrap items-center ${gapClass} ${className}`}>
      {contacts.facebook ? (
        <a
          href={contacts.facebook}
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
          title="Facebook"
          className={`${base} border-[#EDC537]/40 bg-[#990808]/20 text-[#fef3c7] shadow-[0_0_16px_rgba(237,197,55,0.3)] hover:bg-[#990808]/30`}
        >
          <svg viewBox="0 0 24 24" className={`${ic} fill-current`} aria-hidden="true">
            <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.88 3.79-3.88 1.1 0 2.24.2 2.24.2v2.47h-1.27c-1.26 0-1.65.78-1.65 1.58V12h2.8l-.45 2.89h-2.35v6.99A10 10 0 0 0 22 12z" />
          </svg>
        </a>
      ) : null}
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          title="WhatsApp"
          className={`${base} border-[#EDC537]/40 bg-[#EDC537]/20 text-[#1a0a0a] shadow-[0_0_16px_rgba(237,197,55,0.3)] hover:bg-[#EDC537]/30`}
        >
          <svg viewBox="0 0 24 24" className={`${ic} fill-current`} aria-hidden="true">
            <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.54 0 .2 5.34.2 11.86c0 2.09.55 4.14 1.59 5.95L0 24l6.37-1.67a11.86 11.86 0 0 0 5.7 1.46h.01c6.53 0 11.87-5.33 11.87-11.86 0-3.17-1.23-6.15-3.43-8.45zM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.78.99 1.01-3.68-.23-.38a9.86 9.86 0 0 1-1.51-5.27c0-5.45 4.44-9.88 9.91-9.88a9.8 9.8 0 0 1 7.02 2.91 9.79 9.79 0 0 1 2.9 6.98c0 5.45-4.44 9.89-9.91 9.89zm5.43-7.42c-.3-.15-1.77-.87-2.05-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.53.08-.8.38-.27.3-1.03 1-1.03 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.01 4.43.7.3 1.25.48 1.68.62.7.22 1.33.2 1.83.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" />
          </svg>
        </a>
      ) : null}
      {ig ? (
        <a
          href={ig}
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          title="Instagram"
          className={`${base} border-[#EDC537]/40 bg-gradient-to-br from-[#833AB4]/25 to-[#F77737]/20 text-[#fef3c7] shadow-[0_0_16px_rgba(237,197,55,0.25)] hover:from-[#833AB4]/35 hover:to-[#F77737]/30`}
        >
          <svg viewBox="0 0 24 24" className={`${ic} fill-current`} aria-hidden="true">
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zm5.25-3.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z" />
          </svg>
        </a>
      ) : null}
      {tg ? (
        <a
          href={tg}
          target="_blank"
          rel="noreferrer"
          aria-label="Telegram"
          title="Telegram"
          className={`${base} border-sky-400/40 bg-sky-500/20 text-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.25)] hover:bg-sky-500/30`}
        >
          <svg viewBox="0 0 24 24" className={`${ic} fill-current`} aria-hidden="true">
            <path d="M21.95 3.05a1.08 1.08 0 0 0-1.12-.1L2.4 10.2c-.72.3-.71 1.36.01 1.64l4.42 1.64 1.7 5.5c.18.58.95.8 1.45.38l2.45-2 4.73 3.48c.6.44 1.45.1 1.6-.68L21.95 3.05zM17.6 6.35 9.9 13.4l-.15 3.35 1.1-2.05 6.75-8.35z" />
          </svg>
        </a>
      ) : null}
      {includeEmailIcon && mail ? (
        <a
          href={mail}
          aria-label="Email support"
          title="Email"
          className={`${base} border-[#EDC537]/40 bg-zinc-700/40 text-[#fef3c7] shadow-[0_0_16px_rgba(237,197,55,0.2)] hover:bg-zinc-600/50`}
        >
          <svg viewBox="0 0 24 24" className={`${ic} fill-current`} aria-hidden="true">
            <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}

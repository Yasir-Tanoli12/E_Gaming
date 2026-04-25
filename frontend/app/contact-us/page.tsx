"use client";

import { useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import type { SiteContacts } from "@/lib/content-api";
import { contentApi } from "@/lib/content-api";
import { usePublicSiteContent } from "@/lib/hooks/use-site-queries";
import { mailtoHref } from "@/lib/contact-links";
import { BrandTextureBackdrop } from "@/components/legal/BrandTextureBackdrop";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SocialContactIcons } from "@/components/SocialContactIcons";
import { Button } from "@/components/ui/Button";

const panelBase =
  "relative z-[1] flex min-h-0 flex-1 flex-col rounded-2xl border-[3px] border-[#161015] bg-[#EEEDEE]/88 p-6 shadow-[inset_0_0_0_1px_rgba(22,16,21,0.08)] backdrop-blur-md sm:p-8 lg:min-h-[min(560px,calc(100svh-11rem))]";

export default function ContactUsPage() {
  const contentQuery = usePublicSiteContent();
  const contacts: SiteContacts | null = contentQuery.data?.contacts ?? null;
  const loading = contentQuery.isPending;
  const contactsError =
    contentQuery.error instanceof Error
      ? contentQuery.error.message
      : contentQuery.error
        ? String(contentQuery.error)
        : "";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const canSubmit = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    return (
      form.name.trim().length >= 2 &&
      emailOk &&
      form.message.trim().length >= 5
    );
  }, [form]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      const parts: string[] = [];
      if (form.name.trim().length < 2) parts.push("name (at least 2 characters)");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        parts.push("a valid email (e.g. name@domain.com)");
      }
      if (form.message.trim().length < 5) {
        parts.push("message (at least 5 characters)");
      }
      setError(`Please fix: ${parts.join(", ")}.`);
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await contentApi.submitContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
      });
      setSuccess("Message sent successfully. We will get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to send message";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border-2 border-[#161015]/36 bg-[#E9DFE5] px-4 py-3 text-sm text-[#161015] outline-none transition placeholder:text-[#161015]/45 focus:border-[#EB523F] focus:ring-2 focus:ring-[#AAE847]/35";

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip text-[#161015]">
      <BrandTextureBackdrop className="fixed inset-0 z-0" />

      <PublicNavbar />

      <main className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col px-[max(1rem,env(safe-area-inset-left))] pb-12 pe-[max(1rem,env(safe-area-inset-right))] pt-6 lg:pt-8">
        <header className="sw-legal-animate-left mb-6 text-center lg:mb-8 lg:text-left">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-[#EB523F]">Support</p>
          <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight md:text-5xl">
            <span className="text-[#161015]">Contact </span>
            <span className="bg-gradient-to-r from-[#EB523F] via-[#EA3699] to-[#AAE847] bg-clip-text text-transparent">
              Us
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#161015]/80 md:text-base lg:mx-0">
            Need support, credentials, or partnership details? Reach out and our team will respond.
          </p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
          <aside
            className={`sw-legal-animate-left ${panelBase} shadow-[8px_8px_0_#EB523F]`}
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#EA3699]">Contact details</p>
            <h2 className="mt-2 text-2xl font-black text-[#161015] md:text-3xl">
              Direct <span className="text-[#EB523F]">channels</span>
            </h2>
            <p className="mt-2 text-sm font-medium text-[#161015]/75">
              Email and socials configured in admin appear here.
            </p>

            <div className="mt-6 flex min-h-0 flex-1 flex-col rounded-xl border-l-4 border-[#AAE847] bg-[#E9DFE5]/58 py-4 pl-5 pr-2 shadow-[inset_0_1px_0_rgba(22,16,21,0.06)]">
              {contactsError ? (
                <p className="text-sm font-medium text-[#EB523F]">{contactsError}</p>
              ) : null}
              {loading ? (
                <p className="text-sm text-[#161015]/55">Loading contacts…</p>
              ) : (
                <>
                  {contacts?.email?.trim() ? (
                    <a
                      href={mailtoHref(contacts.email)}
                      className="text-base font-semibold text-[#161015] underline underline-offset-2 hover:text-[#EB523F]"
                    >
                      {contacts.email}
                    </a>
                  ) : (
                    <p className="text-sm text-[#161015]/55">No support email configured yet.</p>
                  )}
                  <div className="mt-5">
                    <SocialContactIcons contacts={contacts} size="lg" gapClass="gap-3" includeEmailIcon />
                  </div>
                </>
              )}
            </div>
          </aside>

          <div
            className="relative hidden w-1 shrink-0 self-stretch rounded-full bg-gradient-to-b from-[#EB523F] via-[#AAE847] to-[#EA3699] shadow-[0_0_28px_rgba(235,82,63,0.48),0_0_48px_rgba(22,16,21,0.12)] lg:block"
            aria-hidden
          />

          <form
            noValidate
            onSubmit={handleSubmit}
            className={`sw-legal-animate-right ${panelBase} shadow-[8px_8px_0_#EA3699]`}
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#EB523F]">Send a message</p>
            <h2 className="mt-2 text-2xl font-black text-[#161015] md:text-3xl">
              We are here to <span className="text-[#EA3699]">help</span>
            </h2>
            <p className="mt-2 text-sm font-medium text-[#161015]/75">
              Your message is stored in our support inbox.
            </p>

            <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                className={inputClass}
                required
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Your email"
                className={inputClass}
                required
              />
              <input
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Subject (optional)"
                className={inputClass}
              />
              <textarea
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Type your message..."
                rows={6}
                className={inputClass}
                required
              />
            </div>

            {error ? (
              <p className="mt-4 rounded-xl border-[3px] border-[#EB523F] bg-[#EB523F]/10 px-4 py-3 text-sm font-medium text-[#161015]">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="mt-4 rounded-xl border-[3px] border-[#AAE847] bg-[#AAE847]/15 px-4 py-3 text-sm font-semibold text-[#161015]">
                {success}
              </p>
            ) : null}

            <div className="mt-6">
              <Button type="submit" loading={submitting}>
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

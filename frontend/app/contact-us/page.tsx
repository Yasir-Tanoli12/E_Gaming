"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import { contentApi, type SiteContacts } from "@/lib/content-api";
import { mailtoHref } from "@/lib/contact-links";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SocialContactIcons } from "@/components/SocialContactIcons";
import { Button } from "@/components/ui/Button";
import { LegalSplitVisual } from "@/components/legal/LegalSplitVisual";

export default function ContactUsPage() {
  const [contacts, setContacts] = useState<SiteContacts | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await contentApi.getPublic();
        setContacts(data.contacts ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contacts");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

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
    "w-full rounded-xl border-2 border-[#161015]/25 bg-[#E9DFE5] px-4 py-3 text-sm text-[#161015] outline-none transition placeholder:text-[#161015]/45 focus:border-[#EB523F] focus:ring-2 focus:ring-[#AAE847]/35";

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#E9DFE5] text-[#161015]">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-20 top-24 h-80 w-80 rounded-full bg-[#EB523F]/22 blur-[100px]" />
        <div className="absolute right-0 top-28 h-96 w-96 rounded-full bg-[#EA3699]/20 blur-[110px]" />
        <div className="absolute bottom-12 left-1/3 h-72 w-72 rounded-full bg-[#AAE847]/28 blur-[90px]" />
      </div>

      <PublicNavbar />
      <main className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col lg:flex-row">
        {/* Left — matches About / Privacy content column */}
        <div className="sw-legal-animate-left order-1 flex w-full flex-col border-b-[3px] border-[#EB523F]/50 bg-[#EEEDEE]/95 px-[max(1.25rem,env(safe-area-inset-left))] py-10 pe-[max(1.25rem,env(safe-area-inset-right))] shadow-[inset_0_0_0_2px_rgba(234,54,153,0.15)] backdrop-blur-sm lg:order-none lg:w-[40%] lg:max-w-[40%] lg:border-b-0 lg:border-r-[3px] lg:border-[#EA3699]/45 lg:py-14 lg:ps-10 lg:pe-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-[#EB523F]">Support</p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-5xl">
            <span className="text-[#161015]">Contact </span>
            <span className="bg-gradient-to-r from-[#EB523F] via-[#EA3699] to-[#AAE847] bg-clip-text text-transparent">
              Us
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-[#161015]/80 md:text-base">
            Need support, credentials, or partnership details? Reach out and our team will respond.
          </p>

          <div className="mt-8 max-h-none space-y-8 overflow-visible lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:pr-1">
            <div className="rounded-r-xl border-l-4 border-[#AAE847] bg-[#E9DFE5]/60 py-3 pl-5 shadow-[4px_0_0_rgba(235,82,63,0.15)]">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#EA3699]">Direct channels</p>
              {loading ? (
                <p className="mt-2 text-sm text-[#161015]/55">Loading contacts…</p>
              ) : (
                <div className="mt-3">
                  {contacts?.email?.trim() ? (
                    <a
                      href={mailtoHref(contacts.email)}
                      className="block text-sm font-semibold text-[#161015] underline underline-offset-2 hover:text-[#EB523F]"
                    >
                      {contacts.email}
                    </a>
                  ) : null}
                  <div className="mt-3">
                    <SocialContactIcons contacts={contacts} size="lg" gapClass="gap-3" includeEmailIcon />
                  </div>
                </div>
              )}
            </div>

            <form
              noValidate
              onSubmit={handleSubmit}
              className="rounded-r-xl border-l-4 border-[#EB523F] bg-[#E9DFE5]/60 p-5 shadow-[4px_0_0_rgba(170,232,71,0.25)] sm:p-6"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#EB523F]">Send a message</p>
              <h2 className="mt-2 text-xl font-black text-[#161015] md:text-2xl">
                We are here to <span className="text-[#EA3699]">help</span>
              </h2>
              <p className="mt-1 text-sm font-medium text-[#161015]/75">
                Your message is stored in our support inbox.
              </p>

              <div className="mt-5 space-y-4">
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
        </div>

        <div className="sw-legal-animate-right order-2 min-h-[min(40vh,320px)] w-full flex-1 lg:order-none lg:w-[60%] lg:min-h-[calc(100svh-5.25rem)]">
          <LegalSplitVisual variant="contact" />
        </div>
      </main>
    </div>
  );
}

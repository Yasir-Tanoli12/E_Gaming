"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import { contentApi, type SiteContacts } from "@/lib/content-api";
import { mailtoHref } from "@/lib/contact-links";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SocialContactIcons } from "@/components/SocialContactIcons";
import { Button } from "@/components/ui/Button";

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

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-[#E9DFE5] text-[#161015]">
      <PublicNavbar />
      <section className="relative min-h-[calc(100vh-82px)] w-full min-w-0 max-w-full overflow-x-clip py-12 ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))]">
        <div className="pointer-events-none absolute inset-0 min-w-0">
          <div className="absolute left-8 top-8 h-56 w-56 rounded-full bg-[#EB523F]/22 blur-3xl" />
          <div className="absolute right-12 top-20 h-64 w-64 rounded-full bg-[#EA3699]/20 blur-3xl" />
          <div className="absolute bottom-6 left-1/3 h-52 w-52 rounded-full bg-[#AAE847]/18 blur-3xl" />
        </div>

        <div className="relative mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="min-w-0 max-w-full rounded-3xl border-[3px] border-[#161015] bg-[#EEEDEE] p-5 shadow-[8px_10px_0_#161015] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#EA3699]">Contact</p>
            <h1 className="sw-text-wobble mt-2 text-4xl font-black text-[#161015] md:text-5xl">Contact Us</h1>
            <p className="mt-4 text-sm text-zinc-600">
              Need support, credentials, or partnership details? Reach out and our team will respond.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border-2 border-[#EB523F]/40 bg-[#E9DFE5] p-4">
              <p className="text-sm font-bold text-[#EB523F]">Direct channels</p>
              {loading ? (
                <p className="text-sm text-zinc-500">Loading contacts…</p>
              ) : (
                <>
                  {contacts?.email?.trim() ? (
                    <a
                      href={mailtoHref(contacts.email)}
                      className="block text-sm font-semibold text-[#161015] underline underline-offset-2 hover:text-[#EB523F]"
                    >
                      {contacts.email}
                    </a>
                  ) : null}
                  <SocialContactIcons contacts={contacts} size="lg" gapClass="gap-3" includeEmailIcon />
                </>
              )}
            </div>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit}
            className="min-w-0 max-w-full rounded-3xl border-[3px] border-[#161015] bg-[#EEEDEE] p-5 shadow-[8px_10px_0_#161015,0_0_0_2px_#AAE847] sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#EB523F]">Send Us a Message</p>
            <h2 className="sw-text-wobble mt-2 text-2xl font-black text-[#161015]">We are here to help</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Fill in the form and your message will be stored in our support inbox.
            </p>

            <div className="mt-5 space-y-4">
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                className="w-full rounded-xl border-2 border-[#161015]/25 bg-[#E9DFE5] px-4 py-3 text-sm outline-none focus:border-[#EB523F]"
                required
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Your email"
                className="w-full rounded-xl border-2 border-[#161015]/25 bg-[#E9DFE5] px-4 py-3 text-sm outline-none focus:border-[#EB523F]"
                required
              />
              <input
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Subject (optional)"
                className="w-full rounded-xl border-2 border-[#161015]/25 bg-[#E9DFE5] px-4 py-3 text-sm outline-none focus:border-[#EB523F]"
              />
              <textarea
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Type your message..."
                rows={6}
                className="w-full rounded-xl border-2 border-[#161015]/25 bg-[#E9DFE5] px-4 py-3 text-sm outline-none focus:border-[#EB523F]"
                required
              />
            </div>

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            {success ? <p className="mt-3 text-sm text-emerald-700">{success}</p> : null}

            <div className="mt-5">
              <Button type="submit" loading={submitting}>
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

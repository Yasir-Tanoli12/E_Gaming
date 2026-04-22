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
    <div className="min-h-screen bg-[#FFFBF5] text-[#1a1a1a]">
      <PublicNavbar />
      <section className="relative min-h-[calc(100vh-82px)] overflow-hidden px-4 py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-8 top-8 h-56 w-56 rounded-full bg-[#990808]/20 blur-3xl" />
          <div className="absolute right-12 top-20 h-64 w-64 rounded-full bg-[#EDC537]/25 blur-3xl" />
          <div className="absolute bottom-6 left-1/3 h-52 w-52 rounded-full bg-[#E85D04]/15 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#EDC537]/30 bg-white/90 p-7 shadow-[0_16px_40px_rgba(153,8,8,0.08)]">
            <p className="text-xs uppercase tracking-[0.22em] text-[#9a7000]">Contact</p>
            <h1 className="mt-2 text-4xl font-black text-[#7a0b0b] md:text-5xl">Contact Us</h1>
            <p className="mt-4 text-sm text-zinc-600">
              Need support, credentials, or partnership details? Reach out and our team will respond.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-[#EDC537]/25 bg-[#fff8df]/60 p-4">
              <p className="text-sm font-semibold text-[#7a0b0b]">Direct channels</p>
              {loading ? (
                <p className="text-sm text-zinc-500">Loading contacts…</p>
              ) : (
                <>
                  {contacts?.email?.trim() ? (
                    <a
                      href={mailtoHref(contacts.email)}
                      className="block text-sm text-[#7a0b0b] underline underline-offset-2 hover:text-[#990808]"
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
            className="rounded-3xl border border-[#EDC537]/30 bg-white p-7 shadow-[0_16px_40px_rgba(153,8,8,0.08)]"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-[#9a7000]">Send Us a Message</p>
            <h2 className="mt-2 text-2xl font-black text-[#7a0b0b]">We are here to help</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Fill in the form and your message will be stored in our support inbox.
            </p>

            <div className="mt-5 space-y-4">
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                className="w-full rounded-xl border border-[#EDC537]/30 bg-white px-4 py-3 text-sm outline-none focus:border-[#EDC537]"
                required
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Your email"
                className="w-full rounded-xl border border-[#EDC537]/30 bg-white px-4 py-3 text-sm outline-none focus:border-[#EDC537]"
                required
              />
              <input
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Subject (optional)"
                className="w-full rounded-xl border border-[#EDC537]/30 bg-white px-4 py-3 text-sm outline-none focus:border-[#EDC537]"
              />
              <textarea
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Type your message..."
                rows={6}
                className="w-full rounded-xl border border-[#EDC537]/30 bg-white px-4 py-3 text-sm outline-none focus:border-[#EDC537]"
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

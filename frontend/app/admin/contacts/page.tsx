"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { contentApi, type SiteContacts } from "@/lib/content-api";
import { mailtoHref, normalizeSupportEmail } from "@/lib/contact-links";

export default function AdminContactsPage() {
  const [loading, setLoading] = useState(true);
  const [savingContacts, setSavingContacts] = useState(false);
  const [error, setError] = useState("");

  const [contacts, setContacts] = useState<SiteContacts>({
    facebook: "",
    whatsapp: "",
    instagram: "",
    telegram: "",
    email: "",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await contentApi.getAdmin();
      setContacts(data.contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveContacts() {
    setSavingContacts(true);
    setError("");
    try {
      const normalizedEmail = normalizeSupportEmail(contacts.email ?? "");
      if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        setError("Enter a valid support email, e.g. support@example.com");
        return;
      }
      await contentApi.updateContacts({
        facebook: contacts.facebook,
        whatsapp: contacts.whatsapp,
        instagram: contacts.instagram,
        telegram: contacts.telegram,
        email: normalizedEmail,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contacts");
    } finally {
      setSavingContacts(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EDC537] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Contacts</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage contact links (shown in the site header, footer, and credential help). Logo and
          lobby video are configured on the{" "}
          <Link href="/admin/dashboard" className="text-cyan-400 underline hover:text-cyan-300">
            main dashboard
          </Link>
          .
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white">Contact links</h2>
        <div className="rounded-lg border border-cyan-400/25 bg-cyan-500/5 p-4">
          <Input
            label="Support Email (admin only)"
            value={contacts.email}
            onChange={(e) => setContacts((p) => ({ ...p, email: e.target.value }))}
            placeholder="support@example.com"
          />
          <p className="mt-2 text-xs text-zinc-400">
            Enter only the email address. Users can click the address or mail icon to open their
            email app and send a message to this address.
          </p>
          {normalizeSupportEmail(contacts.email ?? "") ? (
            <a
              href={mailtoHref(contacts.email)}
              className="mt-2 inline-block text-xs text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
            >
              Preview user action: {normalizeSupportEmail(contacts.email)}
            </a>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Facebook URL"
            value={contacts.facebook}
            onChange={(e) =>
              setContacts((p) => ({ ...p, facebook: e.target.value }))
            }
            placeholder="https://facebook.com/..."
          />
          <Input
            label="WhatsApp (number or link)"
            value={contacts.whatsapp}
            onChange={(e) =>
              setContacts((p) => ({ ...p, whatsapp: e.target.value }))
            }
            placeholder="+92..."
          />
          <Input
            label="Instagram URL or @username"
            value={contacts.instagram}
            onChange={(e) =>
              setContacts((p) => ({ ...p, instagram: e.target.value }))
            }
            placeholder="https://instagram.com/... or @handle"
          />
          <Input
            label="Telegram URL or @username"
            value={contacts.telegram}
            onChange={(e) =>
              setContacts((p) => ({ ...p, telegram: e.target.value }))
            }
            placeholder="https://t.me/... or @channel"
          />
        </div>
        <div>
          <Button onClick={saveContacts} loading={savingContacts}>
            Save Contacts
          </Button>
        </div>
      </section>
    </div>
  );
}

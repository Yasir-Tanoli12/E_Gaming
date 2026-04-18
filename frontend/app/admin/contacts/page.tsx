"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { contentApi, type SiteContacts } from "@/lib/content-api";

export default function AdminContactsPage() {
  const [loading, setLoading] = useState(true);
  const [savingContacts, setSavingContacts] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingLobbyVideo, setUploadingLobbyVideo] = useState(false);
  const [error, setError] = useState("");

  const [contacts, setContacts] = useState<SiteContacts>({
    facebook: "",
    whatsapp: "",
    instagram: "",
    email: "",
    logoUrl: "",
    lobbyVideoUrl: "",
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
      await contentApi.updateContacts({
        facebook: contacts.facebook,
        whatsapp: contacts.whatsapp,
        instagram: contacts.instagram,
        email: contacts.email,
        logoUrl: contacts.logoUrl || undefined,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contacts");
    } finally {
      setSavingContacts(false);
    }
  }

  async function uploadLogo(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed for logo.");
      return;
    }
    setUploadingLogo(true);
    setError("");
    try {
      const res = await contentApi.uploadLogo(file);
      setContacts((p) => ({ ...p, logoUrl: res.logoUrl ?? "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function uploadLobbyVideo(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Only video files (MP4, WebM, OGG) are allowed for lobby.");
      return;
    }
    setUploadingLobbyVideo(true);
    setError("");
    try {
      const res = await contentApi.uploadLobbyVideo(file);
      setContacts((p) => ({ ...p, lobbyVideoUrl: res.lobbyVideoUrl ?? "" }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload lobby video");
    } finally {
      setUploadingLobbyVideo(false);
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
          Manage logo, lobby video, and social links.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white">Contacts</h2>
        <div>
          <label className="mb-1.5 block text-sm font-medium !text-zinc-200">
            Brand logo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => uploadLogo(e.target.files?.[0] ?? null)}
            className="w-full max-w-md cursor-pointer rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-200"
          />
          {uploadingLogo && (
            <p className="mt-1 text-xs text-cyan-300">Uploading logo...</p>
          )}
          {contacts.logoUrl && (
            <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-3 py-2">
              <img
                src={contacts.logoUrl}
                alt="Site logo"
                className="h-10 w-10 rounded-lg object-cover ring-1 ring-cyan-300/40"
              />
              <p className="text-xs text-cyan-100/80">Logo is active site-wide</p>
            </div>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium !text-zinc-200">
            Lobby video (hero section on dashboard)
          </label>
          <input
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            onChange={(e) => uploadLobbyVideo(e.target.files?.[0] ?? null)}
            className="w-full max-w-md cursor-pointer rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-200"
          />
          {uploadingLobbyVideo && (
            <p className="mt-1 text-xs text-cyan-300">Uploading lobby video...</p>
          )}
          {contacts.lobbyVideoUrl && (
            <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-2">
              <video
                src={contacts.lobbyVideoUrl}
                className="h-16 w-28 rounded-lg object-cover ring-1 ring-fuchsia-300/40"
                muted
                playsInline
                preload="metadata"
              />
              <p className="text-xs text-cyan-100/80">Lobby video is active on dashboard hero</p>
            </div>
          )}
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
            label="Instagram URL"
            value={contacts.instagram}
            onChange={(e) =>
              setContacts((p) => ({ ...p, instagram: e.target.value }))
            }
            placeholder="https://instagram.com/..."
          />
          <Input
            label="Support Email"
            value={contacts.email}
            onChange={(e) => setContacts((p) => ({ ...p, email: e.target.value }))}
            placeholder="support@example.com"
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

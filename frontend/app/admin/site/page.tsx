"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { contentApi } from "@/lib/content-api";

export default function AdminSitePage() {
  const [loading, setLoading] = useState(true);
  const [savingAboutUs, setSavingAboutUs] = useState(false);
  const [savingAgeWarning, setSavingAgeWarning] = useState(false);
  const [error, setError] = useState("");

  const [aboutUs, setAboutUs] = useState("");
  const [ageWarning, setAgeWarning] = useState({
    title: "18+ Content Notice",
    message:
      "This gaming website may include mature themes. Enter only if you are 18 years old or above.",
    enterButtonLabel: "I am 18+ Enter",
    exitButtonLabel: "Exit",
    exitUrl: "https://www.google.com",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await contentApi.getAdmin();
      setAboutUs(data.aboutUs || "");
      if (data.ageWarning) {
        setAgeWarning(data.ageWarning);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveAboutUs() {
    setSavingAboutUs(true);
    setError("");
    try {
      await contentApi.updateAboutUs(aboutUs);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update about us");
    } finally {
      setSavingAboutUs(false);
    }
  }

  async function saveAgeWarning() {
    setSavingAgeWarning(true);
    setError("");
    try {
      await contentApi.updateAgeWarning(ageWarning);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update age warning");
    } finally {
      setSavingAgeWarning(false);
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
        <h1 className="text-2xl font-black sm:text-3xl">Site</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage About Us page and 18+ popup content.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="auth-card space-y-4 rounded-2xl border border-zinc-700/40 bg-zinc-900/60 p-6">
        <h2 className="text-xl font-bold">About Us Page</h2>
        <p className="text-sm text-zinc-400">
          This content is shown on the public About Us page.
        </p>
        <textarea
          value={aboutUs}
          onChange={(e) => setAboutUs(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100"
        />
        <div>
          <Button onClick={saveAboutUs} loading={savingAboutUs}>
            Save About Us
          </Button>
        </div>
      </section>

      <section className="auth-card space-y-4 rounded-2xl border border-zinc-700/40 bg-zinc-900/60 p-6">
        <h2 className="text-xl font-bold">18+ Popup Content</h2>
        <p className="text-sm text-zinc-400">
          Customize the initial age warning popup shown on landing page.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Popup Title"
            value={ageWarning.title}
            onChange={(e) =>
              setAgeWarning((p) => ({ ...p, title: e.target.value }))
            }
          />
          <Input
            label="Exit URL"
            value={ageWarning.exitUrl}
            onChange={(e) =>
              setAgeWarning((p) => ({ ...p, exitUrl: e.target.value }))
            }
            placeholder="https://example.com"
          />
          <Input
            label="Enter Button Label"
            value={ageWarning.enterButtonLabel}
            onChange={(e) =>
              setAgeWarning((p) => ({ ...p, enterButtonLabel: e.target.value }))
            }
          />
          <Input
            label="Exit Button Label"
            value={ageWarning.exitButtonLabel}
            onChange={(e) =>
              setAgeWarning((p) => ({ ...p, exitButtonLabel: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Popup Message
          </label>
          <textarea
            value={ageWarning.message}
            onChange={(e) =>
              setAgeWarning((p) => ({ ...p, message: e.target.value }))
            }
            rows={4}
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100"
          />
        </div>
        <div>
          <Button onClick={saveAgeWarning} loading={savingAgeWarning}>
            Save 18+ Popup
          </Button>
        </div>
      </section>
    </div>
  );
}

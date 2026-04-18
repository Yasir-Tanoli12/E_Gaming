"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { contentApi } from "@/lib/content-api";

export default function AdminGuidelinesPage() {
  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [uploadingPrivacyPdf, setUploadingPrivacyPdf] = useState(false);
  const [uploadingSocialPdf, setUploadingSocialPdf] = useState(false);
  const [error, setError] = useState("");

  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [privacyPolicyPdfUrl, setPrivacyPolicyPdfUrl] = useState<string | null>(null);
  const [socialResponsibilityPdfUrl, setSocialResponsibilityPdfUrl] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await contentApi.getAdmin();
      setPrivacyPolicy(data.privacyPolicy || "");
      setPrivacyPolicyPdfUrl(data.privacyPolicyPdfUrl ?? null);
      setSocialResponsibilityPdfUrl(data.socialResponsibilityPdfUrl ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function savePrivacyPolicy() {
    setSavingPolicy(true);
    setError("");
    try {
      await contentApi.updatePrivacyPolicy(privacyPolicy);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update guidelines");
    } finally {
      setSavingPolicy(false);
    }
  }

  async function uploadLegalPdf(
    key: "privacy-policy" | "social-responsibility",
    file: File | null
  ) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (key === "privacy-policy") setUploadingPrivacyPdf(true);
    if (key === "social-responsibility") setUploadingSocialPdf(true);
    setError("");
    try {
      await contentApi.uploadPolicyDocument(key, file);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload PDF");
    } finally {
      if (key === "privacy-policy") setUploadingPrivacyPdf(false);
      if (key === "social-responsibility") setUploadingSocialPdf(false);
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
        <h1 className="text-2xl font-black sm:text-3xl">Guidelines</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage privacy policy and legal PDF documents.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white">Guidelines Content</h2>
        <p className="text-sm text-zinc-400">
          This content is shown on the public guidelines page.
        </p>
        <textarea
          value={privacyPolicy}
          onChange={(e) => setPrivacyPolicy(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
        />
        <div>
          <Button onClick={savePrivacyPolicy} loading={savingPolicy}>
            Save Guidelines
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white">Legal PDFs (Stored in DB)</h2>
        <p className="text-sm text-zinc-400">
          Upload PDFs for footer links. Files are stored directly in database.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium !text-zinc-200">
              Guidelines PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                uploadLegalPdf("privacy-policy", e.target.files?.[0] ?? null)
              }
              className="w-full max-w-md cursor-pointer rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-200"
            />
            {uploadingPrivacyPdf && (
              <p className="mt-1 text-xs text-cyan-300">Uploading...</p>
            )}
            {privacyPolicyPdfUrl && (
              <p className="mt-2 text-xs text-cyan-300">
                <a href={privacyPolicyPdfUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  View current PDF
                </a>
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium !text-zinc-200">
              Social Responsibility Rules PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                uploadLegalPdf("social-responsibility", e.target.files?.[0] ?? null)
              }
              className="w-full max-w-md cursor-pointer rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-200"
            />
            {uploadingSocialPdf && (
              <p className="mt-1 text-xs text-cyan-300">Uploading...</p>
            )}
            {socialResponsibilityPdfUrl && (
              <p className="mt-2 text-xs text-cyan-300">
                <a href={socialResponsibilityPdfUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  View current PDF
                </a>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

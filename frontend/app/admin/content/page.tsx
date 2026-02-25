"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { gamesApi } from "@/lib/games-api";
import {
  contentApi,
  type BlogItem,
  type ReviewItem,
  type SiteContacts,
} from "@/lib/content-api";

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [savingContacts, setSavingContacts] = useState(false);
  const [savingBlog, setSavingBlog] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [savingAboutUs, setSavingAboutUs] = useState(false);
  const [savingAgeWarning, setSavingAgeWarning] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [uploadingBlogImage, setUploadingBlogImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPrivacyPdf, setUploadingPrivacyPdf] = useState(false);
  const [uploadingSocialPdf, setUploadingSocialPdf] = useState(false);
  const [error, setError] = useState("");

  const [contacts, setContacts] = useState<SiteContacts>({
    facebook: "",
    whatsapp: "",
    instagram: "",
    email: "",
    logoUrl: "",
  });
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [aboutUs, setAboutUs] = useState("");
  const [ageWarning, setAgeWarning] = useState({
    title: "18+ Content Notice",
    message:
      "This gaming website may include mature themes. Enter only if you are 18 years old or above.",
    enterButtonLabel: "I am 18+ Enter",
    exitButtonLabel: "Exit",
    exitUrl: "https://www.google.com",
  });
  const [privacyPolicy, setPrivacyPolicy] = useState("");

  const [blogForm, setBlogForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    imageUrl: "",
  });
  const [reviewForm, setReviewForm] = useState({
    reviewer: "",
    message: "",
    rating: 5,
    isFeatured: true,
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await contentApi.getAdmin();
      setContacts(data.contacts);
      setBlogs(data.blogs);
      setReviews(data.reviews);
      setAboutUs(data.aboutUs || "");
      if (data.ageWarning) {
        setAgeWarning(data.ageWarning);
      }
      setPrivacyPolicy(data.privacyPolicy || "");
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
      await contentApi.updateContacts(contacts);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contacts");
    } finally {
      setSavingContacts(false);
    }
  }

  async function addBlog() {
    if (!blogForm.title.trim()) return;
    setSavingBlog(true);
    setError("");
    try {
      await contentApi.createBlog({
        title: blogForm.title.trim(),
        excerpt: blogForm.excerpt.trim() || undefined,
        content: blogForm.content.trim() || undefined,
        imageUrl: blogForm.imageUrl.trim() || undefined,
      });
      setBlogForm({ title: "", excerpt: "", content: "", imageUrl: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create blog");
    } finally {
      setSavingBlog(false);
    }
  }

  async function deleteBlog(id: string) {
    if (!confirm("Delete this blog post?")) return;
    try {
      await contentApi.removeBlog(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete blog");
    }
  }

  async function uploadBlogImage(file: File | null) {
    if (!file) return;
    setUploadingBlogImage(true);
    setError("");
    try {
      const { url } = await gamesApi.uploadMedia(file);
      setBlogForm((p) => ({ ...p, imageUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingBlogImage(false);
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

  async function addReview() {
    if (!reviewForm.reviewer.trim() || !reviewForm.message.trim()) return;
    setSavingReview(true);
    setError("");
    try {
      await contentApi.createReview({
        reviewer: reviewForm.reviewer.trim(),
        message: reviewForm.message.trim(),
        rating: reviewForm.rating,
        isFeatured: reviewForm.isFeatured,
      });
      setReviewForm({ reviewer: "", message: "", rating: 5, isFeatured: true });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create review");
    } finally {
      setSavingReview(false);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      await contentApi.removeReview(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
    }
  }

  async function savePrivacyPolicy() {
    setSavingPolicy(true);
    setError("");
    try {
      await contentApi.updatePrivacyPolicy(privacyPolicy);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update privacy policy");
    } finally {
      setSavingPolicy(false);
    }
  }

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload PDF");
    } finally {
      if (key === "privacy-policy") setUploadingPrivacyPdf(false);
      if (key === "social-responsibility") setUploadingSocialPdf(false);
    }
  }

  if (loading) {
    return <div className="text-zinc-400">Loading content...</div>;
  }

  return (
    <div className="space-y-8 text-white">
      <div>
        <h1 className="text-3xl font-black">Site Content Manager</h1>
        <p className="mt-1 text-zinc-400">
          Manage contacts, blogs, reviews, about us, and privacy policy.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="auth-card space-y-4 rounded-2xl border border-zinc-700/40 bg-zinc-900/60 p-6">
        <h2 className="text-xl font-bold">Contacts</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Brand logo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => uploadLogo(e.target.files?.[0] ?? null)}
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
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

      <section className="auth-card space-y-4 rounded-2xl border border-zinc-700/40 bg-zinc-900/60 p-6">
        <h2 className="text-xl font-bold">Blogs</h2>
        <div className="grid gap-4">
          <Input
            label="Blog title"
            value={blogForm.title}
            onChange={(e) => setBlogForm((p) => ({ ...p, title: e.target.value }))}
          />
          <Input
            label="Short excerpt"
            value={blogForm.excerpt}
            onChange={(e) =>
              setBlogForm((p) => ({ ...p, excerpt: e.target.value }))
            }
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Upload blog image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadBlogImage(e.target.files?.[0] ?? null)}
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
            />
            {uploadingBlogImage && (
              <p className="mt-1 text-xs text-cyan-300">Uploading...</p>
            )}
            <p className="mt-1 text-xs text-zinc-500">
              Manual image URLs are disabled. Use local upload only.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Full blog content
            </label>
            <textarea
              value={blogForm.content}
              onChange={(e) =>
                setBlogForm((p) => ({ ...p, content: e.target.value }))
              }
              rows={5}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100"
            />
          </div>
          <div>
            <Button onClick={addBlog} loading={savingBlog} disabled={!blogForm.title.trim()}>
              Add Blog
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {blogs.length === 0 ? (
            <p className="text-sm text-zinc-500">No blogs yet.</p>
          ) : (
            blogs.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  {item.excerpt && (
                    <p className="text-sm text-zinc-400">{item.excerpt}</p>
                  )}
                </div>
                <Button variant="secondary" onClick={() => deleteBlog(item.id)}>
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="auth-card space-y-4 rounded-2xl border border-zinc-700/40 bg-zinc-900/60 p-6">
        <h2 className="text-xl font-bold">Reviews</h2>
        <div className="grid gap-4">
          <Input
            label="Reviewer name"
            value={reviewForm.reviewer}
            onChange={(e) => setReviewForm((p) => ({ ...p, reviewer: e.target.value }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Review message
            </label>
            <textarea
              value={reviewForm.message}
              onChange={(e) => setReviewForm((p) => ({ ...p, message: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100"
            />
          </div>
          <Input
            label="Rating (1 to 5)"
            type="number"
            min={1}
            max={5}
            value={String(reviewForm.rating)}
            onChange={(e) =>
              setReviewForm((p) => ({
                ...p,
                rating: Math.min(5, Math.max(1, parseInt(e.target.value || "5", 10))),
              }))
            }
          />
          <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={reviewForm.isFeatured}
              onChange={(e) =>
                setReviewForm((p) => ({ ...p, isFeatured: e.target.checked }))
              }
            />
            Show on landing page
          </label>
          <div>
            <Button
              onClick={addReview}
              loading={savingReview}
              disabled={!reviewForm.reviewer.trim() || !reviewForm.message.trim()}
            >
              Add Review
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-zinc-500">No reviews yet.</p>
          ) : (
            reviews.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {item.reviewer} <span className="text-xs text-amber-300">({item.rating}/5)</span>
                  </p>
                  <p className="text-sm text-zinc-400">{item.message}</p>
                  <p className="text-xs text-zinc-500">
                    {item.isFeatured ? "Featured on landing" : "Hidden from landing"}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => deleteReview(item.id)}>
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </section>

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

      <section className="auth-card space-y-4 rounded-2xl border border-zinc-700/40 bg-zinc-900/60 p-6">
        <h2 className="text-xl font-bold">Privacy Policy</h2>
        <p className="text-sm text-zinc-400">
          This content is shown on the public privacy policy page.
        </p>
        <textarea
          value={privacyPolicy}
          onChange={(e) => setPrivacyPolicy(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100"
        />
        <div>
          <Button onClick={savePrivacyPolicy} loading={savingPolicy}>
            Save Privacy Policy
          </Button>
        </div>
      </section>

      <section className="auth-card space-y-4 rounded-2xl border border-zinc-700/40 bg-zinc-900/60 p-6">
        <h2 className="text-xl font-bold">Legal PDFs (Stored in DB)</h2>
        <p className="text-sm text-zinc-400">
          Upload PDFs for footer links. Files are stored directly in database.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Privacy Policy PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                uploadLegalPdf("privacy-policy", e.target.files?.[0] ?? null)
              }
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
            />
            {uploadingPrivacyPdf && (
              <p className="mt-1 text-xs text-cyan-300">Uploading...</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Social Responsibility Rules PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                uploadLegalPdf("social-responsibility", e.target.files?.[0] ?? null)
              }
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
            />
            {uploadingSocialPdf && (
              <p className="mt-1 text-xs text-cyan-300">Uploading...</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { contentApi, type ReviewItem } from "@/lib/content-api";

export default function AdminReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [form, setForm] = useState({ reviewer: "", message: "", rating: 5, isFeatured: true });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await contentApi.getAdmin();
      setReviews(data.reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addReview() {
    if (!form.reviewer.trim() || !form.message.trim()) return;
    setSaving(true);
    setError("");
    try {
      await contentApi.createReview({
        reviewer: form.reviewer.trim(),
        message: form.message.trim(),
        rating: form.rating,
        isFeatured: form.isFeatured,
      });
      setForm({ reviewer: "", message: "", rating: 5, isFeatured: true });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create review");
    } finally {
      setSaving(false);
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

  if (loading) return <div className="text-zinc-400">Loading reviews...</div>;

  return (
    <div className="space-y-8 text-white">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Reviews</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage player reviews shown on the landing page.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white">Add review</h2>
        <div className="grid gap-4">
          <Input label="Reviewer name" value={form.reviewer} onChange={(e) => setForm((p) => ({ ...p, reviewer: e.target.value }))} />
          <div>
            <label className="mb-1.5 block text-sm font-medium !text-zinc-200">Review message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
            />
          </div>
          <Input label="Rating (1 to 5)" type="number" min={1} max={5} value={String(form.rating)} onChange={(e) => setForm((p) => ({ ...p, rating: Math.min(5, Math.max(1, parseInt(e.target.value || "5", 10))) }))} />
          <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} />
            Show on landing page
          </label>
          <Button onClick={addReview} loading={saving} disabled={!form.reviewer.trim() || !form.message.trim()}>Add Review</Button>
        </div>

        <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-6">
          <h3 className="text-sm font-semibold text-zinc-200">Existing reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-zinc-500">No reviews yet.</p>
          ) : (
            reviews.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-100">
                    {item.reviewer} <span className="text-xs text-[#EDC537]">({item.rating}/5)</span>
                  </p>
                  <p className="text-sm text-zinc-400">{item.message}</p>
                  <p className="text-xs text-zinc-500">{item.isFeatured ? "Featured on landing" : "Hidden from landing"}</p>
                </div>
                <Button variant="secondary" onClick={() => deleteReview(item.id)}>Delete</Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

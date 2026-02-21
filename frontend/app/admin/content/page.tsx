"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  contentApi,
  type BlogItem,
  type FaqItem,
  type SiteContacts,
} from "@/lib/content-api";

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [savingContacts, setSavingContacts] = useState(false);
  const [savingBlog, setSavingBlog] = useState(false);
  const [savingFaq, setSavingFaq] = useState(false);
  const [error, setError] = useState("");

  const [contacts, setContacts] = useState<SiteContacts>({
    facebook: "",
    whatsapp: "",
    instagram: "",
    email: "",
  });
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  const [blogForm, setBlogForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    imageUrl: "",
  });
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await contentApi.getAdmin();
      setContacts(data.contacts);
      setBlogs(data.blogs);
      setFaqs(data.faqs);
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

  async function addFaq() {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    setSavingFaq(true);
    setError("");
    try {
      await contentApi.createFaq({
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
      });
      setFaqForm({ question: "", answer: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Q/A");
    } finally {
      setSavingFaq(false);
    }
  }

  async function deleteFaq(id: string) {
    if (!confirm("Delete this Q/A item?")) return;
    try {
      await contentApi.removeFaq(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete Q/A");
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
          Manage contacts, blog section, and Q/A section.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="auth-card space-y-4 rounded-2xl border border-zinc-700/40 bg-zinc-900/60 p-6">
        <h2 className="text-xl font-bold">Contacts</h2>
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
          <Input
            label="Image URL (optional)"
            value={blogForm.imageUrl}
            onChange={(e) =>
              setBlogForm((p) => ({ ...p, imageUrl: e.target.value }))
            }
            placeholder="https://..."
          />
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
        <h2 className="text-xl font-bold">Q/A</h2>
        <div className="grid gap-4">
          <Input
            label="Question"
            value={faqForm.question}
            onChange={(e) => setFaqForm((p) => ({ ...p, question: e.target.value }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Answer
            </label>
            <textarea
              value={faqForm.answer}
              onChange={(e) => setFaqForm((p) => ({ ...p, answer: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-zinc-100"
            />
          </div>
          <div>
            <Button
              onClick={addFaq}
              loading={savingFaq}
              disabled={!faqForm.question.trim() || !faqForm.answer.trim()}
            >
              Add Q/A
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.length === 0 ? (
            <p className="text-sm text-zinc-500">No Q/A entries yet.</p>
          ) : (
            faqs.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{item.question}</p>
                  <p className="text-sm text-zinc-400">{item.answer}</p>
                </div>
                <Button variant="secondary" onClick={() => deleteFaq(item.id)}>
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { contentApi, type ContactMessage } from "@/lib/content-api";
import { Button } from "@/components/ui/Button";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await contentApi.listContactMessages();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6 text-zinc-100">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Inbox
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Contact Messages
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Messages submitted from the public Contact Us page.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300/95">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-14">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-400/80" />
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 text-sm text-zinc-400">
          No messages yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <article
              key={msg.id}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{msg.name}</p>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-xs text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
                  >
                    {msg.email}
                  </a>
                </div>
                <p className="text-xs text-zinc-500">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
              {msg.subject ? (
                <p className="mt-3 text-sm font-medium text-amber-200/90">
                  Subject: {msg.subject}
                </p>
              ) : null}
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">{msg.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

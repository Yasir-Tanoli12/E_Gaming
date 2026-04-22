"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usersApi, type ApiUser } from "@/lib/users-api";
import { authApi } from "@/lib/auth-api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AdminBrandingPanel } from "@/components/admin/AdminBrandingPanel";

export default function AdminDashboardPage() {
  const PAGE_SIZE = 10;
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  async function loadUsers(opts?: { silent?: boolean }) {
    if (!opts?.silent) {
      setLoading(true);
    }
    setError("");
    try {
      const data = await usersApi.list();
      setUsers(data);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      if (!opts?.silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleInviteAdmin(e: React.FormEvent) {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    const email = inviteEmail.trim();
    if (!email) {
      setInviteError("Enter an email address.");
      return;
    }
    setInviteLoading(true);
    try {
      const res = await authApi.promoteAdmin(email);
      setInviteSuccess(res.message);
      setInviteEmail("");
      await loadUsers({ silent: true });
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Could not add admin");
    } finally {
      setInviteLoading(false);
    }
  }

  async function toggleRole(u: ApiUser) {
    if (updatingId) return;
    const newRole = u.role === "ADMIN" ? "USER" : "ADMIN";
    setUpdatingId(u.id);
    setError("");
    try {
      const updated = await usersApi.updateRole(u.id, newRole as "USER" | "ADMIN");
      setUsers((prev) =>
        prev.map((x) => (x.id === updated.id ? { ...x, role: updated.role } : x))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(users.length / PAGE_SIZE)),
    [users.length]
  );
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return users.slice(start, start + PAGE_SIZE);
  }, [users, page]);

  const roleBadge = (role: string) =>
    role === "ADMIN" ? (
      <span className="inline-flex items-center rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-200/95">
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium text-zinc-400">
        User
      </span>
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Operations
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            User management
          </h1>
          <p className="text-sm leading-relaxed text-zinc-400">
            Invite administrators by email — they sign in with a one-time code. Use the
            directory below to adjust access for accounts that already exist.
          </p>
        </div>
        <Link href="/admin/games" className="shrink-0">
          <Button variant="secondary" className="w-full sm:w-auto">
            Games &amp; lobby
          </Button>
        </Link>
      </div>

      <AdminBrandingPanel />

      <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-white">Invite administrator</h2>
        <p className="mt-1 text-xs text-zinc-400">
          Adds the email to the admin directory. They will use the same sign-in page as you.
        </p>
        <form
          onSubmit={handleInviteAdmin}
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-stretch"
        >
          <div className="min-w-0 flex-1">
            <Input
              label="Work email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              error={inviteError || undefined}
              disabled={inviteLoading}
              className="!border-white/10 !bg-[#0c0c0f] !text-zinc-100 placeholder:!text-zinc-600"
            />
          </div>
          <Button type="submit" variant="accent" loading={inviteLoading} className="shrink-0 sm:min-w-[140px]">
            Send invite
          </Button>
        </form>
        {inviteSuccess && (
          <p className="mt-3 text-sm text-emerald-400/90">{inviteSuccess}</p>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300/95"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-400/80" />
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="space-y-3 md:hidden">
            {pagedUsers.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{u.email}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{u.name ?? "—"}</p>
                  </div>
                  {roleBadge(u.role)}
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  Joined {new Date(u.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    className="w-full !py-2.5 text-sm"
                    disabled={updatingId === u.id}
                    loading={updatingId === u.id}
                    onClick={() => toggleRole(u)}
                  >
                    {u.role === "ADMIN" ? "Demote to user" : "Grant admin"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet+: table */}
          <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Name
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Joined
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {pagedUsers.map((u) => (
                  <tr key={u.id} className="transition hover:bg-white/[0.02]">
                    <td className="max-w-[220px] truncate px-5 py-4 font-medium text-zinc-200">
                      {u.email}
                    </td>
                    <td className="px-5 py-4 text-zinc-500">{u.name ?? "—"}</td>
                    <td className="px-5 py-4">{roleBadge(u.role)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        variant="secondary"
                        className="!py-2 text-xs"
                        disabled={updatingId === u.id}
                        loading={updatingId === u.id}
                        onClick={() => toggleRole(u)}
                      >
                        {u.role === "ADMIN" ? "Demote" : "Make admin"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && users.length > PAGE_SIZE && (
        <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, users.length)} of{" "}
            {users.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="!py-2"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span className="px-2 text-zinc-600">
              {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              className="!py-2"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

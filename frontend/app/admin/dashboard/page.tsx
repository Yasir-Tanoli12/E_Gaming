"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usersApi, type ApiUser } from "@/lib/users-api";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const PAGE_SIZE = 10;
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await usersApi.list();
      setUsers(data);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User management</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Promote users to admin or demote admins to user.
          </p>
        </div>
        <Link href="/admin/games" className="self-start">
          <Button variant="secondary">Manage games →</Button>
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EDC537] border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="px-4 py-3 text-sm font-medium text-zinc-400">Email</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-400">Name</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-400">Role</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-400">Joined</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-zinc-800/80 last:border-0"
                >
                  <td className="px-4 py-3 text-zinc-200">{u.email}</td>
                  <td className="px-4 py-3 text-zinc-400">{u.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-[#EDC537]/20 text-[#EDC537]"
                          : "bg-zinc-700 text-zinc-400"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="secondary"
                      disabled={updatingId === u.id}
                      loading={!!(updatingId === u.id)}
                      onClick={() => toggleRole(u)}
                    >
                      {u.role === "ADMIN" ? "Demote to user" : "Make admin"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && users.length > PAGE_SIZE && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
          <p>
            Showing {(page - 1) * PAGE_SIZE + 1}-
            {Math.min(page * PAGE_SIZE, users.length)} of {users.length} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span>
              Page {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  usersApi,
  type ApiUser,
  type AdminAllowlistEntry,
} from "@/lib/users-api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [allowedAdmins, setAllowedAdmins] = useState<AdminAllowlistEntry[]>([]);
  const [allowEmail, setAllowEmail] = useState("");
  const [allowlistLoading, setAllowlistLoading] = useState(true);
  const [savingAllowEmail, setSavingAllowEmail] = useState(false);
  const [removingAllowEmail, setRemovingAllowEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    loadAllowlist();
  }, []);

  async function loadAllowlist() {
    setAllowlistLoading(true);
    try {
      const data = await usersApi.listAdminAllowlist();
      setAllowedAdmins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load allowlist");
    } finally {
      setAllowlistLoading(false);
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

  async function addAllowedAdminEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!allowEmail.trim()) return;
    setSavingAllowEmail(true);
    setError("");
    try {
      const res = await usersApi.addAdminAllowlist(allowEmail.trim());
      if (!res.alreadyExists) {
        await loadAllowlist();
      }
      setAllowEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add admin email");
    } finally {
      setSavingAllowEmail(false);
    }
  }

  async function removeAllowedAdminEmail(email: string) {
    setRemovingAllowEmail(email);
    setError("");
    try {
      await usersApi.removeAdminAllowlist(email);
      setAllowedAdmins((prev) => prev.filter((x) => x.email !== email));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove admin email");
    } finally {
      setRemovingAllowEmail(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User management</h1>
          <p className="mt-1 text-zinc-400">
            Promote users to admin or demote admins to user.
          </p>
        </div>
        <Link href="/admin/games">
          <Button variant="secondary">Manage games →</Button>
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="text-lg font-semibold text-white">Admin allowlist</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Add an email here to allow that person to create an admin account from the register page.
        </p>
        <form onSubmit={addAllowedAdminEmail} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1">
            <Input
              label="Allowed admin email"
              type="email"
              value={allowEmail}
              onChange={(e) => setAllowEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          <Button type="submit" loading={savingAllowEmail}>
            Add email
          </Button>
        </form>

        {allowlistLoading ? (
          <p className="mt-4 text-sm text-zinc-400">Loading allowlist...</p>
        ) : allowedAdmins.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No allowlisted emails yet.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {allowedAdmins.map((item) => (
              <div
                key={item.email}
                className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/70 px-3 py-1.5"
              >
                <span className="text-sm text-zinc-200">{item.email}</span>
                <button
                  type="button"
                  className="text-xs text-red-300 hover:text-red-200"
                  onClick={() => removeAllowedAdminEmail(item.email)}
                  disabled={removingAllowEmail === item.email}
                >
                  {removingAllowEmail === item.email ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
          <table className="w-full">
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
              {users.map((u) => (
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
                          ? "bg-emerald-500/20 text-emerald-400"
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
    </div>
  );
}

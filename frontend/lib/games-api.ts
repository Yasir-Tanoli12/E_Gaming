import { apiRequest, getAuthHeaders } from "./api";

export interface Game {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  gameLink: string;
  sortOrder: number;
  isActive?: boolean;
}

export interface CreateGameInput {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  gameLink: string;
  sortOrder?: number;
  isActive?: boolean;
}

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const gamesApi = {
  list() {
    return apiRequest<Game[]>("/games");
  },

  listAdmin() {
    return apiRequest<Game[]>("/games/admin");
  },

  listTop() {
    return apiRequest<Game[]>("/games/top");
  },

  setTopGames(ids: string[]) {
    return apiRequest<{ topGameIds: string[] }>("/games/top-selection", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },

  async uploadMedia(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${getBaseUrl()}/games/upload-media`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        typeof data.message === "string" ? data.message : "Upload failed";
      throw new Error(message);
    }
    return data as { url: string };
  },

  create(body: CreateGameInput) {
    return apiRequest<Game>("/games", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(id: string, body: Partial<CreateGameInput>) {
    return apiRequest<Game>(`/games/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  remove(id: string) {
    return apiRequest<{ id: string }>(`/games/${id}`, { method: "DELETE" });
  },
};

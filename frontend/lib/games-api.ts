import { apiFormRequest, apiRequest } from "./api";

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
  /** Upload path or null on PATCH to clear (never a pasted media URL in admin UI). */
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  gameLink: string;
  sortOrder?: number;
  isActive?: boolean;
}

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
    return apiFormRequest<{ url: string }>("/games/upload-media", "POST", formData);
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

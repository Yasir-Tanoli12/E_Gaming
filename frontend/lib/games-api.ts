import { apiRequest } from "./api";

export interface Game {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  gameLink: string;
  sortOrder: number;
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

export const gamesApi = {
  list() {
    return apiRequest<Game[]>("/games");
  },

  listAdmin() {
    return apiRequest<Game[]>("/games/admin");
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

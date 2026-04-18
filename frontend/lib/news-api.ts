import { apiRequest } from "./api";

export interface NewsPoster {
  id: string;
  title: string | null;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface NewsInput {
  title?: string;
  imageUrl: string;
  isActive?: boolean;
}

export const newsApi = {
  current() {
    return apiRequest<NewsPoster | null>("/news/current");
  },
  list() {
    return apiRequest<NewsPoster[]>("/news");
  },
  create(body: NewsInput) {
    return apiRequest<NewsPoster>("/news", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  update(id: string, body: Partial<NewsInput>) {
    return apiRequest<NewsPoster>(`/news/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  remove(id: string) {
    return apiRequest<{ id: string }>(`/news/${id}`, { method: "DELETE" });
  },
};

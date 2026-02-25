import { apiRequest, getAuthHeaders } from "./api";

export interface SiteContacts {
  facebook: string;
  whatsapp: string;
  instagram: string;
  email: string;
  logoUrl?: string | null;
  lobbyVideoUrl?: string | null;
}

export interface BlogItem {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  reviewer: string;
  message: string;
  rating: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteContent {
  contacts: SiteContacts;
  blogs: BlogItem[];
  faqs: FaqItem[];
  reviews: ReviewItem[];
  aboutUs: string;
  ageWarning: {
    title: string;
    message: string;
    enterButtonLabel: string;
    exitButtonLabel: string;
    exitUrl: string;
  };
  privacyPolicy: string;
  privacyPolicyPdfUrl?: string | null;
  socialResponsibilityPdfUrl?: string | null;
}

export const contentApi = {
  async uploadLobbyVideo(file: File): Promise<{ lobbyVideoUrl: string | null; updatedAt: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${baseUrl}/content/lobby-video`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        typeof data.message === "string" ? data.message : "Lobby video upload failed";
      throw new Error(message);
    }
    return data as { lobbyVideoUrl: string | null; updatedAt: string };
  },
  async uploadLogo(file: File): Promise<{ logoUrl: string | null; updatedAt: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${baseUrl}/content/logo`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        typeof data.message === "string" ? data.message : "Logo upload failed";
      throw new Error(message);
    }
    return data as { logoUrl: string | null; updatedAt: string };
  },
  async uploadPolicyDocument(
    key: "privacy-policy" | "social-responsibility",
    file: File
  ): Promise<{ id: string; key: string; fileName: string; mimeType: string; updatedAt: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${baseUrl}/content/documents/${key}`, {
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
    return data as { id: string; key: string; fileName: string; mimeType: string; updatedAt: string };
  },
  getPublic() {
    return apiRequest<SiteContent>("/content/public");
  },
  getAdmin() {
    return apiRequest<SiteContent>("/content/admin");
  },
  updateContacts(body: Partial<SiteContacts>) {
    return apiRequest<SiteContacts>("/content/contacts", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  createBlog(body: Omit<BlogItem, "id" | "createdAt" | "updatedAt">) {
    return apiRequest<BlogItem>("/content/blogs", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  updateBlog(id: string, body: Partial<BlogItem>) {
    return apiRequest<BlogItem>(`/content/blogs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  removeBlog(id: string) {
    return apiRequest<{ removed: boolean }>(`/content/blogs/${id}`, {
      method: "DELETE",
    });
  },
  createFaq(body: Omit<FaqItem, "id" | "createdAt" | "updatedAt">) {
    return apiRequest<FaqItem>("/content/faqs", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  updateFaq(id: string, body: Partial<FaqItem>) {
    return apiRequest<FaqItem>(`/content/faqs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  removeFaq(id: string) {
    return apiRequest<{ removed: boolean }>(`/content/faqs/${id}`, {
      method: "DELETE",
    });
  },
  createReview(body: Omit<ReviewItem, "id" | "createdAt" | "updatedAt">) {
    return apiRequest<ReviewItem>("/content/reviews", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  updateReview(id: string, body: Partial<ReviewItem>) {
    return apiRequest<ReviewItem>(`/content/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  removeReview(id: string) {
    return apiRequest<{ removed: boolean }>(`/content/reviews/${id}`, {
      method: "DELETE",
    });
  },
  updatePrivacyPolicy(content: string) {
    return apiRequest<{ id: string; content: string; updatedAt: string }>(
      "/content/privacy-policy",
      {
        method: "PATCH",
        body: JSON.stringify({ content }),
      }
    );
  },
  updateAboutUs(content: string) {
    return apiRequest<{ id: string; title: string; content: string; updatedAt: string }>(
      "/content/about-us",
      {
        method: "PATCH",
        body: JSON.stringify({ content }),
      }
    );
  },
  updateAgeWarning(body: Partial<SiteContent["ageWarning"]>) {
    return apiRequest<{ id: string; content: string; updatedAt: string }>(
      "/content/age-warning",
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );
  },
};

import { apiFormRequest, apiFormRequestWithProgress, apiRequest } from "./api";

export interface SiteContacts {
  facebook: string;
  whatsapp: string;
  instagram: string;
  /** Public profile, @username, or t.me link — optional until API returns it. */
  telegram?: string;
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

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  createdAt: string;
}

const PUBLIC_CONTENT_TTL_MS = 60_000;
let publicContentCache: { value: SiteContent; expiresAt: number } | null = null;
let publicContentInFlight: Promise<SiteContent> | null = null;

function clearPublicContentCache() {
  publicContentCache = null;
  publicContentInFlight = null;
}

export const contentApi = {
  async getPublicCached(options?: { ttlMs?: number; forceRefresh?: boolean }) {
    const ttlMs = options?.ttlMs ?? PUBLIC_CONTENT_TTL_MS;
    const now = Date.now();
    if (!options?.forceRefresh && publicContentCache && publicContentCache.expiresAt > now) {
      return publicContentCache.value;
    }
    if (!options?.forceRefresh && publicContentInFlight) {
      return publicContentInFlight;
    }

    publicContentInFlight = apiRequest<SiteContent>("/content/public")
      .then((data) => {
        publicContentCache = { value: data, expiresAt: Date.now() + ttlMs };
        return data;
      })
      .finally(() => {
        publicContentInFlight = null;
      });

    return publicContentInFlight;
  },
  async uploadLobbyVideo(
    file: File,
    onProgress?: (percent: number | null) => void
  ): Promise<{ lobbyVideoUrl: string | null; updatedAt: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const result = await apiFormRequestWithProgress<{
      lobbyVideoUrl: string | null;
      updatedAt: string;
    }>(
      "/content/lobby-video",
      "POST",
      formData,
      (p) => onProgress?.(p.percent)
    );
    clearPublicContentCache();
    return result;
  },
  async uploadLogo(
    file: File,
    onProgress?: (percent: number | null) => void
  ): Promise<{ logoUrl: string | null; updatedAt: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const result = await apiFormRequestWithProgress<{ logoUrl: string | null; updatedAt: string }>(
      "/content/logo",
      "POST",
      formData,
      (p) => onProgress?.(p.percent)
    );
    clearPublicContentCache();
    return result;
  },
  async uploadPolicyDocument(
    key: "privacy-policy" | "social-responsibility",
    file: File
  ): Promise<{ id: string; key: string; fileName: string; mimeType: string; updatedAt: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const result = await apiFormRequest<{
      id: string;
      key: string;
      fileName: string;
      mimeType: string;
      updatedAt: string;
    }>(`/content/documents/${key}`, "POST", formData);
    clearPublicContentCache();
    return result;
  },
  submitContactMessage(body: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }) {
    return apiRequest<ContactMessage>("/content/contact-messages", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  listContactMessages() {
    return apiRequest<ContactMessage[]>("/content/contact-messages");
  },
  getPublic() {
    return this.getPublicCached();
  },
  getAdmin() {
    return apiRequest<SiteContent>("/content/admin");
  },
  updateContacts(body: Partial<SiteContacts>) {
    return apiRequest<SiteContacts>("/content/contacts", {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  createBlog(body: Omit<BlogItem, "id" | "createdAt" | "updatedAt">) {
    return apiRequest<BlogItem>("/content/blogs", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  updateBlog(id: string, body: Partial<BlogItem>) {
    return apiRequest<BlogItem>(`/content/blogs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  removeBlog(id: string) {
    return apiRequest<{ removed: boolean }>(`/content/blogs/${id}`, {
      method: "DELETE",
    }).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  createFaq(body: Omit<FaqItem, "id" | "createdAt" | "updatedAt">) {
    return apiRequest<FaqItem>("/content/faqs", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  updateFaq(id: string, body: Partial<FaqItem>) {
    return apiRequest<FaqItem>(`/content/faqs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  removeFaq(id: string) {
    return apiRequest<{ removed: boolean }>(`/content/faqs/${id}`, {
      method: "DELETE",
    }).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  createReview(body: Omit<ReviewItem, "id" | "createdAt" | "updatedAt">) {
    return apiRequest<ReviewItem>("/content/reviews", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  updateReview(id: string, body: Partial<ReviewItem>) {
    return apiRequest<ReviewItem>(`/content/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  removeReview(id: string) {
    return apiRequest<{ removed: boolean }>(`/content/reviews/${id}`, {
      method: "DELETE",
    }).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  updatePrivacyPolicy(content: string) {
    return apiRequest<{ id: string; content: string; updatedAt: string }>(
      "/content/privacy-policy",
      {
        method: "PATCH",
        body: JSON.stringify({ content }),
      }
    ).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  updateAboutUs(content: string) {
    return apiRequest<{ id: string; title: string; content: string; updatedAt: string }>(
      "/content/about-us",
      {
        method: "PATCH",
        body: JSON.stringify({ content }),
      }
    ).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
  updateAgeWarning(body: Partial<SiteContent["ageWarning"]>) {
    return apiRequest<{ id: string; content: string; updatedAt: string }>(
      "/content/age-warning",
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    ).then((result) => {
      clearPublicContentCache();
      return result;
    });
  },
};

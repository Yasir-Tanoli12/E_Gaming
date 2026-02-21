import { apiRequest } from "./api";

export interface SiteContacts {
  facebook: string;
  whatsapp: string;
  instagram: string;
  email: string;
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

export interface SiteContent {
  contacts: SiteContacts;
  blogs: BlogItem[];
  faqs: FaqItem[];
}

export const contentApi = {
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
};

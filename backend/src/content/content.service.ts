import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CreateBlogDto } from './dto/create-blog.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UpdateContactsDto } from './dto/update-contacts.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

type Contacts = {
  facebook: string;
  whatsapp: string;
  instagram: string;
  email: string;
};

type BlogItem = {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
};

type SiteContent = {
  contacts: Contacts;
  blogs: BlogItem[];
  faqs: FaqItem[];
};

@Injectable()
export class ContentService {
  private readonly filePath = join(process.cwd(), 'data', 'site-content.json');

  private ensureFile() {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    if (!existsSync(this.filePath)) {
      this.write({
        contacts: { facebook: '', whatsapp: '', instagram: '', email: '' },
        blogs: [],
        faqs: [],
      });
    }
  }

  private read(): SiteContent {
    this.ensureFile();
    return JSON.parse(readFileSync(this.filePath, 'utf8')) as SiteContent;
  }

  private write(payload: SiteContent) {
    writeFileSync(this.filePath, JSON.stringify(payload, null, 2), 'utf8');
  }

  getPublicContent() {
    return this.read();
  }

  getAdminContent() {
    return this.read();
  }

  updateContacts(dto: UpdateContactsDto) {
    const current = this.read();
    current.contacts = {
      ...current.contacts,
      ...dto,
    };
    this.write(current);
    return current.contacts;
  }

  createBlog(dto: CreateBlogDto) {
    const current = this.read();
    const now = new Date().toISOString();
    const item: BlogItem = {
      id: randomUUID(),
      title: dto.title,
      excerpt: dto.excerpt,
      content: dto.content,
      imageUrl: dto.imageUrl,
      createdAt: now,
      updatedAt: now,
    };
    current.blogs.unshift(item);
    this.write(current);
    return item;
  }

  updateBlog(id: string, dto: UpdateBlogDto) {
    const current = this.read();
    const index = current.blogs.findIndex((b) => b.id === id);
    if (index < 0) return null;
    current.blogs[index] = {
      ...current.blogs[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.write(current);
    return current.blogs[index];
  }

  removeBlog(id: string) {
    const current = this.read();
    const before = current.blogs.length;
    current.blogs = current.blogs.filter((b) => b.id !== id);
    this.write(current);
    return { removed: before !== current.blogs.length };
  }

  createFaq(dto: CreateFaqDto) {
    const current = this.read();
    const now = new Date().toISOString();
    const item: FaqItem = {
      id: randomUUID(),
      question: dto.question,
      answer: dto.answer,
      createdAt: now,
      updatedAt: now,
    };
    current.faqs.unshift(item);
    this.write(current);
    return item;
  }

  updateFaq(id: string, dto: UpdateFaqDto) {
    const current = this.read();
    const index = current.faqs.findIndex((f) => f.id === id);
    if (index < 0) return null;
    current.faqs[index] = {
      ...current.faqs[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.write(current);
    return current.faqs[index];
  }

  removeFaq(id: string) {
    const current = this.read();
    const before = current.faqs.length;
    current.faqs = current.faqs.filter((f) => f.id !== id);
    this.write(current);
    return { removed: before !== current.faqs.length };
  }
}

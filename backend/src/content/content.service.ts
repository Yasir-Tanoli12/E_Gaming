import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

const CONTENT_PUBLIC_CACHE_KEY = 'content:public';
const CACHE_TTL_MS = 60 * 1000;
import { PolicyDocumentKey } from '@prisma/client';
import { CreateBlogDto } from './dto/create-blog.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateAboutUsDto } from './dto/update-about-us.dto';
import { UpdateAgeWarningDto } from './dto/update-age-warning.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UpdateContactsDto } from './dto/update-contacts.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}
  private static readonly ABOUT_US_BLOG_ID = 'about-us-page';
  private static readonly AGE_WARNING_BLOG_ID = 'age-warning-config';
  private static readonly ABOUT_US_DEFAULT_CONTENT =
    'SWEEPSTOWN is built to provide a fast, immersive, and responsible online gaming experience with secure access, live updates, and responsive support for all players.';
  private static readonly AGE_WARNING_DEFAULT = {
    title: '18+ Content Notice',
    message:
      'This gaming website may include mature themes. Enter only if you are 18 years old or above.',
    enterButtonLabel: 'I am 18+ Enter',
    exitButtonLabel: 'Exit',
    exitUrl: 'https://www.google.com',
  };

  private readonly legacyFilePath = join(
    process.cwd(),
    'data',
    'site-content.json',
  );
  private bootstrapDone = false;

  private async bootstrapFromLegacyFile() {
    if (this.bootstrapDone) return;
    this.bootstrapDone = true;

    const [contact] = await this.prisma.$transaction([
      this.prisma.contact.upsert({
        where: { id: 'default' },
        update: {},
        create: { id: 'default' },
      }),
      this.prisma.privacyPolicy.upsert({
        where: { id: 'default' },
        update: {},
        create: {
          id: 'default',
          content: 'Privacy policy will be added soon.',
          privacyPolicyPdfUrl: null,
          socialResponsibilityPdfUrl: null,
        },
      }),
    ]);

    if (!existsSync(this.legacyFilePath)) return;

    let legacy: {
      contacts?: {
        facebook?: string;
        whatsapp?: string;
        instagram?: string;
        email?: string;
        logoUrl?: string;
      };
      blogs?: Array<{
        id?: string;
        title: string;
        excerpt?: string;
        content?: string;
        imageUrl?: string;
        createdAt?: string;
        updatedAt?: string;
      }>;
      faqs?: Array<{
        id?: string;
        question: string;
        answer: string;
        createdAt?: string;
        updatedAt?: string;
      }>;
      reviews?: Array<{
        id?: string;
        reviewer?: string;
        message?: string;
        rating?: number;
        isFeatured?: boolean;
        createdAt?: string;
        updatedAt?: string;
      }>;
      privacyPolicy?: string;
    };

    try {
      legacy = JSON.parse(
        readFileSync(this.legacyFilePath, 'utf8'),
      ) as typeof legacy;
    } catch {
      return;
    }

    const [blogCount, faqCount, reviewCount] = await this.prisma.$transaction([
      this.prisma.blog.count({
        where: {
          id: {
            notIn: [
              ContentService.ABOUT_US_BLOG_ID,
              ContentService.AGE_WARNING_BLOG_ID,
            ],
          },
        },
      }),
      this.prisma.faq.count(),
      this.prisma.review.count(),
    ]);

    if (
      legacy.contacts &&
      !contact.facebook &&
      !contact.whatsapp &&
      !contact.instagram &&
      !contact.email &&
      !contact.logoUrl
    ) {
      await this.prisma.contact.update({
        where: { id: 'default' },
        data: {
          facebook: legacy.contacts.facebook ?? '',
          whatsapp: legacy.contacts.whatsapp ?? '',
          instagram: legacy.contacts.instagram ?? '',
          email: legacy.contacts.email ?? '',
          logoUrl: legacy.contacts.logoUrl ?? null,
        },
      });
    }

    if (
      blogCount === 0 &&
      Array.isArray(legacy.blogs) &&
      legacy.blogs.length > 0
    ) {
      await this.prisma.blog.createMany({
        data: legacy.blogs.map((blog) => ({
          id: blog.id,
          title: blog.title,
          excerpt: blog.excerpt ?? null,
          content: blog.content ?? null,
          imageUrl: blog.imageUrl ?? null,
          createdAt: blog.createdAt ? new Date(blog.createdAt) : undefined,
          updatedAt: blog.updatedAt ? new Date(blog.updatedAt) : undefined,
        })),
        skipDuplicates: true,
      });
    }

    if (
      faqCount === 0 &&
      Array.isArray(legacy.faqs) &&
      legacy.faqs.length > 0
    ) {
      await this.prisma.faq.createMany({
        data: legacy.faqs.map((faq) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          createdAt: faq.createdAt ? new Date(faq.createdAt) : undefined,
          updatedAt: faq.updatedAt ? new Date(faq.updatedAt) : undefined,
        })),
        skipDuplicates: true,
      });
    }

    if (
      reviewCount === 0 &&
      Array.isArray(legacy.reviews) &&
      legacy.reviews.length > 0
    ) {
      await this.prisma.review.createMany({
        data: legacy.reviews
          .filter((review) => !!review.message)
          .map((review) => ({
            id: review.id,
            reviewer: review.reviewer ?? 'Anonymous',
            message: review.message ?? '',
            rating: review.rating ?? 5,
            isFeatured: review.isFeatured ?? true,
            createdAt: review.createdAt
              ? new Date(review.createdAt)
              : undefined,
            updatedAt: review.updatedAt
              ? new Date(review.updatedAt)
              : undefined,
          })),
        skipDuplicates: true,
      });
    }

    if (legacy.privacyPolicy && legacy.privacyPolicy.trim()) {
      const policy = await this.prisma.privacyPolicy.findUnique({
        where: { id: 'default' },
      });
      if (
        policy &&
        (!policy.content ||
          policy.content.trim() === 'Privacy policy will be added soon.')
      ) {
        await this.prisma.privacyPolicy.update({
          where: { id: 'default' },
          data: { content: legacy.privacyPolicy.trim() },
        });
      }
    }
  }

  async getPublicContent() {
    const cached = await this.cache.get<Awaited<ReturnType<typeof this.getPublicContent>>>(CONTENT_PUBLIC_CACHE_KEY);
    if (cached) return cached;
    await this.bootstrapFromLegacyFile();
    const contacts = await this.prisma.withPoolRetry(() =>
      this.prisma.contact.findUnique({ where: { id: 'default' } }),
    );
    const blogs = await this.prisma.withPoolRetry(() =>
      this.prisma.blog.findMany({
        where: {
          id: {
            notIn: [
              ContentService.ABOUT_US_BLOG_ID,
              ContentService.AGE_WARNING_BLOG_ID,
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          excerpt: true,
          content: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    );
    const faqs = await this.prisma.withPoolRetry(() =>
      this.prisma.faq.findMany({ orderBy: { createdAt: 'desc' } }),
    );
    const reviews = await this.prisma.withPoolRetry(() =>
      this.prisma.review.findMany({
        where: { isFeatured: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reviewer: true,
          message: true,
          rating: true,
          createdAt: true,
        },
      }),
    );
    const privacyPolicy = await this.prisma.withPoolRetry(() =>
      this.prisma.privacyPolicy.findUnique({
        where: { id: 'default' },
        select: { content: true },
      }),
    );
    const aboutUsBlog = await this.prisma.withPoolRetry(() =>
      this.prisma.blog.findUnique({
        where: { id: ContentService.ABOUT_US_BLOG_ID },
        select: { content: true },
      }),
    );
    const ageWarningBlog = await this.prisma.withPoolRetry(() =>
      this.prisma.blog.findUnique({
        where: { id: ContentService.AGE_WARNING_BLOG_ID },
        select: { content: true },
      }),
    );

    const result = {
      contacts: contacts ?? {
        facebook: '',
        whatsapp: '',
        instagram: '',
        email: '',
        logoUrl: null,
        lobbyVideoUrl: null,
      },
      blogs,
      faqs,
      reviews,
      aboutUs:
        aboutUsBlog?.content?.trim() ??
        ContentService.ABOUT_US_DEFAULT_CONTENT,
      ageWarning: this.parseAgeWarningContent(ageWarningBlog?.content),
      privacyPolicy: privacyPolicy?.content ?? '',
      privacyPolicyPdfUrl: null,
      socialResponsibilityPdfUrl: null,
    };
    await this.cache.set(CONTENT_PUBLIC_CACHE_KEY, result, CACHE_TTL_MS);
    return result;
  }

  async getAdminContent() {
    await this.bootstrapFromLegacyFile();
    const contacts = await this.prisma.withPoolRetry(() =>
      this.prisma.contact.findUnique({ where: { id: 'default' } }),
    );
    const blogs = await this.prisma.withPoolRetry(() =>
      this.prisma.blog.findMany({
        where: {
          id: {
            notIn: [
              ContentService.ABOUT_US_BLOG_ID,
              ContentService.AGE_WARNING_BLOG_ID,
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
    const faqs = await this.prisma.withPoolRetry(() =>
      this.prisma.faq.findMany({ orderBy: { createdAt: 'desc' } }),
    );
    const reviews = await this.prisma.withPoolRetry(() =>
      this.prisma.review.findMany({ orderBy: { createdAt: 'desc' } }),
    );
    const privacyPolicy = await this.prisma.withPoolRetry(() =>
      this.prisma.privacyPolicy.findUnique({
        where: { id: 'default' },
        select: { content: true },
      }),
    );
    const aboutUsBlog = await this.prisma.withPoolRetry(() =>
      this.prisma.blog.findUnique({
        where: { id: ContentService.ABOUT_US_BLOG_ID },
        select: { content: true },
      }),
    );
    const ageWarningBlog = await this.prisma.withPoolRetry(() =>
      this.prisma.blog.findUnique({
        where: { id: ContentService.AGE_WARNING_BLOG_ID },
        select: { content: true },
      }),
    );

    return {
      contacts: contacts ?? {
        facebook: '',
        whatsapp: '',
        instagram: '',
        email: '',
        logoUrl: null,
        lobbyVideoUrl: null,
      },
      blogs,
      faqs,
      reviews,
      aboutUs:
        aboutUsBlog?.content?.trim() ??
        ContentService.ABOUT_US_DEFAULT_CONTENT,
      ageWarning: this.parseAgeWarningContent(ageWarningBlog?.content),
      privacyPolicy: privacyPolicy?.content ?? '',
      privacyPolicyPdfUrl: null,
      socialResponsibilityPdfUrl: null,
    };
  }

  private async invalidatePublicCache() {
    await this.cache.del(CONTENT_PUBLIC_CACHE_KEY);
  }

  async updateContacts(dto: UpdateContactsDto) {
    await this.bootstrapFromLegacyFile();
    const result = await this.prisma.contact.update({
      where: { id: 'default' },
      data: dto,
    });
    await this.invalidatePublicCache();
    return result;
  }

  async updateLogo(logoUrl: string) {
    await this.bootstrapFromLegacyFile();
    const contact = await this.prisma.contact.update({
      where: { id: 'default' },
      data: { logoUrl },
      select: { logoUrl: true, updatedAt: true },
    });
    await this.invalidatePublicCache();
    return contact;
  }

  async updateLobbyVideo(videoUrl: string) {
    await this.bootstrapFromLegacyFile();
    const contact = await this.prisma.contact.update({
      where: { id: 'default' },
      data: { lobbyVideoUrl: videoUrl },
      select: { lobbyVideoUrl: true, updatedAt: true },
    });
    await this.invalidatePublicCache();
    return contact;
  }

  async createBlog(dto: CreateBlogDto) {
    await this.bootstrapFromLegacyFile();
    const result = await this.prisma.blog.create({
      data: {
        title: dto.title,
        excerpt: dto.excerpt ?? null,
        content: dto.content ?? null,
        imageUrl: dto.imageUrl ?? null,
      },
    });
    await this.invalidatePublicCache();
    return result;
  }

  async updateBlog(id: string, dto: UpdateBlogDto) {
    await this.bootstrapFromLegacyFile();
    const result = await this.prisma.blog.update({
      where: { id },
      data: {
        title: dto.title,
        excerpt: dto.excerpt,
        content: dto.content,
        imageUrl: dto.imageUrl,
      },
    });
    await this.invalidatePublicCache();
    return result;
  }

  async removeBlog(id: string) {
    await this.bootstrapFromLegacyFile();
    await this.prisma.blog.delete({ where: { id } });
    await this.invalidatePublicCache();
    return { removed: true };
  }

  async createFaq(dto: CreateFaqDto) {
    await this.bootstrapFromLegacyFile();
    const result = await this.prisma.faq.create({
      data: {
        question: dto.question,
        answer: dto.answer,
      },
    });
    await this.invalidatePublicCache();
    return result;
  }

  async updateFaq(id: string, dto: UpdateFaqDto) {
    await this.bootstrapFromLegacyFile();
    const result = await this.prisma.faq.update({
      where: { id },
      data: {
        question: dto.question,
        answer: dto.answer,
      },
    });
    await this.invalidatePublicCache();
    return result;
  }

  async removeFaq(id: string) {
    await this.bootstrapFromLegacyFile();
    await this.prisma.faq.delete({ where: { id } });
    await this.invalidatePublicCache();
    return { removed: true };
  }

  async createReview(dto: CreateReviewDto) {
    await this.bootstrapFromLegacyFile();
    const result = await this.prisma.review.create({
      data: {
        reviewer: dto.reviewer,
        message: dto.message,
        rating: dto.rating ?? 5,
        isFeatured: dto.isFeatured ?? true,
      },
    });
    await this.invalidatePublicCache();
    return result;
  }

  async updateReview(id: string, dto: UpdateReviewDto) {
    await this.bootstrapFromLegacyFile();
    const result = await this.prisma.review.update({
      where: { id },
      data: {
        reviewer: dto.reviewer,
        message: dto.message,
        rating: dto.rating,
        isFeatured: dto.isFeatured,
      },
    });
    await this.invalidatePublicCache();
    return result;
  }

  async removeReview(id: string) {
    await this.bootstrapFromLegacyFile();
    await this.prisma.review.delete({ where: { id } });
    await this.invalidatePublicCache();
    return { removed: true };
  }

  async updatePrivacyPolicy(dto: UpdatePrivacyPolicyDto, updatedBy?: string) {
    await this.bootstrapFromLegacyFile();
    const result = await this.prisma.privacyPolicy.update({
      where: { id: 'default' },
      data: {
        content: dto.content,
        updatedBy: updatedBy ?? null,
      },
    });
    await this.invalidatePublicCache();
    return result;
  }

  async updateAboutUs(dto: UpdateAboutUsDto, updatedBy?: string) {
    await this.bootstrapFromLegacyFile();
    const clean = dto.content?.trim() || ContentService.ABOUT_US_DEFAULT_CONTENT;
    const result = await this.prisma.blog.upsert({
      where: { id: ContentService.ABOUT_US_BLOG_ID },
      update: {
        title: 'About Us',
        excerpt: 'About SWEEPSTOWN',
        content: clean,
      },
      create: {
        id: ContentService.ABOUT_US_BLOG_ID,
        title: 'About Us',
        excerpt: `Updated by ${updatedBy ?? 'admin'}`,
        content: clean,
      },
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
      },
    });
    await this.invalidatePublicCache();
    return result;
  }

  async updateAgeWarning(dto: UpdateAgeWarningDto) {
    await this.bootstrapFromLegacyFile();
    const current = await this.prisma.blog.findUnique({
      where: { id: ContentService.AGE_WARNING_BLOG_ID },
      select: { content: true },
    });
    const parsed = this.parseAgeWarningContent(current?.content);
    const next = {
      title: dto.title?.trim() || parsed.title,
      message: dto.message?.trim() || parsed.message,
      enterButtonLabel:
        dto.enterButtonLabel?.trim() || parsed.enterButtonLabel,
      exitButtonLabel: dto.exitButtonLabel?.trim() || parsed.exitButtonLabel,
      exitUrl: dto.exitUrl?.trim() || parsed.exitUrl,
    };
    const result = await this.prisma.blog.upsert({
      where: { id: ContentService.AGE_WARNING_BLOG_ID },
      update: {
        title: 'Age Warning',
        excerpt: '18+ popup content',
        content: JSON.stringify(next),
      },
      create: {
        id: ContentService.AGE_WARNING_BLOG_ID,
        title: 'Age Warning',
        excerpt: '18+ popup content',
        content: JSON.stringify(next),
      },
      select: {
        id: true,
        content: true,
        updatedAt: true,
      },
    });
    await this.invalidatePublicCache();
    return result;
  }

  private parseAgeWarningContent(raw: string | null | undefined) {
    const fallback = ContentService.AGE_WARNING_DEFAULT;
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw) as Partial<typeof fallback>;
      return {
        title: parsed.title?.trim() || fallback.title,
        message: parsed.message?.trim() || fallback.message,
        enterButtonLabel:
          parsed.enterButtonLabel?.trim() || fallback.enterButtonLabel,
        exitButtonLabel:
          parsed.exitButtonLabel?.trim() || fallback.exitButtonLabel,
        exitUrl: parsed.exitUrl?.trim() || fallback.exitUrl,
      };
    } catch {
      return fallback;
    }
  }

  private toPolicyDocumentKey(key: string): PolicyDocumentKey {
    const normalized = key.trim().toLowerCase().replace(/\s+/g, '-');
    if (normalized === 'privacy-policy') return 'PRIVACY_POLICY';
    if (normalized === 'social-responsibility')
      return 'SOCIAL_RESPONSIBILITY';
    throw new Error('Invalid legal document key');
  }

  async upsertPolicyDocument(
    key: string,
    file: { originalname: string; mimetype: string; buffer: Buffer },
  ) {
    await this.bootstrapFromLegacyFile();
    const docKey = this.toPolicyDocumentKey(key);
    const result = await this.prisma.policyDocument.upsert({
      where: { key: docKey },
      update: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        data: file.buffer,
      },
      create: {
        key: docKey,
        fileName: file.originalname,
        mimeType: file.mimetype,
        data: file.buffer,
      },
      select: {
        id: true,
        key: true,
        fileName: true,
        mimeType: true,
        updatedAt: true,
      },
    });
    await this.invalidatePublicCache();
    return result;
  }

  async getPolicyDocument(key: string) {
    await this.bootstrapFromLegacyFile();
    const docKey = this.toPolicyDocumentKey(key);
    return this.prisma.policyDocument.findUnique({
      where: { key: docKey },
      select: {
        fileName: true,
        mimeType: true,
        data: true,
      },
    });
  }
}

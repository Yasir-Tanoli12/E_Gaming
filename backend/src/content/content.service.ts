import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UpdateContactsDto } from './dto/update-contacts.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

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
      this.prisma.blog.count(),
      this.prisma.faq.count(),
      this.prisma.review.count(),
    ]);

    if (
      legacy.contacts &&
      !contact.facebook &&
      !contact.whatsapp &&
      !contact.instagram &&
      !contact.email
    ) {
      await this.prisma.contact.update({
        where: { id: 'default' },
        data: {
          facebook: legacy.contacts.facebook ?? '',
          whatsapp: legacy.contacts.whatsapp ?? '',
          instagram: legacy.contacts.instagram ?? '',
          email: legacy.contacts.email ?? '',
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
    await this.bootstrapFromLegacyFile();
    const [contacts, blogs, faqs, reviews, privacyPolicy] =
      await this.prisma.$transaction([
        this.prisma.contact.findUnique({ where: { id: 'default' } }),
        this.prisma.blog.findMany({ orderBy: { createdAt: 'desc' } }),
        this.prisma.faq.findMany({ orderBy: { createdAt: 'desc' } }),
        this.prisma.review.findMany({
          where: { isFeatured: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.privacyPolicy.findUnique({ where: { id: 'default' } }),
      ]);

    return {
      contacts: contacts ?? {
        facebook: '',
        whatsapp: '',
        instagram: '',
        email: '',
      },
      blogs,
      faqs,
      reviews,
      privacyPolicy: privacyPolicy?.content ?? '',
    };
  }

  async getAdminContent() {
    await this.bootstrapFromLegacyFile();
    const [contacts, blogs, faqs, reviews, privacyPolicy] =
      await this.prisma.$transaction([
        this.prisma.contact.findUnique({ where: { id: 'default' } }),
        this.prisma.blog.findMany({ orderBy: { createdAt: 'desc' } }),
        this.prisma.faq.findMany({ orderBy: { createdAt: 'desc' } }),
        this.prisma.review.findMany({ orderBy: { createdAt: 'desc' } }),
        this.prisma.privacyPolicy.findUnique({ where: { id: 'default' } }),
      ]);

    return {
      contacts: contacts ?? {
        facebook: '',
        whatsapp: '',
        instagram: '',
        email: '',
      },
      blogs,
      faqs,
      reviews,
      privacyPolicy: privacyPolicy?.content ?? '',
    };
  }

  async updateContacts(dto: UpdateContactsDto) {
    await this.bootstrapFromLegacyFile();
    return this.prisma.contact.update({
      where: { id: 'default' },
      data: dto,
    });
  }

  async createBlog(dto: CreateBlogDto) {
    await this.bootstrapFromLegacyFile();
    return this.prisma.blog.create({
      data: {
        title: dto.title,
        excerpt: dto.excerpt ?? null,
        content: dto.content ?? null,
        imageUrl: dto.imageUrl ?? null,
      },
    });
  }

  async updateBlog(id: string, dto: UpdateBlogDto) {
    await this.bootstrapFromLegacyFile();
    return this.prisma.blog.update({
      where: { id },
      data: {
        title: dto.title,
        excerpt: dto.excerpt,
        content: dto.content,
        imageUrl: dto.imageUrl,
      },
    });
  }

  async removeBlog(id: string) {
    await this.bootstrapFromLegacyFile();
    await this.prisma.blog.delete({ where: { id } });
    return { removed: true };
  }

  async createFaq(dto: CreateFaqDto) {
    await this.bootstrapFromLegacyFile();
    return this.prisma.faq.create({
      data: {
        question: dto.question,
        answer: dto.answer,
      },
    });
  }

  async updateFaq(id: string, dto: UpdateFaqDto) {
    await this.bootstrapFromLegacyFile();
    return this.prisma.faq.update({
      where: { id },
      data: {
        question: dto.question,
        answer: dto.answer,
      },
    });
  }

  async removeFaq(id: string) {
    await this.bootstrapFromLegacyFile();
    await this.prisma.faq.delete({ where: { id } });
    return { removed: true };
  }

  async createReview(dto: CreateReviewDto) {
    await this.bootstrapFromLegacyFile();
    return this.prisma.review.create({
      data: {
        reviewer: dto.reviewer,
        message: dto.message,
        rating: dto.rating ?? 5,
        isFeatured: dto.isFeatured ?? true,
      },
    });
  }

  async updateReview(id: string, dto: UpdateReviewDto) {
    await this.bootstrapFromLegacyFile();
    return this.prisma.review.update({
      where: { id },
      data: {
        reviewer: dto.reviewer,
        message: dto.message,
        rating: dto.rating,
        isFeatured: dto.isFeatured,
      },
    });
  }

  async removeReview(id: string) {
    await this.bootstrapFromLegacyFile();
    await this.prisma.review.delete({ where: { id } });
    return { removed: true };
  }

  async updatePrivacyPolicy(dto: UpdatePrivacyPolicyDto, updatedBy?: string) {
    await this.bootstrapFromLegacyFile();
    return this.prisma.privacyPolicy.update({
      where: { id: 'default' },
      data: {
        content: dto.content,
        updatedBy: updatedBy ?? null,
      },
    });
  }
}

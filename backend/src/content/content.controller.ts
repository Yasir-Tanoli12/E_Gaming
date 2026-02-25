import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import type { Response } from 'express';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ContentService } from './content.service';
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

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get('public')
  getPublicContent() {
    return this.contentService.getPublicContent();
  }

  @Public()
  @Get('documents/:key')
  async getPolicyDocument(
    @Param('key') key: string,
    @Res() res: Response,
  ) {
    const document = await this.contentService.getPolicyDocument(key);
    if (!document) {
      throw new BadRequestException('Document not found');
    }
    res.setHeader('Content-Type', document.mimeType || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${document.fileName || `${key}.pdf`}"`,
    );
    return res.send(document.data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  getAdminContent() {
    return this.contentService.getAdminContent();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'branding');
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/svg+xml',
        ];
        cb(null, allowed.includes(file.mimetype));
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadLogo(
    @UploadedFile() file: { filename: string } | undefined,
    @Req() req: { protocol: string; get(name: string): string | undefined },
  ) {
    if (!file) {
      throw new BadRequestException('Only image files are allowed');
    }
    const host = req.get('host') ?? 'localhost:3001';
    const logoUrl = `${req.protocol}://${host}/uploads/branding/${file.filename}`;
    return this.contentService.updateLogo(logoUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('contacts')
  updateContacts(@Body() dto: UpdateContactsDto) {
    return this.contentService.updateContacts(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('blogs')
  createBlog(@Body() dto: CreateBlogDto) {
    return this.contentService.createBlog(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('blogs/:id')
  updateBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.contentService.updateBlog(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('blogs/:id')
  removeBlog(@Param('id') id: string) {
    return this.contentService.removeBlog(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('faqs')
  createFaq(@Body() dto: CreateFaqDto) {
    return this.contentService.createFaq(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('faqs/:id')
  updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.contentService.updateFaq(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('faqs/:id')
  removeFaq(@Param('id') id: string) {
    return this.contentService.removeFaq(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('reviews')
  createReview(@Body() dto: CreateReviewDto) {
    return this.contentService.createReview(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('reviews/:id')
  updateReview(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.contentService.updateReview(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('reviews/:id')
  removeReview(@Param('id') id: string) {
    return this.contentService.removeReview(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('documents/:key')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        cb(null, file.mimetype === 'application/pdf');
      },
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  uploadPolicyDocument(
    @Param('key') key: string,
    @UploadedFile()
    file:
      | { originalname: string; mimetype: string; buffer: Buffer }
      | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Only PDF files are allowed');
    }
    return this.contentService.upsertPolicyDocument(key, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('age-warning')
  updateAgeWarning(@Body() dto: UpdateAgeWarningDto) {
    return this.contentService.updateAgeWarning(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('about-us')
  updateAboutUs(
    @Body() dto: UpdateAboutUsDto,
    @Req() req: { user?: { email?: string } },
  ) {
    return this.contentService.updateAboutUs(dto, req.user?.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('privacy-policy')
  updatePrivacyPolicy(
    @Body() dto: UpdatePrivacyPolicyDto,
    @Req() req: { user?: { email?: string } },
  ) {
    return this.contentService.updatePrivacyPolicy(dto, req.user?.email);
  }

}

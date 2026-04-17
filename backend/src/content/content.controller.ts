import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import type { Request, Response } from 'express';
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
import { getPublicApiOrigin } from '../common/get-public-api-origin';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get('public')
  @Header('Cache-Control', 'public, max-age=60, s-maxage=120')
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

  @UseGuards(AdminAuthGuard)
  @Get('admin')
  getAdminContent() {
    return this.contentService.getAdminContent();
  }

  @UseGuards(AdminAuthGuard)
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
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('Only image files are allowed');
    }
    const origin = getPublicApiOrigin(req);
    const logoUrl = `${origin}/uploads/branding/${file.filename}`;
    return this.contentService.updateLogo(logoUrl);
  }

  @UseGuards(AdminAuthGuard)
  @Post('lobby-video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'lobby');
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
          'video/mp4',
          'video/webm',
          'video/ogg',
        ];
        cb(null, allowed.includes(file.mimetype));
      },
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async uploadLobbyVideo(
    @UploadedFile() file: { filename: string } | undefined,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('Only video files (MP4, WebM, OGG) are allowed');
    }
    const origin = getPublicApiOrigin(req);
    const videoUrl = `${origin}/uploads/lobby/${file.filename}`;
    return this.contentService.updateLobbyVideo(videoUrl);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('contacts')
  updateContacts(@Body() dto: UpdateContactsDto) {
    return this.contentService.updateContacts(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Post('blogs')
  createBlog(@Body() dto: CreateBlogDto) {
    return this.contentService.createBlog(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('blogs/:id')
  updateBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.contentService.updateBlog(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('blogs/:id')
  removeBlog(@Param('id') id: string) {
    return this.contentService.removeBlog(id);
  }

  @UseGuards(AdminAuthGuard)
  @Post('faqs')
  createFaq(@Body() dto: CreateFaqDto) {
    return this.contentService.createFaq(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('faqs/:id')
  updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.contentService.updateFaq(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('faqs/:id')
  removeFaq(@Param('id') id: string) {
    return this.contentService.removeFaq(id);
  }

  @UseGuards(AdminAuthGuard)
  @Post('reviews')
  createReview(@Body() dto: CreateReviewDto) {
    return this.contentService.createReview(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('reviews/:id')
  updateReview(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.contentService.updateReview(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('reviews/:id')
  removeReview(@Param('id') id: string) {
    return this.contentService.removeReview(id);
  }

  @UseGuards(AdminAuthGuard)
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

  @UseGuards(AdminAuthGuard)
  @Patch('age-warning')
  updateAgeWarning(@Body() dto: UpdateAgeWarningDto) {
    return this.contentService.updateAgeWarning(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('about-us')
  updateAboutUs(
    @Body() dto: UpdateAboutUsDto,
    @Req() req: { user?: { email?: string } },
  ) {
    return this.contentService.updateAboutUs(dto, req.user?.email);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('privacy-policy')
  updatePrivacyPolicy(
    @Body() dto: UpdatePrivacyPolicyDto,
    @Req() req: { user?: { email?: string } },
  ) {
    return this.contentService.updatePrivacyPolicy(dto, req.user?.email);
  }

}

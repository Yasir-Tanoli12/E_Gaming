import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Header,
  Logger,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { SetTopGamesDto } from './dto/set-top-games.dto';
import { Public } from '../auth/public.decorator';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { getUploadsFilesystemRoot } from '../common/uploads-filesystem-root';
import { MAX_UPLOAD_FILE_BYTES } from '../common/upload-limits';

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]);
const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const ALLOWED_VIDEO_EXTS = new Set(['.mp4', '.webm', '.ogg', '.mov']);

type UploadedMediaFile = {
  filename: string;
  originalname: string;
  size: number;
};

function isAllowedGameMedia(file: { mimetype: string; originalname: string }): boolean {
  const mime = (file.mimetype || '').toLowerCase().trim();
  const ext = extname(file.originalname || '').toLowerCase();
  if (ALLOWED_IMAGE_MIMES.has(mime) || ALLOWED_VIDEO_MIMES.has(mime)) return true;
  // Some clients send unknown/octet-stream for otherwise valid files; trust extension fallback.
  return ALLOWED_IMAGE_EXTS.has(ext) || ALLOWED_VIDEO_EXTS.has(ext);
}
@Controller('games')
export class GamesController {
  private readonly logger = new Logger(GamesController.name);

  constructor(private readonly gamesService: GamesService) {}

  @Public()
  @Get()
  @Header('Cache-Control', 'public, max-age=60, s-maxage=120')
  findAll() {
    return this.gamesService.findAll();
  }

  @Public()
  @Get('top')
  @Header('Cache-Control', 'public, max-age=60, s-maxage=120')
  findTopGames() {
    return this.gamesService.findTopGames();
  }

  @UseGuards(AdminAuthGuard)
  @Post('top-selection')
  setTopSelection(@Body() dto: SetTopGamesDto) {
    return this.gamesService.setTopGames(dto.ids ?? []);
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin')
  findAllAdmin() {
    return this.gamesService.findAllAdmin();
  }

  @UseGuards(AdminAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @Post('upload-media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(getUploadsFilesystemRoot(), 'games');
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
        cb(null, isAllowedGameMedia(file));
      },
      limits: { fileSize: MAX_UPLOAD_FILE_BYTES },
    }),
  )
  uploadMedia(@UploadedFile() file: UploadedMediaFile | undefined) {
    if (!file) {
      this.logger.warn(
        'upload-media: missing file (wrong field name, rejected type, or over size limit)',
      );
      throw new BadRequestException(
        'No file uploaded. Use image (.jpg/.png/.webp/.gif) or video (.mp4/.webm/.ogg/.mov), max 500MB.',
      );
    }
    this.logger.log(
      `upload-media ok: original=${file.originalname} bytes=${file.size} stored=${file.filename}`,
    );
    // Store relative paths so DB rows work with any public API host (see frontend resolveUploadMediaUrl).
    return {
      url: `/uploads/games/${file.filename}`,
    };
  }

  @UseGuards(AdminAuthGuard)
  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(id, updateGameDto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamesService.remove(id);
  }
}


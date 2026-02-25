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
  Req,
  Header,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { SetTopGamesDto } from './dto/set-top-games.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller('games')
export class GamesController {
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('top-selection')
  setTopSelection(@Body() dto: SetTopGamesDto) {
    return this.gamesService.setTopGames(dto.ids ?? []);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  findAllAdmin() {
    return this.gamesService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('upload-media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'games');
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
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ];
        cb(null, allowed.includes(file.mimetype));
      },
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  uploadMedia(
    @UploadedFile() file: { filename: string } | undefined,
    @Req() req: { protocol: string; get(name: string): string | undefined },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const host = req.get('host') ?? 'localhost:3001';
    return {
      url: `${req.protocol}://${host}/uploads/games/${file.filename}`,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(id, updateGameDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamesService.remove(id);
  }
}

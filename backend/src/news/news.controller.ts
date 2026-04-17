import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { Public } from '../auth/public.decorator';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get('current')
  @Header('Cache-Control', 'public, max-age=60, s-maxage=120')
  getCurrent() {
    return this.newsService.getCurrent();
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @UseGuards(AdminAuthGuard)
  @Post()
  create(@Body() dto: CreateNewsDto) {
    return this.newsService.create(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}

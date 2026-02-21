import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class NewsService {
  private filePath = join(process.cwd(), 'data', 'news-posters.json');

  private readAll(): Array<{
    id: string;
    title: string | null;
    imageUrl: string;
    linkUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }> {
    try {
      if (!existsSync(this.filePath)) return [];
      return JSON.parse(readFileSync(this.filePath, 'utf-8')) as Array<{
        id: string;
        title: string | null;
        imageUrl: string;
        linkUrl: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
    } catch {
      return [];
    }
  }

  private writeAll(items: unknown) {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
  }

  async getCurrent() {
    const items = this.readAll().filter((x) => x.isActive);
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  }

  async findAll() {
    return this.readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(dto: CreateNewsDto) {
    const items = this.readAll();
    const now = new Date().toISOString();
    const created = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      title: dto.title ?? null,
      imageUrl: dto.imageUrl,
      linkUrl: dto.linkUrl ?? null,
      isActive: dto.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    items.unshift(created);
    this.writeAll(items);
    return created;
  }

  async update(id: string, dto: UpdateNewsDto) {
    const items = this.readAll();
    const index = items.findIndex((x) => x.id === id);
    if (index < 0) throw new NotFoundException('News poster not found');
    items[index] = {
      ...items[index],
      title: dto.title ?? items[index].title,
      imageUrl: dto.imageUrl ?? items[index].imageUrl,
      linkUrl: dto.linkUrl ?? items[index].linkUrl,
      isActive: dto.isActive ?? items[index].isActive,
      updatedAt: new Date().toISOString(),
    };
    this.writeAll(items);
    return items[index];
  }

  async remove(id: string) {
    const items = this.readAll();
    const index = items.findIndex((x) => x.id === id);
    if (index < 0) throw new NotFoundException('News poster not found');
    const [removed] = items.splice(index, 1);
    this.writeAll(items);
    return removed;
  }
}

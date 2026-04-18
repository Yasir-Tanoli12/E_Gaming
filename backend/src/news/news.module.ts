import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  imports: [AdminModule],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}

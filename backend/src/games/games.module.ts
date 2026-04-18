import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';

@Module({
  imports: [AdminModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}

import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [AdminModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

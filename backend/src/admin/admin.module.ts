import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminOtpService } from './admin-otp.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [AdminController],
  providers: [AdminOtpService, AdminAuthGuard, RolesGuard],
  exports: [AdminOtpService, AdminAuthGuard],
})
export class AdminModule {}

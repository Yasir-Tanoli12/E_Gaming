import { Controller, Get, Param, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.usersService.updateRole(id, dto.role, req.user.id);
  }

  @Get('auth-logs')
  getAuthLogs() {
    return this.usersService.getAuthLogs();
  }

  @Get(':id/auth-logs')
  getUserAuthLogs(@Param('id') id: string) {
    return this.usersService.getAuthLogs(id);
  }
}

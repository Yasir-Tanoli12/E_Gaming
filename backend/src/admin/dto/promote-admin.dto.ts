import { IsEmail, IsNotEmpty } from 'class-validator';

export class PromoteAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

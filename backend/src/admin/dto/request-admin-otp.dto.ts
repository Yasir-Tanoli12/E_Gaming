import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestAdminOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

import { IsEmail } from 'class-validator';

export class AddAdminEmailDto {
  @IsEmail()
  email: string;
}

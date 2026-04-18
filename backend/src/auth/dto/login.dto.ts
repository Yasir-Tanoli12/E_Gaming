import { IsEmail, IsString, MinLength } from 'class-validator';
import { Trim } from '../../common/sanitize.decorator';

export class LoginDto {
  @Trim()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

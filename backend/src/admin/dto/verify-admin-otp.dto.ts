import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class VerifyAdminOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit code' })
  @IsNotEmpty()
  otp!: string;
}

import { IsOptional, IsString } from 'class-validator';

export class UpdateAgeWarningDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  enterButtonLabel?: string;

  @IsOptional()
  @IsString()
  exitButtonLabel?: string;

  @IsOptional()
  @IsString()
  exitUrl?: string;
}

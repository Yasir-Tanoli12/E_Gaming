import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/** From admin file upload: `/uploads/games/...` — keep support for legacy external URLs too. */
const UPLOAD_OR_HTTP_RE = /^(https?:\/\/\S+|\/uploads\/\S+)/i;

export class CreateNewsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @MaxLength(2048)
  @Matches(UPLOAD_OR_HTTP_RE, {
    message:
      'imageUrl must come from a file upload (/uploads/...) or be a full http(s) URL',
  })
  imageUrl: string;

  @IsOptional()
  isActive?: boolean;
}

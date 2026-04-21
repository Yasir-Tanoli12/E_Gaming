import {
  IsString,
  IsOptional,
  IsInt,
  IsUrl,
  Min,
  Matches,
  MaxLength,
} from 'class-validator';

/** From admin file upload: `/uploads/games/...` — not a full URL. Legacy rows may use https? URLs. */
const UPLOAD_OR_HTTP_RE =
  /^(https?:\/\/\S+|\/uploads\/\S+)/i;

export class CreateGameDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(UPLOAD_OR_HTTP_RE, {
    message:
      'thumbnailUrl must come from a file upload (/uploads/...) or be a full http(s) URL',
  })
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(UPLOAD_OR_HTTP_RE, {
    message:
      'videoUrl must come from a file upload (/uploads/...) or be a full http(s) URL',
  })
  videoUrl?: string;

  @IsString()
  @IsUrl({
    require_protocol: true,
    require_tld: false,
    protocols: ['http', 'https'],
  })
  gameLink: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;
}

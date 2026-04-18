import {
  IsString,
  IsOptional,
  IsUrl,
  IsInt,
  Min,
  Matches,
} from 'class-validator';

export class CreateGameDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
    require_tld: false,
  })
  thumbnailUrl?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
    require_tld: false,
  })
  videoUrl?: string;

  @IsString()
  @Matches(/^(?!https?:\/\/).+/i, {
    message: 'gameLink must be a local path, not an external URL',
  })
  gameLink: string; // Local route/path to game

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;
}

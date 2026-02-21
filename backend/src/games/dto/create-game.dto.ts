import { IsString, IsOptional, IsUrl, IsInt, Min } from 'class-validator';

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
  gameLink: string; // URL or path to game

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;

}

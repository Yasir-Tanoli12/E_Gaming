import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateNewsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsUrl({
    require_protocol: true,
    require_tld: false,
  })
  imageUrl: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
    require_tld: false,
  })
  linkUrl?: string;

  @IsOptional()
  isActive?: boolean;
}

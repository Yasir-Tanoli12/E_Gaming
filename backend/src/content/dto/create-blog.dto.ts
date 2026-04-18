import { IsOptional, IsString } from 'class-validator';
import { Trim } from '../../common/sanitize.decorator';

export class CreateBlogDto {
  @Trim()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

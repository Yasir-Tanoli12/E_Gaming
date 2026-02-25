import { IsString } from 'class-validator';

export class UpdateAboutUsDto {
  @IsString()
  content: string;
}

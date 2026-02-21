import { IsArray, IsString } from 'class-validator';

export class SetTopGamesDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

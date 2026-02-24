import { IsString } from 'class-validator';

export class UpdatePrivacyPolicyDto {
  @IsString()
  content: string;
}

import { IsOptional, IsString } from 'class-validator';

export class UpdateLegalDocumentsDto {
  @IsOptional()
  @IsString()
  privacyPolicyPdfUrl?: string;

  @IsOptional()
  @IsString()
  socialResponsibilityPdfUrl?: string;
}

import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

/**
 * DTO for refresh token endpoint.
 * Accepts refreshToken in body (fallback) - primary source is httpOnly cookie.
 */
export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  refreshToken?: string;
}

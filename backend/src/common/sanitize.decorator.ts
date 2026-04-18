import { Transform } from 'class-transformer';

/**
 * Trims string values - use on DTO string fields to prevent whitespace injection.
 */
export function Trim() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

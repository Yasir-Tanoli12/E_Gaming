import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Single process-wide Supabase clients (lazy). Service role must never be used in frontend code.
 */
@Injectable()
export class SupabaseService {
  private serviceRoleClient: SupabaseClient | null = null;
  private anonClient: SupabaseClient | null = null;

  constructor(private readonly config: ConfigService) {}

  /** True when URL + service role key are configured (admin / RLS bypass). */
  hasServiceRoleConfig(): boolean {
    const url = this.config.get<string>('SUPABASE_URL')?.trim();
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY')?.trim();
    return Boolean(url && key);
  }

  /** True when URL + anon key are configured (RLS-respecting server calls). */
  hasAnonConfig(): boolean {
    const url = this.config.get<string>('SUPABASE_URL')?.trim();
    const key = this.config.get<string>('SUPABASE_ANON_KEY')?.trim();
    return Boolean(url && key);
  }

  /**
   * Supabase client with the service role key. Bypasses Row Level Security — backend only.
   * @throws if SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing
   */
  getServiceRoleClient(): SupabaseClient {
    const url = this.config.get<string>('SUPABASE_URL')?.trim();
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY')?.trim();
    if (!url) {
      throw new Error(
        'SUPABASE_URL is not set. Add it to backend/.env for Supabase admin operations.',
      );
    }
    if (!key) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY is not set. Required for the service-role Supabase client.',
      );
    }
    if (!this.serviceRoleClient) {
      this.serviceRoleClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return this.serviceRoleClient;
  }

  /**
   * Supabase client with the anon key (same privileges as the browser). Respects RLS.
   * Use when the backend must call Supabase as a “public” client.
   * @throws if SUPABASE_URL or SUPABASE_ANON_KEY is missing
   */
  getAnonClient(): SupabaseClient {
    const url = this.config.get<string>('SUPABASE_URL')?.trim();
    const key = this.config.get<string>('SUPABASE_ANON_KEY')?.trim();
    if (!url) {
      throw new Error(
        'SUPABASE_URL is not set. Add it to backend/.env for Supabase operations.',
      );
    }
    if (!key) {
      throw new Error(
        'SUPABASE_ANON_KEY is not set. Required for the anon Supabase client on the server.',
      );
    }
    if (!this.anonClient) {
      this.anonClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return this.anonClient;
  }
}

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly retryablePrismaCodes = new Set(['P2024', 'P1001', 'P1017']);
  private readonly fatalPrismaCodes = new Set(['P1000', 'P1002', 'P1010']);
  private isConnected = false;
  private connectPromise: Promise<void> | null = null;
  private reconnectPromise: Promise<void> | null = null;

  constructor() {
    const logLevels: Array<'query' | 'warn' | 'error'> = ['warn', 'error'];
    if (process.env.PRISMA_LOG_QUERIES === 'true') {
      logLevels.push('query');
    }
    super({
      log: logLevels,
    });
  }

  private shouldFailFastOnConnectError(): boolean {
    return process.env.PRISMA_FAIL_FAST_ON_STARTUP !== 'false';
  }

  private getConnectErrorHint(error: unknown): string {
    const message =
      error instanceof Error ? error.message : String(error ?? 'Unknown error');
    if (message.includes('Tenant or user not found')) {
      return (
        'Supabase rejected the credentials. Verify Project Settings > Database, ' +
        'reset DB password if needed, and use the Session pooler URI (port 5432).'
      );
    }
    return 'Check DATABASE_URL and database availability.';
  }

  private getRetryConfig() {
    const maxRetries = Number(process.env.PRISMA_MAX_RETRIES ?? 2);
    const baseDelayMs = Number(process.env.PRISMA_RETRY_BASE_DELAY_MS ?? 250);
    const maxDelayMs = Number(process.env.PRISMA_RETRY_MAX_DELAY_MS ?? 2500);
    return {
      maxRetries: Number.isFinite(maxRetries) ? Math.max(0, maxRetries) : 2,
      baseDelayMs: Number.isFinite(baseDelayMs) ? Math.max(100, baseDelayMs) : 250,
      maxDelayMs: Number.isFinite(maxDelayMs) ? Math.max(500, maxDelayMs) : 2500,
    };
  }

  private isRetryableDatabaseError(error: unknown): boolean {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: string }).code ?? '')
        : '';
    if (this.fatalPrismaCodes.has(code)) {
      return false;
    }
    if (this.retryablePrismaCodes.has(code)) {
      return true;
    }

    const message =
      error instanceof Error ? error.message : String(error ?? '').toString();
    if (message.includes('Tenant or user not found')) {
      return false;
    }
    return (
      message.includes('Server has closed the connection') ||
      message.includes("Can't reach database server") ||
      message.includes('Connection terminated unexpectedly')
    );
  }

  private async connectOnce() {
    if (this.isConnected) return;
    if (!this.connectPromise) {
      this.connectPromise = this.$connect()
        .then(() => {
          this.isConnected = true;
          this.logger.log('Prisma connected successfully.');
        })
        .catch((error) => {
          const hint = this.getConnectErrorHint(error);
          this.logger.error(`Prisma connection failed. ${hint}`);
          throw error;
        })
        .finally(() => {
          this.connectPromise = null;
        });
    }
    await this.connectPromise;
  }

  private async reconnectClient() {
    if (this.reconnectPromise) {
      await this.reconnectPromise;
      return;
    }
    this.reconnectPromise = (async () => {
      try {
        await this.$disconnect();
      } catch {
        // Ignore disconnect errors during recovery.
      } finally {
        this.isConnected = false;
      }
      await this.connectOnce();
    })().finally(() => {
      this.reconnectPromise = null;
    });
    await this.reconnectPromise;
  }

  private getBackoffDelayMs(
    attempt: number,
    baseDelayMs: number,
    maxDelayMs: number,
  ): number {
    const expDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
    const jitter = Math.floor(Math.random() * Math.max(50, expDelay * 0.2));
    return Math.min(maxDelayMs, expDelay + jitter);
  }

  async withPoolRetry<T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    baseDelayMs?: number,
  ): Promise<T> {
    const config = this.getRetryConfig();
    const retries = maxRetries ?? config.maxRetries;
    const baseDelay = baseDelayMs ?? config.baseDelayMs;

    await this.connectOnce();

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        const code =
          typeof error === 'object' && error !== null && 'code' in error
            ? String((error as { code?: string }).code ?? 'UNKNOWN')
            : 'UNKNOWN';
        const isRetryable = this.isRetryableDatabaseError(error);
        if (!isRetryable || attempt >= retries) {
          this.logger.error(
            `Prisma query failed (code=${code}, retryable=${isRetryable}, attempt=${attempt + 1}/${retries + 1}).`,
          );
          throw error;
        }
        this.logger.warn(
          `Transient database error detected (code=${code}, attempt ${attempt + 1}/${retries + 1}). Retrying...`,
        );
        try {
          await this.reconnectClient();
        } catch {
          // Reconnect may fail while DB is down; backoff then retry.
        }
        const delay = this.getBackoffDelayMs(
          attempt,
          baseDelay,
          config.maxDelayMs,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('Prisma retry loop exited unexpectedly.');
  }

  async onModuleInit() {
    try {
      await this.connectOnce();
    } catch (error) {
      const hint = this.getConnectErrorHint(error);
      this.logger.error(`Prisma connection failed on startup. ${hint}`);

      if (this.shouldFailFastOnConnectError()) {
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.isConnected = false;
    this.logger.log('Prisma disconnected.');
  }
}

/* Simple env-gated logger for tests. Enable with DEBUG_E2E=1 */

export class Logger {
  private static isEnabled(): boolean {
    return process.env.DEBUG_E2E === '1' || process.env.DEBUG_E2E === 'true';
  }

  static info(message?: any, ...optionalParams: any[]): void {
    if (Logger.isEnabled()) {
      // eslint-disable-next-line no-console
      console.log('[INFO]', message, ...optionalParams);
    }
  }

  static warn(message?: any, ...optionalParams: any[]): void {
    if (Logger.isEnabled()) {
      // eslint-disable-next-line no-console
      console.warn('[WARN]', message, ...optionalParams);
    }
  }

  static error(message?: any, ...optionalParams: any[]): void {
    // Always print errors in test runs
    // eslint-disable-next-line no-console
    console.error('[ERROR]', message, ...optionalParams);
  }

  static debug(message?: any, ...optionalParams: any[]): void {
    if (Logger.isEnabled()) {
      // eslint-disable-next-line no-console
      console.debug('[DEBUG]', message, ...optionalParams);
    }
  }
}



export enum LogLevel {
  VERBOSE = 'VERBOSE',
  DEBUG = 'DEBUG',
  WARN = 'WARN',
  INFO = 'INFO',
  ERROR = 'ERROR',
  SILENT = 'SILENT',
}

/**
 *
 * set StoreGlobal.GLOBAL_LOG_LEVEL {VERBOSE, DEBUG, WARN, INFO, ERROR, SILENT}
 */
export default abstract class CoreLogger {
  private logLevel: LogLevel;

  constructor(logLevel?: LogLevel) {
    this.log = this.log.bind(this);
    this.error = this.error.bind(this);
    this.debug = this.debug.bind(this);
    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.verbose = this.verbose.bind(this);
    this.logLevel = logLevel ?? LogLevel.WARN;
  }

  abstract log(channel: string, ...ags: unknown[]): void;

  abstract debug(channel: string, ...ags: unknown[]): void;

  abstract info(channel: string, ...ags: unknown[]): void;

  abstract error(channel: string, ...ags: unknown[]): void;

  abstract warn(channel: string, ...ags: unknown[]): void;

  abstract verbose(channel: string, ...ags: unknown[]): void;

  setLogLevel(value: LogLevel | string) {
    switch (value) {
      case LogLevel.DEBUG:
      case LogLevel.WARN:
      case LogLevel.ERROR:
      case LogLevel.INFO:
      case LogLevel.VERBOSE:
      case LogLevel.SILENT:
        this.logLevel = value;
        break;
      default:
        this.error('LOGGER', 'INVALID LOG LEVEL');
    }
  }

  getLogLevel() {
    return this.logLevel;
  }

  isOnLevel(value: LogLevel): boolean {
    switch (value) {
      case LogLevel.VERBOSE:
        return this.logLevel === LogLevel.VERBOSE;

      case LogLevel.DEBUG:
        return (
          this.logLevel === LogLevel.VERBOSE || this.logLevel === LogLevel.DEBUG
        );

      case LogLevel.WARN:
        return (
          this.logLevel === LogLevel.VERBOSE ||
          this.logLevel === LogLevel.DEBUG ||
          this.logLevel === LogLevel.WARN
        );

      case LogLevel.INFO:
        return (
          this.logLevel === LogLevel.VERBOSE ||
          this.logLevel === LogLevel.DEBUG ||
          this.logLevel === LogLevel.WARN ||
          this.logLevel === LogLevel.INFO
        );

      case LogLevel.ERROR:
        return (
          this.logLevel === LogLevel.VERBOSE ||
          this.logLevel === LogLevel.DEBUG ||
          this.logLevel === LogLevel.WARN ||
          this.logLevel === LogLevel.INFO ||
          this.logLevel === LogLevel.ERROR
        );
      case LogLevel.SILENT:
      default:
        return false;
    }
  }
}

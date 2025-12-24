export enum LogLevel {
  VERBOSE,
  DEBUG,
  WARN,
  INFO,
  ERROR,
  SILENT,
}

/**
 * Abstract base class for logging implementations.
 *
 * The class manages a log level and provides a set of abstract methods that
 * concrete logger subclasses must implement. The log level can be set using a
 * string or a {@link LogLevel} value. Subclasses should respect the current
 * log level when emitting messages.
 * set StoreGlobal.GLOBAL_LOG_LEVEL {VERBOSE, DEBUG, WARN, INFO, ERROR, SILENT}
 * @abstract
 */
export default abstract class CoreLogger {
  private logLevel: LogLevel;

  constructor(logLevel?: string) {
    this.log = this.log.bind(this);
    this.error = this.error.bind(this);
    this.debug = this.debug.bind(this);
    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.verbose = this.verbose.bind(this);
    this.logLevel = logLevel
      ? CoreLogger.getLogLevelFromString(logLevel)
      : LogLevel.WARN;
  }

  abstract log(channel: string, ...ags: unknown[]): void;

  abstract debug(channel: string, ...ags: unknown[]): void;

  abstract info(channel: string, ...ags: unknown[]): void;

  abstract error(channel: string, ...ags: unknown[]): void;

  abstract warn(channel: string, ...ags: unknown[]): void;

  abstract verbose(channel: string, ...ags: unknown[]): void;

  static getLogLevelFromString(value: string): LogLevel {
    switch (value.toLowerCase()) {
      case 'verbose':
        return LogLevel.VERBOSE;
      case 'debug':
        return LogLevel.DEBUG;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'error':
        return LogLevel.ERROR;
      case 'silent':
        return LogLevel.SILENT;
      default:
        throw new Error(`Unknown log level: ${value}`);
    }
  }

  setLogLevel(value: string | LogLevel) {
    if (typeof value === 'string') {
      this.logLevel = CoreLogger.getLogLevelFromString(value);
      return;
    }
    this.logLevel = value;
  }

  getLogLevel() {
    return this.logLevel;
  }

  isOnLevel(value: LogLevel): boolean {
    return value >= this.logLevel;
  }
}

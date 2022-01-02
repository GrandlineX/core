import { IHaveLogger, ILogChanel } from '../lib';
import CoreLogger, { LogLevel } from './CoreLogger';
import CoreError from './CoreError';

export default class CoreLogChannel implements ILogChanel {
  protected channel: string;

  logger: CoreLogger | null;

  constructor(chanel: string, target: CoreLogger | IHaveLogger | null) {
    this.channel = chanel;
    if (target instanceof CoreLogger) {
      this.logger = target;
    } else if (target?.getLogger) {
      this.logger = target.getLogger();
    } else {
      this.logger = null;
    }
  }

  setLogger(logger: CoreLogger) {
    this.logger = logger;
  }

  log(...ags: unknown[]): void {
    if (this.logger && this.logger.isOnLevel(LogLevel.INFO)) {
      this.logger.log(this.channel, ags);
    }
  }

  debug(...ags: unknown[]): void {
    if (this.logger && this.logger.isOnLevel(LogLevel.DEBUG)) {
      this.logger.debug(this.channel, ags);
    }
  }

  info(...ags: unknown[]): void {
    if (this.logger && this.logger.isOnLevel(LogLevel.INFO)) {
      this.logger.info(this.channel, ags);
    }
  }

  error(...ags: unknown[]): void {
    if (this.logger && this.logger.isOnLevel(LogLevel.ERROR)) {
      this.logger.error(this.channel, ags);
    }
  }

  warn(...ags: unknown[]): void {
    if (this.logger && this.logger.isOnLevel(LogLevel.WARN)) {
      this.logger.warn(this.channel, ags);
    }
  }

  verbose(...ags: unknown[]): void {
    if (this.logger && this.logger.isOnLevel(LogLevel.VERBOSE)) {
      this.logger.verbose(this.channel, ags);
    }
  }

  lError(message: string): Error {
    return new CoreError(message, this);
  }
}

import { IHaveLogger, ILogChannel } from '../lib/index.js';
import CoreLogger, { LogLevel } from './CoreLogger.js';
import CoreError from './CoreError.js';

/**
 * Provides a channel‑specific wrapper around a {@link CoreLogger}.
 *
 * Each channel is identified by a string name.  The class forwards all
 * logging calls to an underlying {@link CoreLogger} instance if it
 * exists and if the desired log level is enabled.  If no logger is
 * attached, all logging methods become no‑ops.
 *
 * @implements {ILogChannel}
 */
export default class CoreLogChannel implements ILogChannel {
  logger: CoreLogger | null;

  protected channel: string;

  constructor(channel: string, target: CoreLogger | IHaveLogger | null) {
    this.channel = channel;
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
    if (this.logger?.isOnLevel(LogLevel.INFO)) {
      this.logger.log(this.channel, ags);
    }
  }

  debug(...ags: unknown[]): void {
    if (this.logger?.isOnLevel(LogLevel.DEBUG)) {
      this.logger.debug(this.channel, ags);
    }
  }

  info(...ags: unknown[]): void {
    if (this.logger?.isOnLevel(LogLevel.INFO)) {
      this.logger.info(this.channel, ags);
    }
  }

  error(...ags: unknown[]): void {
    if (this.logger?.isOnLevel(LogLevel.ERROR)) {
      this.logger.error(this.channel, ags);
    }
  }

  warn(...ags: unknown[]): void {
    if (this.logger?.isOnLevel(LogLevel.WARN)) {
      this.logger.warn(this.channel, ags);
    }
  }

  verbose(...ags: unknown[]): void {
    if (this.logger?.isOnLevel(LogLevel.VERBOSE)) {
      this.logger.verbose(this.channel, ags);
    }
  }

  lError(message: string): Error {
    return new CoreError(message, this);
  }

  getName(): string {
    return this.channel;
  }
}

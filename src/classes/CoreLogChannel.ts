import { IHaveLogger, ILogChanel } from '../lib';
import CoreLogger from './CoreLogger';

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
    this.logger?.log(this.channel, ags);
  }

  debug(...ags: unknown[]): void {
    this.logger?.debug(this.channel, ags);
  }

  info(...ags: unknown[]): void {
    this.logger?.info(this.channel, ags);
  }

  error(...ags: unknown[]): void {
    this.logger?.error(this.channel, ags);
  }

  warn(...ags: unknown[]): void {
    this.logger?.warn(this.channel, ags);
  }

  verbose(...ags: unknown[]): void {
    this.logger?.verbose(this.channel, ags);
  }
}

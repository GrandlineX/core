import { CoreLogChannel, LogLevel } from '../classes/index.js';
import { DefaultLogger } from '../modules/index.js';

export default class Log {
  private static logChannel: Map<string, CoreLogChannel> = new Map();

  private static logger = new DefaultLogger('VERBOSE');

  static setLogLevel(logLevel: LogLevel) {
    this.logger.setLogLevel(logLevel);
  }

  static e(channel: string) {
    if (this.logChannel.has(channel)) {
      return this.logChannel.get(channel)!;
    }
    this.logChannel.set(channel, new CoreLogChannel(channel, this.logger));
    return this.logChannel.get(channel)!;
  }
}

import CoreLogger from '../../classes/CoreLogger';
import { XUtil } from '../../utils';

export default class DefaultLogger extends CoreLogger {
  debug(channel: string, ...ags: unknown[]): void {
    console.log(this.format(channel, ags));
  }

  error(channel: string, ...ags: unknown[]): void {
    console.error(this.format(channel, ags));
  }

  info(channel: string, ...ags: unknown[]): void {
    console.log(this.format(channel, ags));
  }

  log(channel: string, ...ags: unknown[]): void {
    console.log(this.format(channel, ags));
  }

  verbose(channel: string, ...ags: unknown[]): void {
    console.warn(this.format(channel, ags));
  }

  warn(channel: string, ...ags: unknown[]): void {
    console.warn(this.format(channel, ags));
  }

  format(channel: string, ...args: unknown[]): string {
    return `[${XUtil.getTimeStamp()}](${channel}) ${args}`;
  }
}

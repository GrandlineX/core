import CoreLogger from '../../classes/CoreLogger';

export default class DefaultLogger extends CoreLogger {
  debug(channel: string, ...ags: unknown[]): void {
    console.log(`${channel} ${ags}`);
  }

  error(channel: string, ...ags: unknown[]): void {
    console.error(`${channel} ${ags}`);
  }

  info(channel: string, ...ags: unknown[]): void {
    console.log(`${channel} ${ags}`);
  }

  log(channel: string, ...ags: unknown[]): void {
    console.log(`${channel} ${ags}`);
  }

  verbose(channel: string, ...ags: unknown[]): void {
    console.warn(`${channel} ${ags}`);
  }

  warn(channel: string, ...ags: unknown[]): void {
    console.warn(`${channel} ${ags}`);
  }
}

export default abstract class CoreLogger {
  constructor() {
    this.log = this.log.bind(this);
    this.error = this.error.bind(this);
    this.debug = this.debug.bind(this);
    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.verbose = this.verbose.bind(this);
  }

  abstract log(channel: string, ...ags: unknown[]): void;

  abstract debug(channel: string, ...ags: unknown[]): void;

  abstract info(channel: string, ...ags: unknown[]): void;

  abstract error(channel: string, ...ags: unknown[]): void;

  abstract warn(channel: string, ...ags: unknown[]): void;

  abstract verbose(channel: string, ...ags: unknown[]): void;
}

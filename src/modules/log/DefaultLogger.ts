import CoreLogger from '../../classes/CoreLogger.js';
import { XUtil } from '../../utils/index.js';

export enum DC {
  'Reset' = '\x1b[0m',
  'Bright' = '\x1b[1m',
  'Dim' = '\x1b[2m',
  'Underscore' = '\x1b[4m',
  'FgBlack' = '\x1b[30m',
  'FgRed' = '\x1b[31m',
  'FgGreen' = '\x1b[32m',
  'FgYellow' = '\x1b[33m',
  'FgBlue' = '\x1b[34m',
  'FgMagenta' = '\x1b[35m',
  'FgCyan' = '\x1b[36m',
  'FgWhite' = '\x1b[37m',
  'BgBlack' = '\x1b[40m',
  'BgRed' = '\x1b[41m',
  'BgGreen' = '\x1b[42m',
  'BgYellow' = '\x1b[43m',
  'BgBlue' = '\x1b[44m',
  'BgMagenta' = '\x1b[45m',
  'BgCyan' = '\x1b[46m',
  'BgWhite' = '\x1b[47m',
}

export default class DefaultLogger extends CoreLogger {
  private noColor = false;

  private printObject = false;

  setNoColor(val: boolean) {
    this.noColor = val;
  }

  setPrintObject(val: boolean) {
    this.printObject = val;
  }

  logColor(args: DC[], msg: string) {
    if (args.length > 0 && !this.noColor) {
      console.log([...args, msg, DC.Reset].join(''));
    } else {
      console.log(msg);
    }
  }

  debug(channel: string, ...ags: unknown[]): void {
    this.logColor([DC.FgMagenta], this.format('D', channel, ags));
  }

  error(channel: string, ...ags: unknown[]): void {
    this.logColor([DC.FgRed], this.format('E', channel, ags));
  }

  info(channel: string, ...ags: unknown[]): void {
    this.logColor([DC.FgGreen], this.format('I', channel, ags));
  }

  log(channel: string, ...ags: unknown[]): void {
    this.logColor([], this.format('L', channel, ags));
  }

  verbose(channel: string, ...ags: unknown[]): void {
    this.logColor([DC.FgBlue], this.format('V', channel, ags));
  }

  warn(channel: string, ...ags: unknown[]): void {
    this.logColor([DC.BgYellow, DC.FgBlack], this.format('W', channel, ags));
  }

  private printArgs(...args: unknown[]) {
    if (!this.printObject) {
      return args;
    }
    return args
      .map((arg) => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg);
        }
        return arg;
      })
      .join(',');
  }

  private format(mode: string, channel: string, ...args: unknown[]): string {
    return `[${mode}][${XUtil.getTimeStamp()}](${channel}) ${this.printArgs(
      args
    )}`;
  }
}

import fs, { type WriteStream } from 'fs';
import * as path from 'path';
import CoreLogger from '../../classes/CoreLogger';
import type { ICoreKernel } from '../../lib';
import { DefaultLogger } from './DefaultLogger';
import { XUtil } from '../../utils';

export type AdvancedLoggerMode = 'string' | 'json';

export type AdvancedJsonLogMode = 'D' | 'E' | 'I' | 'L' | 'V' | 'W';
export type AdvancedJsonLog = {
  ts: string;
  mode: AdvancedJsonLogMode;
  channel: string;
  msg: unknown[];
};

function logReplacer(_: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function toJsonLine(data: Omit<AdvancedJsonLog, 'ts'>): string {
  try {
    return JSON.stringify({ ts: XUtil.getTimeStamp(), ...data }, logReplacer);
  } catch {
    return JSON.stringify({
      ts: XUtil.getTimeStamp(),
      ...data,
      msg: ['<unserializable>'],
    });
  }
}

export class AdvancedLogger extends CoreLogger {
  logPath: string;

  consoleLog: DefaultLogger;

  fileFormat: AdvancedLoggerMode;

  stream: WriteStream;

  private fileDisabled = false;

  constructor(
    kernel: ICoreKernel<any>,
    fileFormat: AdvancedLoggerMode = 'string',
    logLevel?: string,
  ) {
    super(logLevel);
    this.consoleLog = new DefaultLogger(logLevel);
    this.fileFormat = fileFormat;
    const store = kernel.getConfigStore();
    const lPath = store.get('GLOBAL_PATH_LOG');
    const basePath = lPath || store.get('GLOBAL_PATH_TEMP');
    if (!basePath) {
      throw new Error('No log path');
    }
    XUtil.createFolderIfNotExist(basePath);
    this.logPath = basePath;
    this.stream = fs.createWriteStream(path.join(basePath, 'main.log'), {
      flags: 'a',
    });
    // An unhandled 'error' on a stream is an uncaught exception - a full disk
    // must not take down the process, so fall back to console-only logging.
    this.stream.on('error', (e) => {
      this.fileDisabled = true;
      this.consoleLog.error('AdvancedLogger', 'log file write failed', e);
    });
  }

  private writeToFile(
    mode: AdvancedJsonLogMode,
    channel: string,
    ...args: unknown[]
  ) {
    if (this.fileDisabled) {
      return;
    }
    if (this.fileFormat === 'string') {
      this.stream.write(
        `${this.consoleLog.format(mode, channel, ...args)}\n`,
        'utf-8',
      );
    } else {
      this.stream.write(
        `${toJsonLine({ mode, channel, msg: args })}\n`,
        'utf-8',
      );
    }
  }

  debug(channel: string, ...ags: unknown[]): void {
    this.consoleLog.debug(channel, ...ags);
    this.writeToFile('D', channel, ...ags);
  }

  error(channel: string, ...ags: unknown[]): void {
    this.consoleLog.error(channel, ...ags);
    this.writeToFile('E', channel, ...ags);
  }

  info(channel: string, ...ags: unknown[]): void {
    this.consoleLog.info(channel, ...ags);
    this.writeToFile('I', channel, ...ags);
  }

  log(channel: string, ...ags: unknown[]): void {
    this.consoleLog.log(channel, ...ags);
    this.writeToFile('L', channel, ...ags);
  }

  verbose(channel: string, ...ags: unknown[]): void {
    this.consoleLog.verbose(channel, ...ags);
    this.writeToFile('V', channel, ...ags);
  }

  warn(channel: string, ...ags: unknown[]): void {
    this.consoleLog.warn(channel, ...ags);
    this.writeToFile('W', channel, ...ags);
  }
}

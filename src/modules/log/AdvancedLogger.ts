import fs, { type WriteStream } from 'fs';
import * as path from 'path';
import CoreLogger from '../../classes/CoreLogger';
import type { ICoreKernel } from '../../lib';
import { DefaultLogger, type DefaultLogMode } from './DefaultLogger';
import { XUtil } from '../../utils';

export type AdvancedLoggerMode = 'string' | 'json';

export type AdvancedLoggerOptions = {
  fileFormat?: AdvancedLoggerMode;
  logLevel?: string;
  /** Name of the active log file. Default: `main.log` */
  fileName?: string;
  /** Rotate once the active file passes this size in bytes. Default: 10 MiB */
  maxFileSize?: number;
  /** How many rotated files to keep (main.1.log … main.N.log). Default: 5 */
  maxFiles?: number;
};

export type AdvancedJsonLog = {
  ts: string;
  mode: DefaultLogMode;
  channel: string;
  msg: unknown[];
};

/** Hard cap on lines buffered while a rotation is in flight. */
const MAX_QUEUE = 10_000;

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

  private readonly fileName: string;

  private readonly maxFileSize: number;

  private readonly maxFiles: number;

  private size = 0;

  private fileDisabled = false;

  private rotating = false;

  private queue: string[] = [];

  constructor(
    kernel: ICoreKernel<any>,
    options: AdvancedLoggerMode | AdvancedLoggerOptions = 'string',
    logLevel?: string,
  ) {
    const opts: AdvancedLoggerOptions =
      typeof options === 'string' ? { fileFormat: options, logLevel } : options;

    super(opts.logLevel ?? logLevel);
    this.consoleLog = new DefaultLogger(opts.logLevel ?? logLevel);
    this.fileFormat = opts.fileFormat ?? 'string';
    this.fileName = opts.fileName ?? 'main.log';
    this.maxFileSize = opts.maxFileSize ?? 10 * 1024 * 1024;
    this.maxFiles = Math.max(1, opts.maxFiles ?? 5);

    const store = kernel.getConfigStore();
    const lPath = store.get('GLOBAL_PATH_LOG');
    const basePath = lPath || store.get('GLOBAL_PATH_TEMP');
    if (!basePath) {
      throw new Error('No log path');
    }
    XUtil.createFolderIfNotExist(basePath);
    this.logPath = basePath;

    this.stream = this.openStream();

    // A file left over from the last run counts towards the limit, otherwise a
    // process that restarts often would never rotate.
    if (this.size >= this.maxFileSize) {
      this.rotate();
    }
  }

  private activePath(): string {
    return path.join(this.logPath, this.fileName);
  }

  private rotatedPath(index: number): string {
    const ext = path.extname(this.fileName);
    const base = path.basename(this.fileName, ext);
    return path.join(this.logPath, `${base}.${index}${ext}`);
  }

  private openStream(): WriteStream {
    const target = this.activePath();
    try {
      this.size = fs.statSync(target).size;
    } catch {
      this.size = 0;
    }

    const stream = fs.createWriteStream(target, { flags: 'a' });
    // An unhandled 'error' on a stream is an uncaught exception - a full disk
    // must not take down the process, so fall back to console-only logging.
    stream.on('error', (e) => {
      this.fileDisabled = true;
      this.queue = [];
      this.consoleLog.error('AdvancedLogger', 'log file write failed', e);
    });
    this.stream = stream;
    return stream;
  }

  /**
   * main.4.log -> main.5.log, ... , main.log -> main.1.log
   * The oldest file is dropped.
   */
  private shiftFiles(): void {
    for (let i = this.maxFiles; i >= 1; i -= 1) {
      const src = this.rotatedPath(i);
      if (!fs.existsSync(src)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (i === this.maxFiles) {
        fs.unlinkSync(src);
      } else {
        fs.renameSync(src, this.rotatedPath(i + 1));
      }
    }
    if (fs.existsSync(this.activePath())) {
      fs.renameSync(this.activePath(), this.rotatedPath(1));
    }
  }

  private rotate(): void {
    if (this.rotating || this.fileDisabled) {
      return;
    }
    this.rotating = true;

    const old = this.stream;
    // end() flushes everything still queued in the stream before 'finish',
    // so no line is lost and no rename happens on a file with pending writes
    // (which would fail on Windows).
    old.end(() => {
      try {
        this.shiftFiles();
      } catch (e) {
        this.consoleLog.error('AdvancedLogger', 'log rotation failed', e);
      }

      try {
        this.openStream();
      } catch (e) {
        this.fileDisabled = true;
        this.consoleLog.error('AdvancedLogger', 'reopening log failed', e);
      }

      this.rotating = false;

      const pending = this.queue;
      this.queue = [];
      pending.forEach((line) => this.writeLine(line));
    });
  }

  private writeLine(line: string): void {
    if (this.fileDisabled) {
      return;
    }
    if (this.rotating) {
      if (this.queue.length < MAX_QUEUE) {
        this.queue.push(line);
      }
      return;
    }

    this.size += Buffer.byteLength(line, 'utf-8');
    this.stream.write(line, 'utf-8');

    if (this.size >= this.maxFileSize) {
      this.rotate();
    }
  }

  private writeToFile(
    mode: DefaultLogMode,
    channel: string,
    ...args: unknown[]
  ) {
    if (this.fileDisabled) {
      return;
    }
    const line =
      this.fileFormat === 'string'
        ? this.consoleLog.format(mode, channel, ...args)
        : toJsonLine({ mode, channel, msg: args });
    this.writeLine(`${line}\n`);
  }

  /** Force a rotation regardless of the current file size. */
  rotateNow(): void {
    this.rotate();
  }

  /** Flush and close the active stream, e.g. on kernel shutdown. */
  close(): Promise<void> {
    return new Promise((resolve) => {
      this.fileDisabled = true;
      this.queue = [];
      this.stream.end(() => resolve());
    });
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

import process from 'process';

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

function stripAnsi(input: string): string {
  // Remove ANSI escape sequences so padEnd uses visible text length.
  // eslint-disable-next-line no-control-regex
  return input.replace(/\x1b\[[0-9;]*m/g, '');
}

function color(enabled: boolean, code: string, text: string): string {
  if (!enabled) {
    return text;
  }
  return `\x1b[${code}m${text}\x1b[0m`;
}

/**
 * A terminal progress bar that shows a spinner, a colorized progress bar, the
 * percentage completed, elapsed time, estimated time of arrival (ETA), speed,
 * and optional informational text.
 *
 * The bar updates in place by writing carriage‑return characters to
 * `process.stdout`. When the progress reaches the target (`end`), a check
 * mark is displayed and the bar finishes on a new line.
 */
export default class ProgressBar {
  private maxLength = 0;

  private startMs: number;

  private cur: number;

  private end: number;

  private info: string | null = null;

  private readonly width = 36;

  private frameIndex = 0;

  private readonly frames = ['|', '/', '-', '\\'];

  private readonly unicodeFrames = [
    '⠋',
    '⠙',
    '⠹',
    '⠸',
    '⠼',
    '⠴',
    '⠦',
    '⠧',
    '⠇',
    '⠏',
  ];

  private readonly colorEnabled = Boolean(process.stdout.isTTY);

  constructor(end: number = 1) {
    this.startMs = Date.now();
    this.cur = 0;
    this.end = end;
  }

  reset(): void {
    this.startMs = Date.now();
    this.cur = 0;
    this.maxLength = 0;
    this.frameIndex = 0;
    this.info = null;
  }

  setEnd(end: number): void {
    this.end = end;
    this.update();
  }

  setInfo(info: string | null): void {
    this.info = info;
  }

  setState(cur: number, info?: string | null): void {
    this.cur = cur;
    if (info !== undefined) {
      this.info = info;
    }
    this.update();
  }

  done(): void {
    this.cur = this.end;
    const line = this.renderLine(true);
    process.stdout.write(`${line}\r\n`);
  }

  private renderLine(isDone: boolean): string {
    const safeEnd = this.end <= 0 ? 1 : this.end;
    const curClamped = clamp(this.cur, 0, safeEnd);
    const ratio = clamp(curClamped / safeEnd, 0, 1);
    const perc = ratio * 100;

    const elapsedMs = Date.now() - this.startMs;
    const etaMs = ratio > 0 ? elapsedMs / ratio - elapsedMs : 0;
    const speed = elapsedMs > 0 ? curClamped / (elapsedMs / 1000) : 0;

    const filled = Math.round(this.width * ratio);
    const empty = this.width - filled;

    const fillChar = this.colorEnabled ? '█' : '#';
    const emptyChar = this.colorEnabled ? '░' : '-';

    const donePart = fillChar.repeat(filled);
    const todoPart = emptyChar.repeat(empty);

    const bar = this.colorEnabled
      ? `${color(true, '32', donePart)}${color(true, '90', todoPart)}`
      : `${donePart}${todoPart}`;

    const spinnerFrames = this.colorEnabled ? this.unicodeFrames : this.frames;
    const frame = isDone
      ? '✓'
      : spinnerFrames[this.frameIndex % spinnerFrames.length];
    this.frameIndex += 1;

    const status = isDone
      ? color(this.colorEnabled, '32', 'Done')
      : color(this.colorEnabled, '36', 'Working');

    const timeText = `${formatDuration(elapsedMs)}/${formatDuration(etaMs)}`;
    const infoText = this.info ? ` ${this.info}` : '';

    let line = `${frame} ${status} [${bar}] ${perc.toFixed(1)}% (${timeText}) ${speed.toFixed(1)}/s${infoText}`;

    const visibleLen = stripAnsi(line).length;
    if (visibleLen > this.maxLength) {
      this.maxLength = visibleLen;
    }

    // Pad based on visible text length, not raw string length with ANSI.
    const padSpaces = Math.max(0, this.maxLength - visibleLen);
    line = `${line}${' '.repeat(padSpaces)}`;

    return line;
  }

  private update(): void {
    const line = this.renderLine(false);
    process.stdout.write(`${line}\r`);
  }
}

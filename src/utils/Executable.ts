import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { XExecResult } from './XUtil.js';

export type ExecutableOptions = SpawnOptionsWithoutStdio & {
  onStdOut?: (m: string) => void;
  onStdErr?: (m: string) => void;
};
export class Executable {
  cmd: string;

  options?: ExecutableOptions;

  constructor(cmd: string, options?: ExecutableOptions) {
    this.cmd = cmd;
    this.options = options;
  }

  async run(args?: string[]) {
    return new Promise<XExecResult>((resolve) => {
      const child = spawn(this.cmd, args, this.options);
      let stdout = '';
      let stderr = '';
      if (child.stdout) {
        child.stdout.on('data', (data) => {
          stdout += data;
          this.options?.onStdOut?.(data);
        });
      }
      if (child.stderr) {
        child.stderr.on('data', (data) => {
          stderr += data;
          this.options?.onStdErr?.(data);
        });
      }
      child.on('close', (code) => {
        const out: XExecResult = {
          exitCode: code,
          error: code !== 0,
          stdout,
          stderr,
        };
        resolve(out);
      });
    });
  }
}

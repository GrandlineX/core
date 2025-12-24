import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { XExecResult } from './XUtil.js';

export type ExecutableOptions = SpawnOptionsWithoutStdio & {
  onStdOut?: (m: string) => void;
  onStdErr?: (m: string) => void;
};

/**
 * Executes a shell command and streams its output.
 *
 * The {@link Executable} class uses Node.js's {@link child_process.spawn} to run
 * a given command. It collects the standard output and error streams,
 * optionally forwards the data through callbacks provided in the options
 * object, and resolves a promise once the child process exits.
 *
 * @class
 */
export class Executable {
  cmd: string;

  options?: ExecutableOptions;

  constructor(cmd: string, options?: ExecutableOptions) {
    this.cmd = cmd;
    this.options = options;
  }

  /**
   * Executes the command specified by {@link cmd} with optional arguments and options.
   *
   * @param {string[]} [args] - Optional array of arguments to pass to the command.
   * @returns {Promise<XExecResult>} A promise that resolves when the child process exits. The resolved value includes the exit code, a boolean indicating whether an error occurred, and the collected `stdout` and `stderr` output.
   */
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

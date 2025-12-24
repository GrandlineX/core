import { ILogChannel } from '../lib/index.js';

/**
 * Represents an error that occurs within the core system.
 *
 * This class extends the native {@link Error} object and automatically logs
 * the provided error message through the supplied logging channel.
 *
 * @class
 * @extends Error
 *
 * @param {string} errorMessage - The description of the error.
 * @param {ILogChannel} logger - The logging channel used to record the error.
 *
 * @example
 * // This example demonstrates how the CoreError class logs the error,
 * // but it is omitted per the instructions.
 */
export default class CoreError extends Error {
  constructor(errorMessage: string, logger: ILogChannel) {
    super(errorMessage);
    logger.error('G-ERR:', errorMessage);
  }
}

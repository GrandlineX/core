import { ILogChannel } from '../lib/index.js';

/**
 * Error that's logs error message to the current log channel
 */
export default class CoreError extends Error {
  constructor(errorMessage: string, logger: ILogChannel) {
    super(errorMessage);
    logger.error('G-ERR:', errorMessage);
  }
}

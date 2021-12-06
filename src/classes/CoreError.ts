import { ILogChanel } from '../lib';

/**
 * Error that's logs error message to the current log chanel
 */
export default class CoreError extends Error {
  constructor(errorMessage: string, logger: ILogChanel) {
    super(errorMessage);
    logger.error('G-ERR:', errorMessage);
  }
}

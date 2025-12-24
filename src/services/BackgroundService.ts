import CoreLoopService from '../classes/CoreLoopService.js';
import { ICoreKernelModule } from '../lib/index.js';

/**
 * A service that performs background tasks on a periodic schedule.
 *
 * This service extends {@link CoreLoopService} and automatically triggers its
 * {@link loop} method every 120 000 milliseconds (2 minutes).  The {@link loop}
 * implementation simply delegates to the base class's {@link CoreLoopService#next}
 * routine, ensuring that any queued background work is processed.
 *
 * @class
 * @extends CoreLoopService
 *
 * @param {ICoreKernelModule<any, any, any, any, any>} module
 *        The kernel module instance that the service will operate within.
 */
export default class BackgroundService extends CoreLoopService {
  constructor(module: ICoreKernelModule<any, any, any, any, any>) {
    super('background-service', 120000, module);
    this.loop = this.loop.bind(this);
  }

  async loop() {
    await this.next();
  }
}

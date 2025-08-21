import CoreLoopService from '../classes/CoreLoopService.js';
import { ICoreKernelModule } from '../lib/index.js';

export default class BackgroundService extends CoreLoopService {
  constructor(module: ICoreKernelModule<any, any, any, any, any>) {
    super('background-service', 120000, module);
    this.loop = this.loop.bind(this);
  }

  async loop() {
    await this.next();
  }
}

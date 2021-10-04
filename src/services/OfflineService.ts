import dns = require('dns');
import CoreLoopService from '../classes/CoreLoopService';
import { ICoreKernelModule } from '../lib';

export default class OfflineService extends CoreLoopService {
  constructor(module: ICoreKernelModule<any, any, any, any, any>) {
    super('offlineService', 60000, module);
    this.loop = this.loop.bind(this);
  }

  async loop() {
    const a = !(await this.checkInternet());
    this.getKernel().setOffline(a);
    this.debug(a);
    await this.next();
  }

  checkInternet(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      dns.lookup('google.com', (err) => {
        if (err && err.code === 'ENOTFOUND') {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}

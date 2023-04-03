import dns from 'dns';
import CoreLoopService from '../classes/CoreLoopService';
import { ICoreKernelModule } from '../lib';

export default class OfflineService extends CoreLoopService {
  constructor(module: ICoreKernelModule<any, any, any, any, any>) {
    super('offlineService', 120000, module);
    this.loop = this.loop.bind(this);
  }

  static checkInternet(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      dns.lookup('google.com', (err) => {
        if (err && err.code === 'ENOTFOUND') {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async loop() {
    const a = !(await OfflineService.checkInternet());
    this.getKernel().setOffline(a);
    this.verbose(a);
    await this.next();
  }
}

import { CoreDBCon, CoreKernelModule } from './classes';
import { InMemCache } from './modules';
import { OfflineService } from './services';
import { ICoreKernel } from './lib';
import CoreDb from './database/CoreDb';

export default class CoreModule extends CoreKernelModule<
  ICoreKernel<any>,
  CoreDb,
  null,
  InMemCache,
  null
> {
  cdb: CoreDBCon<any, any>;

  /**
   * @param kernel
   * @param dbFunc
   */
  constructor(
    kernel: ICoreKernel<any>,
    dbFunc: (mod: CoreModule) => CoreDBCon<any, any>
  ) {
    super('kernel', kernel);
    this.addService(new OfflineService(this));
    this.cdb = dbFunc(this);
  }

  async initModule(): Promise<void> {
    this.setCache(new InMemCache(this, 480000));

    const db = new CoreDb(this.cdb);
    db.setEntityCache(true);

    this.setDb(db);

    await this.getKernel().triggerFunction('load');
  }
}

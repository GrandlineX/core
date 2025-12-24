import { CoreDBCon, CoreKernelModule } from './classes/index.js';
import { InMemCache } from './modules/index.js';
import { BackgroundService } from './services/index.js';
import { ICoreKernel, ICoreModule } from './lib/index.js';
import CoreDb from './database/CoreDb.js';

/**
 * CoreModule is the primary module that orchestrates the core services of the application.
 * It extends {@link CoreKernelModule} with specific type parameters and implements {@link ICoreModule}.
 * The module is responsible for initializing the core database, setting up an in-memory cache,
 * and registering essential background services.
 *
 * @extends CoreKernelModule<ICoreKernel<any>, CoreDb, null, InMemCache, null>
 * @implements ICoreModule
 */
export default class CoreModule
  extends CoreKernelModule<ICoreKernel<any>, CoreDb, null, InMemCache, null>
  implements ICoreModule
{
  cdb: CoreDBCon<any, any>;

  /**
   * @param kernel
   * @param dbFunc
   */
  constructor(
    kernel: ICoreKernel<any>,
    dbFunc: (mod: CoreModule) => CoreDBCon<any, any>,
  ) {
    super('core', kernel);
    this.addService(new BackgroundService(this));
    this.cdb = dbFunc(this);
  }

  async initModule(): Promise<void> {
    this.setCache(new InMemCache(this, 480000));

    const db = new CoreDb(this.cdb);
    db.setEntityCache(true);

    this.setDb(db);
  }
}

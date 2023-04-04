import {
  CoreBundleModule,
  CoreCache,
  CoreClient,
  CoreDBCon,
  CoreDBPrefab,
  CorePresenter,
} from '../../classes/index.js';
import { CoreCryptoClient, InMemCache, InMemDB } from '../../modules/index.js';
import { OfflineService } from '../../services/index.js';
import TestClient from './client/TestClient.js';
import TestAction from './action/TestAction.js';
import TestPresenter from './client/TestPresenter.js';
import TestPrefab from './db/TestPrefab.js';
import CoreKernel from '../../CoreKernel.js';
import TestTriggerService from './service/TestTriggerService.js';

export type TestFc = (mod: TestModule) => TestInterface;
export type TestInterface = {
  db?: CoreDBCon<any, any>;
  cache?: CoreCache | null;
  presenter?: CorePresenter<any>;
  client?: CoreClient;
};
export default class TestModule extends CoreBundleModule<
  CoreKernel<CoreCryptoClient>,
  CoreDBPrefab<any>,
  TestClient,
  CoreCache,
  TestPresenter
> {
  testInterface: TestInterface | null;

  constructor(kernel: CoreKernel<CoreCryptoClient>, init?: TestFc) {
    super('testModule', kernel);
    this.addAction(new TestAction(this));
    this.addService(new OfflineService(this), new TestTriggerService(this));
    if (init) {
      this.testInterface = init(this);
    } else {
      this.testInterface = null;
    }
  }

  async initModule(): Promise<void> {
    this.setClient(this.testInterface?.client || new TestClient('testc', this));
    this.setPresenter(this.testInterface?.presenter || new TestPresenter(this));
    this.debug('FirstTHIS');
    this.setCache(this.testInterface?.cache || new InMemCache(this, 10000));
    const db = new TestPrefab(this.testInterface?.db || new InMemDB(this));
    db.setEntityCache(this.testInterface?.cache !== null);
    this.setDb(db);
    await this.initBundleModule();
    await this.getKernel().triggerFunction('load');
  }

  async initBundleModule(): Promise<void> {
    this.debug('triggerBundleInit');
  }
}

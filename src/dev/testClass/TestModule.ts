import {
  CoreBundleModule,
  CoreCache,
  CoreClient,
  CoreDBCon,
  CoreDBPrefab,
  CorePresenter,
} from '../../classes';
import { InMemCache, InMemDB } from '../../modules';
import { OfflineService } from '../../services';
import TestClient from './client/TestClient';
import TestAction from './action/TestAction';
import TestPresenter from './client/TestPresenter';
import { TCoreKernel } from './TestBaseMod';
import TestPrefab from './db/TestPrefab';

export type TestInterface = {
  db?: CoreDBCon<any, any>;
  cache?: CoreCache | null;
  presenter?: CorePresenter<any>;
  client?: CoreClient;
};
export default class TestModule extends CoreBundleModule<
  TCoreKernel,
  CoreDBPrefab<any>,
  TestClient,
  CoreCache,
  TestPresenter
> {
  testInterface: TestInterface | null;

  constructor(kernel: TCoreKernel, init?: (mod: TestModule) => TestInterface) {
    super('testModule', kernel);
    this.addAction(new TestAction(this));
    this.addService(new OfflineService(this));
    if (init) {
      this.testInterface = init(this);
    } else {
      this.testInterface = null;
    }
  }

  async initModule(): Promise<void> {
    this.setClient(this.testInterface?.client || new TestClient('testc', this));
    this.setPresenter(this.testInterface?.presenter || new TestPresenter(this));
    this.log('FirstTHIS');
    this.setCache(this.testInterface?.cache || new InMemCache(this, 10000));
    const db = new TestPrefab(this.testInterface?.db || new InMemDB(this));
    db.setEntityCache(this.testInterface?.cache !== null);
    this.setDb(db);
    await this.initBundleModule();
    await this.getKernel().triggerFunction('load');
  }

  async initBundleModule(): Promise<void> {
    this.log('triggerBundleInit');
  }
}

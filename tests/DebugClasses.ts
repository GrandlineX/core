import {
  CoreKernel,
  Column,
  CoreClient,
  CoreCryptoClient,
  CoreKernelModule,
  CoreLoopService,
  EntityRelation,
  Entity,
  EProperties,
  EPropertiesOpt,
  ICoreCClient,
  InMemCache,
  CoreDBCon,
  CoreDBPrefab,
  CoreBundleModule,
  CoreEntity,
  OfflineService,
  InMemDB,
  CoreDBUpdate,
  sleep,
  ICoreAnyModule,
  CoreAction,
} from '../src';
import CorePresenter from '../src/classes/CorePresenter';

type TCoreKernel = CoreKernel<ICoreCClient>;

class TestBaseMod extends CoreKernelModule<
  TCoreKernel,
  InMemDB,
  null,
  null,
  null
> {
  beforeServiceStart(): Promise<void> {
    return Promise.resolve(undefined);
  }

  final(): Promise<void> {
    return Promise.resolve(undefined);
  }

  initModule(): Promise<void> {
    this.setDb(new InMemDB(this));
    return Promise.resolve(undefined);
  }

  startup(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
class TestPresenter extends CorePresenter<null> {
  constructor(module: ICoreAnyModule) {
    super('test-presenter', module);
  }

  getApp(): null {
    return null;
  }

  start(): Promise<boolean> {
    return Promise.resolve(true);
  }

  stop(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
class TestKernel extends CoreKernel<ICoreCClient> {
  constructor(appName: string, appCode: string, testPath: string) {
    super({ appName, appCode, pathOverride: testPath, envFilePath: __dirname });
    this.setBaseModule(new TestBaseMod('testbase2', this));
    this.setCryptoClient(
      new CoreCryptoClient(CoreCryptoClient.fromPW('testpw'))
    );
    this.addModule(new TestModule(this));
    this.addModule(new BridgeTestModule(this));
    this.setTriggerFunction('pre', async () => {});
    this.setTriggerFunction('start', async () => {});
    this.setTriggerFunction('stop', async () => {});
    this.setTriggerFunction('load', async () => {});
  }
}
class TestService extends CoreLoopService {
  async loop(): Promise<void> {
    await sleep(2000);
    await this.next();
  }
}
class TestClient extends CoreClient {}
class TestDBUpdate01 extends CoreDBUpdate<any, any> {
  constructor(db: CoreDBCon<any, any>) {
    super('0', '1', db);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    if (await db.configExist('dbversion')) {
      await db.removeConfig('dbversion');
    }
    await db.setConfig('dbversion', '1');
    return true;
  }
}
class TestDBUpdate02 extends CoreDBUpdate<any, any> {
  constructor(db: CoreDBCon<any, any>) {
    super('1', '2', db);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    if (await db.configExist('dbversion')) {
      await db.removeConfig('dbversion');
    }
    await db.setConfig('dbversion', '2');
    return true;
  }
}

@Entity('TestEnt')
class TestEnt extends CoreEntity {
  @Column({
    dataType: 'int',
  })
  testProp: number;

  constructor(prop?: EProperties<TestEnt>) {
    super();
    this.testProp = prop?.testProp || 0;
  }
}

class BadEntity extends CoreEntity {
  constructor() {
    super();
  }
}

@Entity('TestEntity', 1)
class TestEntity extends CoreEntity {
  @Column({
    canBeNull: true,
    dataType: 'text',
  })
  name: string | null;

  @Column({
    dataType: 'int',
  })
  simpleNumber: number;

  @Column({
    canBeNull: true,
    dataType: 'json',
  })
  missingType: any;

  @Column({
    canBeNull: true,
    primaryKey: true,
    dataType: 'float',
  })
  primaryKeyNull: any;

  @Column({
    canBeNull: true,
    dataType: 'float',
    foreignKey: {
      key: 'id',
      relation: 'test_entity',
    },
  })
  invalidKey: any;

  @Column({
    canBeNull: true,
    dataType: 'float',
    foreignKey: { ...EntityRelation('TestEntity'), schema: 'noSchema' },
  })
  autoRelation: number;

  notAColumn: string;

  constructor(val?: EPropertiesOpt<TestEntity>) {
    super();
    this.name = val?.name || '';
    this.notAColumn = val?.notAColumn || '';
    this.simpleNumber = val?.simpleNumber || 0;
    this.primaryKeyNull = null;
    this.invalidKey = null;
    this.autoRelation = val?.autoRelation || -1;
  }
}

class TestPrefab extends CoreDBPrefab<CoreDBCon<any, any>> {
  constructor(db: CoreDBCon<any, any>) {
    super(db);
    db.setEntityCache(true);
    db.registerEntity(new TestEnt());
    db.setUpdateChain(new TestDBUpdate01(db), new TestDBUpdate02(db));
  }

  async initPrefabDB(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

class TestAction extends CoreAction {
  constructor(mod: ICoreAnyModule) {
    super('test-action', mod);
  }

  register(): void {}
}
class TestModule extends CoreBundleModule<
  TCoreKernel,
  CoreDBPrefab<any>,
  TestClient,
  InMemCache,
  TestPresenter
> {
  constructor(kernel: TCoreKernel) {
    super('testModule', kernel);
    this.addAction(new TestAction(this));
    this.addService(new OfflineService(this));
  }

  async initModule(): Promise<void> {
    this.setClient(new TestClient('testc', this));
    this.setPresenter(new TestPresenter(this));
    this.log('FirstTHIS');
    this.setCache(new InMemCache(this, 10000));
    const db = new TestPrefab(new InMemDB(this));
    db.setEntityCache(true);
    this.setDb(db);
    await this.initBundleModule();
    await this.getKernel().triggerFunction('load');
  }

  async initBundleModule(): Promise<void> {
    this.log('triggerBundleInit');
  }
}
class BridgeTestModule extends CoreKernelModule<
  TCoreKernel,
  null,
  null,
  null,
  null
> {
  constructor(kernel: TCoreKernel) {
    super('bridgeModule', kernel, 'testModule');
  }

  initModule(): Promise<void> {
    this.log('LaterTHIS');
    return Promise.resolve(undefined);
  }

  startup(): Promise<void> {
    return Promise.resolve(undefined);
  }

  beforeServiceStart(): Promise<void> {
    return Promise.resolve(undefined);
  }

  final(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export {
  TCoreKernel,
  TestBaseMod,
  TestKernel,
  TestService,
  TestClient,
  TestDBUpdate01,
  TestDBUpdate02,
  TestEntity,
  TestEnt,
  BadEntity,
  TestModule,
  BridgeTestModule,
};

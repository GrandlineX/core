import CoreKernel, {
  CoreClient,
  CoreCryptoClient,
  CoreKernelModule,
  CoreLoopService,
  ICoreCClient, OfflineService,
  sleep
} from '../src';
import InMemDB from '../src/modules/db/InMemDB';
import CoreDBUpdate from '../src/classes/CoreDBUpdate';
import CoreDBCon from '../src/classes/CoreDBCon';
import CoreEntity from '../src/classes/CoreEntity';

type TCoreKernel=CoreKernel<ICoreCClient>;

class TestBaseMod extends CoreKernelModule<TCoreKernel,InMemDB,null,null,null> {
  beforeServiceStart(): Promise<void> {
    return Promise.resolve( undefined );
  }

  final(): Promise<void> {
    return Promise.resolve( undefined );
  }

  initModule(): Promise<void> {
    this.setDb(new InMemDB(this))
    return Promise.resolve( undefined );
  }

  startup(): Promise<void> {
    return Promise.resolve( undefined );
  }

}
class TestKernel extends CoreKernel<ICoreCClient> {
  constructor(appName:string, appCode:string,testPath:string) {
    super( { appName, appCode, pathOverride:testPath,envFilePath:__dirname });
    this.setBaseModule(new TestBaseMod("testbase2",this));
    this.setCryptoClient(new CoreCryptoClient(CoreCryptoClient.fromPW("testpw")))
    this.addModule(new TestModule(this));
    this.addModule(new BridgeTestModule(this));
  }
}





class TestService extends CoreLoopService{
  async loop(): Promise<void> {

    await sleep(2000)
    await this.next()
  }
}



class TestClient extends CoreClient{

}





class TestDBUpdate extends CoreDBUpdate<any,any>{
  constructor(db:CoreDBCon<any,any>) {
    super("0","1",db);
  }
  async performe(): Promise<boolean> {
    const db=this.getDb();

    await db.setConfig("dbversion","1")
    return true;
  }

}
class TestEntity extends CoreEntity{
  constructor() {
    super(0);
  }
}
class TestModule extends CoreKernelModule<TCoreKernel,InMemDB,TestClient,null,null>{
  constructor(kernel:TCoreKernel) {
    super("testModule",kernel);
    this.addService(new OfflineService(this))
  }
  async initModule(): Promise<void> {
    this.setClient(new TestClient("testc",this))
    this.log("FirstTHIS")
    const db=new InMemDB(this)
    db.registerEntity(new TestEntity())
    this.setDb(db)
    db.setUpdateChain(new TestDBUpdate(this.getDb() as CoreDBCon<any,any>))
  }

  startup(): Promise<void> {
    return Promise.resolve( undefined );
  }

  beforeServiceStart(): Promise<void> {
    return Promise.resolve( undefined );
  }

  final(): Promise<void> {
    return Promise.resolve( undefined );
  }

}
class BridgeTestModule extends CoreKernelModule<TCoreKernel,null,TestClient,null, null>{
  constructor(kernel:TCoreKernel) {
    super("bridgeModule",kernel,"testModule");
  }
  initModule(): Promise<void> {
    this.log("LaterTHIS")
    return Promise.resolve( undefined );
  }

  startup(): Promise<void> {
    return Promise.resolve( undefined );
  }

  beforeServiceStart(): Promise<void> {
    return Promise.resolve( undefined );
  }

  final(): Promise<void> {
    return Promise.resolve( undefined );
  }

}

export {
  TCoreKernel,
  TestBaseMod,
  TestKernel,
  TestService,
  TestClient,
  TestDBUpdate,
  TestEntity,
  TestModule,
  BridgeTestModule,
}

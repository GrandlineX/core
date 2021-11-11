import {

  CoreKernelModule,
  CoreLoopService, ICoreKernelModule,
  sleep, CoreClient, CoreCryptoClient, ICoreCClient, RawQuery, ConfigType, createFolderIfNotExist
} from '../src';
 import * as Path from 'path';
import CoreKernel from '../src/CoreKernel';
import CoreDBCon from '../src/classes/CoreDBCon';
import CoreDBUpdate from '../src/classes/CoreDBUpdate';
import InMemDB from '../src/modules/db/InMemDB';


const appName = 'TestKernel';
const appCode = 'tkernel';
const msiPath = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');


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
      super( { appName, appCode, pathOverride:testPath });
      this.setBaseModule(new TestBaseMod("testbase2",this));
      this.setCryptoClient(new CoreCryptoClient(CoreCryptoClient.fromPW("testpw")))
      this.addModule(new TestModuel(this));
      this.addModule(new BridgeTestModule(this));
    }
}

function testKernelUtil() {
   return  new TestKernel(appName, appCode, testPath);
}



class TestServie extends CoreLoopService{
  async loop(): Promise<void> {

    await sleep(2000)
    await this.next()
  }
}



class TestClient extends CoreClient{

}





class TestDBUpdate extends CoreDBUpdate<any>{
  constructor(db:CoreDBCon<any>) {
    super("0","1",db);
  }
  async performe(): Promise<boolean> {
    const db=this.getDb();

    await db.setConfig("dbversion","1")
    return true;
  }

}
class TestModuel extends CoreKernelModule<TCoreKernel,InMemDB,TestClient,null,null>{
  constructor(kernel:TCoreKernel) {
    super("testModule",kernel);
  }
  async initModule(): Promise<void> {
    this.setClient(new TestClient("testc",this))
    this.log("FirstTHIS")
    const db=new InMemDB(this)
    this.setDb(db)
    db.setUpdateChain(new TestDBUpdate(this.getDb() as CoreDBCon<any>))
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

 createFolderIfNotExist(msiPath);
 createFolderIfNotExist(testPath);


 let kernel = testKernelUtil();

const testText = 'hello_world';

describe('Clean Startup', () => {
   test('definePreload', async () => {
    expect(kernel.getState()).toBe('init');
  });
  test('start kernel', async () => {
    const result = await kernel.start();
    expect(result).toBe(true);
    expect(kernel.getModuleList()).toHaveLength(2);
    expect(kernel.getState()).toBe('running');
  });

  test('get db version', async () => {
    expect(kernel.getState()).toBe('running');
    const db = kernel.getDb();
    const conf = await db?.getConfig('dbversion');
    expect(conf?.c_value).not.toBeNull();
  });

  test('get testdb version', async () => {
    const db = kernel.getModuleList()[0].getDb();
    const conf = await db?.getConfig('dbversion');
    expect(conf?.c_value).not.toBeNull();
  });


  test('test bridge', async () => {
    const mod = kernel.getModuleList()[1];

    expect(mod.getBridgeModule("testModule")).not.toBeUndefined();
  });


  test('db function', async () => {
    expect(kernel.getState()).toBe('running');
    const db = kernel.getDb();
    const conf = await db?.setConfig(testText, testText);
    expect(conf).toBeTruthy();
    const res = await db?.getConfig(testText);
    expect(res?.c_value).toBe(testText);
    db?.removeConfig(testText);
    const res2 = await db?.getConfig(testText);
    expect(res2).toBeUndefined();

    expect(await db?.setConfig("test","test")).toBeTruthy();
    await db?.removeConfig("test")
    expect(await db?.configExist("test")).toBeFalsy()
  });

  test('db function light', async () => {
    const mod=kernel.getModuleList()[0];
    const db = mod.getDb();
    const conf = await db?.setConfig(testText, testText);
    expect(conf).toBeTruthy();
    const res = await db?.getConfig(testText);
    expect(res?.c_value).toBe(testText);
    await db?.removeConfig(testText);
    const res2 = await db?.getConfig(testText);
    expect(res2).toBeUndefined();

    expect(await db?.setConfig("test","test")).toBeTruthy();
    await db?.removeConfig("test")
    expect(await db?.configExist("test")).toBeFalsy()
  });

  test('crypto', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();
    const enc = cc?.encrypt(testText);
    expect(enc).not.toBeUndefined();
    if (enc) {
      const dev = cc?.decrypt(enc.enc, enc.iv, enc.auth);
      expect(dev).toBe(testText);
      expect(await cc?.generateSecureToken(48)).not.toBe("")
    }
  });



  test('loop service test', async () => {
    const mod=kernel.getModule()
    const service=new TestServie("hello",30000,mod);
    expect(service.state).toBe("INIT")
    service.setRunning()
    expect(service.state).toBe("RUNNING")
    service.setSleeping()
    expect(service.state).toBe("SLEEPING")
    service.forceStop=true;
    service.setRunning()
    expect(service.state).toBe("SLEEPING")
  });

  test('loop service test', async () => {
    const mod=kernel.getModule()
    const service=new TestServie("hello",30000,mod);
      mod.addService(service)
    await service.start()

    await sleep( 1 )

    expect(service.state).toBe("RUNNING")

    await service.stop()

    expect(service.state).toBe("SLEEPING")

  });



  test('exit kernel', async () => {
    const result = await kernel.stop();

    await sleep(1000);

    expect(kernel.getState()).toBe('exited');

    expect(result).toBeTruthy();
  });
});


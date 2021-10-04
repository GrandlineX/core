import {
  BaseDBUpdate,
  CoreKernelModule,
  CoreLoopService,
  createFolderIfNotExist, DBConnection, ICoreKernelModule, ICoreKernel,
  sleep, SQLightConnector, CoreClient, PGConnector, CoreCryptoClient, ICoreCClient
} from '../src';
import { config } from 'dotenv';
import * as Path from 'path';
import CoreKernel from '../src/CoreKernel';

import BaseRedisCache from '../src/modules/cache/BaseRedisCache';
config();

const appName = 'TestKernel';
const appCode = 'tkernel';
const msiPath = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');
 process.env.DLOG_LEVEL = 'debug';

type TCoreKernel=CoreKernel<ICoreCClient>;
class TestBaseDB extends PGConnector{
  initNewDB(): Promise<void> {
    return Promise.resolve( undefined );
  }

}
class TestBaseMod extends CoreKernelModule<TCoreKernel,TestBaseDB,null,null,null> {
  beforeServiceStart(): Promise<void> {
    return Promise.resolve( undefined );
  }

  final(): Promise<void> {
    return Promise.resolve( undefined );
  }

  initModule(): Promise<void> {
    this.setDb(new TestBaseDB(this,"0"))
    return Promise.resolve( undefined );
  }

  startup(): Promise<void> {
    return Promise.resolve( undefined );
  }

}
class TestKernel extends CoreKernel<ICoreCClient> {
    constructor(appName:string, appCode:string,testPath:string) {
      super(appName, appCode, testPath);
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


class TestDB extends SQLightConnector{
  constructor(module:ICoreKernelModule<any, any, any, any, any>) {
    super(module,"1");
  }
  async initNewDB(): Promise<void> {
    await this.execScripts([])
  }
}


class TestDBUpdate extends BaseDBUpdate<any>{
  constructor(db:DBConnection<any>) {
    super("0","1",db);
  }
  async performe(): Promise<boolean> {
    const db=this.getDb();

    await db.execScripts([
      { exec: `UPDATE ${db.schemaName}.config SET c_value=1 WHERE c_key='dbversion'` ,param:[]}
    ])
    return true;
  }

}
class TestRedisCache extends BaseRedisCache{}
class TestModuel extends CoreKernelModule<TCoreKernel,TestDB,TestClient,TestRedisCache, null>{
  constructor(kernel:TCoreKernel) {
    super("testModule",kernel);
  }
  async initModule(): Promise<void> {
    this.setClient(new TestClient("testc",this))
    this.setCache(new TestRedisCache("testcache",this))
    this.log("FirstTHIS")
    const db=new TestDB(this)
    this.setDb(db)
    db.setUpdateChain(new TestDBUpdate(this.getDb() as DBConnection<any>))
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

  test('redis test', async () => {
    const cache = kernel.getModuleList()[0].getCache() as BaseRedisCache;
    const obj={
      test:"object",
    }
    const kk='dbversion'
    const kk2='test'
    await cache.clearAll();
    expect(await cache.exist(kk)).toBeFalsy()
    await cache.set(kk,"001");
    expect( await cache.get(kk)).toBe("001")
    expect(await cache.exist(kk)).toBeTruthy()
    await cache.set(kk2,JSON.stringify(obj));
    await cache.expire(kk,30);
    const a=await cache.get(kk2);
    expect(a).not.toBeUndefined()
    expect(a).not.toBeNull()
    if (!a){
      return
    }
    expect(JSON.parse(a)?.test).toBe("object")
    await cache.expire(kk2,30);
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

    const exeres = await db?.execScripts([
      {
        exec: `INSERT INTO ${db.schemaName}.config VALUES ($1,$2)`,
        param: ['test', 'test'],
      },
      {
        exec: `DELETE FROM ${db.schemaName}.config WHERE c_key=$1`,
        param: ['test'],
      },
    ]);
    expect(exeres?.length).toBe(2);
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


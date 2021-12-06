import {
  CoreCache,
  createFolderIfNotExist, EProperties,
  generateSeed,
  getColumnMeta,
  ICoreKernelModule, ILogChanel,
  InMemDB,
  removeFolderIfExist,
  sleep,
  validateEntity
} from '../src';
 import * as Path from 'path';
import CoreDBCon from '../src/classes/CoreDBCon';

import { TestEnt, TestKernel, TestService } from './DebugClasses';
import CoreEntityWrapper from '../src/classes/CoreEntityWrapper';

const appName = 'TestKernel';
const appCode = 'tkernel';
const msiPath = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');


 createFolderIfNotExist(msiPath);
 createFolderIfNotExist(testPath);


 let kernel = new TestKernel(appName,appCode,testPath);

const testText = 'hello_world';

describe('Clean start', () => {
   test('preload', async () => {
    expect(kernel.getState()).toBe('init');
  });
  test('start kernel', async () => {
    const result = await kernel.start();
    expect(result).toBe(true);
    expect(kernel.getModCount()).toBe(2);
    expect(kernel.getState()).toBe('running');
  });})

describe.each([
  ["kernel",kernel],
  ["module",kernel.getModule()as ILogChanel]]
)(
  'Default logger:(%s):',
  (name:string,log:ILogChanel  ) => {

    test('log', async () => {
      log.log("log")
    });
    test('debug', async () => {
      log.debug("debug")
    });
    test('warn', async () => {
      log.warn("warn")
    });
    test('error', async () => {
      log.error("error")
    });
    test('verbose', async () => {
      log.verbose("verbose")
    });
    test('lError', (callback) => {
      try {
        throw log.lError("TestError")
      }catch (e) {
        callback(false)
      }
    });
  })

describe('DevMode', () => {

  test('switch', async () => {
      expect(kernel.getDevMode()).toBeFalsy()
      kernel.setDevMode(true)
      expect(kernel.getDevMode()).toBeTruthy()
      kernel.setDevMode(false)
      expect(kernel.getDevMode()).toBeFalsy()
  });

})

describe('EnvStore', () => {

  test('can load from .env file', async () => {
    const store = kernel.getConfigStore();
      expect(store.has("TESTENV")).toBeTruthy()
      expect(store.get("TESTENV")).toBe("testdata")
  });

})
describe('Module', () => {

  test('test bridge', async () => {
    const mod = kernel.getChildModule("bridgeModule");

    expect(mod?.getBridgeModule("testModule")).not.toBeNull();
    expect(mod?.getBridgeModule("testModule")).not.toBeUndefined();
  });

})

describe('Database', () => {
  test('get version', async () => {
    expect(kernel.getState()).toBe('running');
    const db = kernel.getDb();
    const conf = await db?.getConfig('dbversion');
    expect(conf?.c_value).not.toBeNull();
  });

  test('config test', async () => {
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
})
describe('TestDatabase', () => {
  test('get version', async () => {
    const db = kernel.getChildModule("testModule")?.getDb();
    const conf = await db?.getConfig('dbversion');
    expect(conf?.c_value).not.toBeNull();
  });
  test('manual update', async () => {
    const db = kernel.getChildModule("testModule")?.getDb() as InMemDB;
    const conf = await db.getConfig('dbversion');
    expect(conf?.c_value).not.toBeNull();
    expect(db.dbVersion).toBe("0");
    db.dbVersion="2"
    expect(await db.canUpdate()).toBeTruthy();
    expect(await db.update()).toBeTruthy();
    expect(await db.getCurrenDBVersion()).toBe("2");
  });
})
describe('Cache', () => {
  test( 'set', async () => {
    const mod=kernel.getChildModule("testModule") as ICoreKernelModule<any, any, any, any, any>;
    const cache = mod.getCache() as CoreCache
    const conf = await cache.set( "test","test" );
  } );
  test( 'exist', async () => {
    const mod=kernel.getChildModule("testModule") as ICoreKernelModule<any, any, any, any, any>;
    const cache = mod.getCache() as CoreCache
    const conf = await cache.exist( "test" );
    expect(conf).toBeTruthy()
  } );
  test( 'get', async () => {
    const mod=kernel.getChildModule("testModule") as ICoreKernelModule<any, any, any, any, any>;
    const cache = mod.getCache() as CoreCache
    const conf = await cache.get( "test" );
    expect(conf).toBe("test")
  } );
  test( 'del', async () => {
    const mod=kernel.getChildModule("testModule") as ICoreKernelModule<any, any, any, any, any>;
    const cache = mod.getCache() as CoreCache
     await cache.delete( "test" );
    const conf = await cache.exist( "test" );
    expect(conf).toBeFalsy()
  } );

})
describe('Entity', () => {
  let e_id=0;
  let wrapper:undefined|CoreEntityWrapper<TestEnt>=undefined;
  let entity:TestEnt|null=null

  test('get wrapper class', async () => {
    const mod=kernel.getChildModule("testModule") as ICoreKernelModule<any, any, any, any, any>;
    const db = mod.getDb() as CoreDBCon<any,any>;
    wrapper=db.getEntityWrapper<TestEnt>("TestEnt")
    expect(wrapper).not.toBeUndefined()
    if (wrapper){
      expect((await wrapper.getObjList()).length).toBe(0)
    }
  });
  test('create new', async () => {
    expect(wrapper).not.toBeUndefined()
    if (wrapper){
      entity=new TestEnt();
      entity= await wrapper.createObject(entity)
      expect(entity).not.toBeNull()
      expect(entity.e_id).not.toBeNull()
      if (entity && entity.e_id){
        e_id=entity.e_id;
         expect((await wrapper.getObjList()).length).toBe(1)
      }
    }
  });
  test('update', async () => {
    expect(wrapper).not.toBeUndefined()
    expect(entity).not.toBeNull()

    if (wrapper && entity){
      let oj=await wrapper.getObjById(e_id)

      expect(oj).not.toBeNull()
      expect(oj?.testProp).not.toBeNull()
      expect(oj?.testProp).toBe(0)
      expect((await wrapper.updateObject(e_id,{
        testProp:2
      }))).toBeTruthy()

      oj=await wrapper.getObjById(e_id)
      expect(oj).not.toBeNull()
      expect(oj?.testProp).toBe(2)

    }
  });
  test('get by id', async () => {
    expect(wrapper).not.toBeUndefined()
    if (wrapper){
      expect((await wrapper.getObjById(e_id))).not.toBeNull()
    }
  });
  test('listing search id', async () => {
    expect(wrapper).not.toBeUndefined()
    if (wrapper){
      expect((await wrapper.getObjList({
        e_id: e_id,
      }))).toHaveLength(1);
    }
  });
  test('listing search id limit 0', async () => {
    expect(wrapper).not.toBeUndefined()
    if (wrapper){
      expect((await wrapper.getObjList({
        e_id: e_id,
      },0))).toHaveLength(0);
    }
  });
  test('listing search id limit 1', async () => {
    expect(wrapper).not.toBeUndefined()
    if (wrapper){
      expect((await wrapper.getObjList({
        e_id: e_id,
      },1))).toHaveLength(1);
    }
  });
  test('listing search id limit 2', async () => {
    expect(wrapper).not.toBeUndefined()
    if (wrapper){
      expect((await wrapper.getObjList({
        e_id: e_id,
      },2))).toHaveLength(1);
    }
  });
  test('find entity by id', async () => {
    expect(wrapper).not.toBeUndefined()
    if (wrapper){
      expect((await wrapper.findObj({
        e_id: e_id,
      }))).not.toBeNull();
    }
  });
  test('delete', async () => {
    expect(wrapper).not.toBeUndefined()
    if (wrapper){
      expect((await wrapper.delete(e_id))).toBeTruthy();
      expect((await wrapper.getObjList()).length).toBe(0)
    }
  });
  test("full validation",()=>{
    if (entity){
       expect(validateEntity(entity)).toBeTruthy()
    }
  })
  test.each([
    [0,{testProp:0}],
    [1,{testProp:0}]]
  )(
    'Default logger:(%i):',
    async (name:number,props:EProperties<TestEnt>  ) => {
      expect(wrapper).not.toBeUndefined()
      if (wrapper){
        const obj= await wrapper.createObject(new TestEnt(props))
        let cacheOld= await wrapper.getObjById(obj.e_id)
        let cache= await wrapper.getObjById(obj.e_id)
        expect(cache).not.toBeNull()
        expect(cache).toBe(cacheOld);

        await wrapper.updateObject(obj.e_id,{
          testProp:1
        })
        cache= await wrapper.getObjById(obj.e_id)
        expect(cache?.testProp).toBe(1)

      }

    })
})
describe('Crypto', () => {
  test('encrypt/decrypt', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();
    expect(kernel.hasCryptoClient()).toBeTruthy();
    const enc = cc?.encrypt(testText);
    expect(enc).not.toBeUndefined();
    if (enc) {
      const dev = cc?.decrypt(enc.enc, enc.iv, enc.auth);
      expect(dev).toBe(testText);
    }
  });

  test('seeded hash', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();

    const seed=generateSeed();
    expect(seed).not.toBe("")
    expect(cc?.getHash(seed,testText)).not.toBeNull();

  });
  test('token gen', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();
    expect(await cc?.generateSecureToken(48)).not.toBe("")
  });

});

describe("Service",()=>{

  test('test tates', async () => {
    const mod=kernel.getModule()
    const service=new TestService("hello",30000,mod);
    expect(service.state).toBe("INIT")
    service.setRunning()
    expect(service.state).toBe("RUNNING")
    service.setSleeping()
    expect(service.state).toBe("SLEEPING")
    service.forceStop=true;
    service.setRunning()
    expect(service.state).toBe("SLEEPING")
  });
  test('loop service cycle', async () => {
    const mod=kernel.getModule()
    const service=new TestService("hello",30000,mod);
    mod.addService(service)
    await service.start()

    await sleep( 10 )

    expect(service.state).toBe("RUNNING")

    await service.stop()

    expect(service.state).toBe("SLEEPING")

  });
})


describe("ShutDown",()=>{

  test('exit kernel', async () => {
    const result = await kernel.stop();

    await sleep(1000);

    expect(kernel.getState()).toBe('exited');

    expect(result).toBeTruthy();
  });

  test('cleanup', async () => {

    removeFolderIfExist(testPath)
  });
})


import {
  createFolderIfNotExist, generateSeed, sleep
} from '../src';
 import * as Path from 'path';
import CoreDBCon from '../src/classes/CoreDBCon';

import { TestEntity, TestKernel, TestServie } from './DebugClasses';


const appName = 'TestKernel';
const appCode = 'tkernel';
const msiPath = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');


 createFolderIfNotExist(msiPath);
 createFolderIfNotExist(testPath);


 let kernel = new TestKernel(appName,appCode,testPath);

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

  test('db entity function', async () => {
    const mod=kernel.getModuleList()[0];
    const db = mod.getDb() as CoreDBCon<any>;
    const wrapper=db.getEntityWrapper<TestEntity>("TestEntity")
    expect(wrapper).not.toBeUndefined()
    if (wrapper){
      expect((await wrapper.getObjList()).length).toBe(0)
      const entity=new TestEntity();
      entity.e_id=1;
      expect((await wrapper.createObject(entity))).not.toBeNull()
      expect((await wrapper.getObjList()).length).toBe(1)
      expect((await wrapper.updateObject(entity))).not.toBeNull()
      expect((await wrapper.getObjList()).length).toBe(1)
      expect((await wrapper.getObjById(1))).not.toBeNull()
      expect((await wrapper.delete(1))).toBeTruthy();
      expect((await wrapper.getObjList()).length).toBe(0)
    }
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
      const seed=generateSeed();
      expect(seed).not.toBe("")
      expect(cc?.getHash(seed,testText)).not.toBeNull();
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


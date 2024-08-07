import {
  ICoreAnyModule,
  ICoreKernelModule,
  ILogChannel,
} from '../../lib/index.js';
import TestService from '../testClass/service/TestService.js';
import { CoreCache } from '../../classes/index.js';
import { DefaultLogger, generateSeed } from '../../modules/index.js';
import { CoreDb } from '../../database/index.js';
import TestContext from '../TestContext.js';
import { XUtil } from '../../utils/index.js';

export default function jestCore() {
  const testText = 'hello_world';
  const [kernel] = TestContext.getEntity();
  describe('kernel extend', () => {
    test('getChild empty', async () => {
      expect(kernel.getChildModule('invaldimodname')).toBeNull();
    });
    test('getOffline', async () => {
      expect(kernel.getOffline()).toBeFalsy();
    });
    test('getAppCode', async () => {
      expect(kernel.getAppCode()).not.toBe('');
    });
    test('getActionList', async () => {
      expect(kernel.getActionList().length).toBeGreaterThan(0);
    });
    test('getServiceList', async () => {
      expect(kernel.getServiceList().length).toBeGreaterThan(0);
    });
  });

  describe.each([
    ['kernel', kernel],
    ['module', kernel.getModule() as ILogChannel],
  ])('Default logger:(%s):', (name: string, log: ILogChannel) => {
    test('log', async () => {
      log.log('log');
    });
    test('debug', async () => {
      log.debug('debug');
    });
    test('warn', async () => {
      log.warn('warn');
    });
    test('error', async () => {
      log.error('error');
    });
    test('verbose', async () => {
      log.verbose('verbose');
    });
    test('lError', (callback) => {
      try {
        throw log.lError('TestError');
      } catch (e) {
        callback(false);
      }
    });
    test('log - object', async () => {
      const logger = kernel.getLogger();
      if (logger instanceof DefaultLogger) {
        logger.setPrintObject(false);
      }
      log.log({ test: 'test' }, { test: 'test' });
    });
    test('log - object', async () => {
      const logger = kernel.getLogger();
      if (logger instanceof DefaultLogger) {
        logger.setPrintObject(true);
      }
      log.log({ test: 'test' }, { test: 'test' });
    });
  });

  describe('DevMode', () => {
    test('switch', async () => {
      expect(kernel.getDevMode()).toBeFalsy();
      kernel.setDevMode(true);
      expect(kernel.getDevMode()).toBeTruthy();
      kernel.setDevMode(false);
      expect(kernel.getDevMode()).toBeFalsy();
    });
  });

  describe.each([
    ['testModule', false, 0, [null]],
    ['bridgeModule', true, 1, ['testModule']],
  ])(
    'Module: (%s):',
    (name: string, failing: boolean, br: number, mods: (string | null)[]) => {
      const module = kernel.getChildModule(name) as ICoreAnyModule;

      test('exist', () => {
        expect(module).not.toBeNull();
      });

      test('hasPresenter', () => {
        try {
          expect(module.hasPresenter()).toBeTruthy();
          expect(module.getPresenter()).not.toBeNull();
          expect(failing).toBeFalsy();
        } catch (e) {
          expect(failing).toBeTruthy();
        }
      });
      test('hasDb', () => {
        try {
          expect(module.hasDb()).toBeTruthy();
          expect(module.getDb()).not.toBeNull();
          expect(failing).toBeFalsy();
        } catch (e) {
          expect(failing).toBeTruthy();
        }
      });
      test('hasCache', () => {
        try {
          expect(module.hasCache()).toBeTruthy();
          expect(module.getCache()).not.toBeNull();
          expect(failing).toBeFalsy();
        } catch (e) {
          expect(failing).toBeTruthy();
        }
      });
      test('hasClient', () => {
        try {
          expect(module.hasClient()).toBeTruthy();
          expect(module.getClient()).not.toBeNull();
          expect(failing).toBeFalsy();
        } catch (e) {
          expect(failing).toBeTruthy();
        }
      });
      test('hasServiceList', () => {
        expect(module.getServiceList()).toHaveLength(failing ? 0 : 2);
      });
      test('test_trigger', async () => {
        expect(await kernel.triggerEvent('test_trigger')).toBeTruthy();
      });

      test('hasBridges', () => {
        expect(module.getBridges()).toHaveLength(br);
      });

      test.each(mods)('Bridge: (%s):', (mName: string | null) => {
        if (mName) {
          expect(module.getBridgeModule(mName)).not.toBeUndefined();
        } else {
          expect(module.getBridgeModule('modnotexist')).toBeUndefined();
        }
      });
    },
  );

  describe('Cache', () => {
    test('set', async () => {
      const mod = kernel.getChildModule('testModule') as ICoreKernelModule<
        any,
        any,
        any,
        any,
        any
      >;
      const cache = mod.getCache() as CoreCache;
      await cache.set('test', 'test');
    });
    test('exist', async () => {
      const mod = kernel.getChildModule('testModule') as ICoreKernelModule<
        any,
        any,
        any,
        any,
        any
      >;
      const cache = mod.getCache() as CoreCache;
      const conf = await cache.exist('test');
      expect(conf).toBeTruthy();
    });
    test('get', async () => {
      const mod = kernel.getChildModule('testModule') as ICoreKernelModule<
        any,
        any,
        any,
        any,
        any
      >;
      const cache = mod.getCache() as CoreCache;
      const conf = await cache.get('test');
      expect(conf).toBe('test');
    });
    test('del', async () => {
      const mod = kernel.getChildModule('testModule') as ICoreKernelModule<
        any,
        any,
        any,
        any,
        any
      >;
      const cache = mod.getCache() as CoreCache;
      await cache.delete('test');
      const conf = await cache.exist('test');
      expect(conf).toBeFalsy();
    });
  });
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

      const seed = generateSeed();
      expect(seed).not.toBe('');
      expect(cc?.getHash(seed, testText)).not.toBeNull();
    });
    test('token gen', async () => {
      const cc = kernel.getCryptoClient();
      expect(cc).not.toBeNull();
      expect(await cc?.generateSecureToken(48)).not.toBe('');
    });

    test('keystore', async () => {
      const text = testText;
      const cc = kernel.getCryptoClient();
      const db = kernel.getDb() as CoreDb;
      expect(cc).not.toBeNull();
      if (cc) {
        const keyID = await cc.keyStoreSave(text);
        expect(keyID).not.toBeNull();
        expect(keyID).not.toBeUndefined();
        const keyreturn = await cc.keyStoreLoad(keyID);
        expect(keyreturn).not.toBeNull();
        expect(keyreturn).not.toBeUndefined();
        expect(keyreturn).toBe(text);
        await db.deleteKey(keyID);
        expect(await db.getKey(keyID)).toBeNull();
      }
    });
  });

  describe('Service', () => {
    test('test tates', async () => {
      const mod = kernel.getModule();
      const service = new TestService('hello', 30000, mod);
      expect(service.state).toBe('INIT');
      service.setRunning();
      expect(service.state).toBe('RUNNING');
      service.setSleeping();
      expect(service.state).toBe('SLEEPING');
      service.forceStop = true;
      service.setRunning();
      expect(service.state).toBe('SLEEPING');
    });
    test('loop service cycle', async () => {
      const mod = kernel.getModule();
      const service = new TestService('hello', 30000, mod);
      mod.addService(service);
      await service.start();

      await XUtil.sleep(10);

      expect(service.state).toBe('RUNNING');

      await service.stop();

      expect(service.state).toBe('SLEEPING');
    });
  });
}

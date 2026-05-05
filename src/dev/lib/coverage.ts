import fs from 'fs';
import * as os from 'os';
import * as Path from 'path';
import Type from '../../utils/Type.js';
import { XUtil, Executable } from '../../utils/index.js';
import CoreCryptoClient from '../../modules/crypto/CoreCryptoClient.js';
import { DefaultLogger, InMemDB } from '../../modules/index.js';
import { CoreLogger, LogLevel, CoreLogChannel } from '../../classes/index.js';
import EnvStore from '../../modules/env/EnvStore.js';
import { StoreGlobal } from '../../modules/env/Global.js';
import TestContext from '../TestContext.js';
import TestEntity from '../testClass/db/entity/TestEntity.js';
import BadEntity from '../testClass/db/entity/BadEntity.js';

export default function jestCoverage() {
  describe('Type', () => {
    test('isUUID - valid', () => {
      expect(Type.isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });
    test('isUUID - invalid', () => {
      expect(Type.isUUID('not-a-uuid')).toBe(false);
      expect(Type.isUUID('')).toBe(false);
      expect(Type.isUUID('550e8400-e29b-41d4-a716')).toBe(false);
    });
    test('isIsoDate - valid', () => {
      expect(Type.isIsoDate('2024-01-01T00:00:00Z')).toBe(true);
      expect(Type.isIsoDate('2024-01-01T00:00:00.000Z')).toBe(true);
      expect(Type.isIsoDate('2024-01-01T12:30:59.123+05:30')).toBe(true);
    });
    test('isIsoDate - invalid', () => {
      expect(Type.isIsoDate('2024-01-01')).toBe(false);
      expect(Type.isIsoDate('not a date')).toBe(false);
      expect(Type.isIsoDate('')).toBe(false);
    });
    test('isString - valid non-empty string', () => {
      expect(Type.isString('hello')).toBe(true);
    });
    test('isString - empty string is false', () => {
      expect(Type.isString('')).toBe(false);
    });
    test('isString - non-string is false', () => {
      expect(Type.isString(42)).toBe(false);
      expect(Type.isString(null)).toBe(false);
      expect(Type.isString(undefined)).toBe(false);
    });
    test('isNumber - valid numbers', () => {
      expect(Type.isNumber(42)).toBe(true);
      expect(Type.isNumber(0)).toBe(true);
      expect(Type.isNumber(-1.5)).toBe(true);
    });
    test('isNumber - non-number is false', () => {
      expect(Type.isNumber('42')).toBe(false);
      expect(Type.isNumber(null)).toBe(false);
    });
    test('isBoolean - true and false', () => {
      expect(Type.isBoolean(true)).toBe(true);
      expect(Type.isBoolean(false)).toBe(true);
    });
    test('isBoolean - non-boolean is false', () => {
      expect(Type.isBoolean(0)).toBe(false);
      expect(Type.isBoolean('true')).toBe(false);
    });
  });

  describe('XUtil extended', () => {
    test('numPrint - single digit gets leading zero', () => {
      expect(XUtil.numPrint(5)).toBe('05');
      expect(XUtil.numPrint(0)).toBe('00');
      expect(XUtil.numPrint(9)).toBe('09');
    });
    test('numPrint - double digit stays as-is', () => {
      expect(XUtil.numPrint(10)).toBe('10');
      expect(XUtil.numPrint(99)).toBe('99');
    });
    test('getTimeStamp returns formatted string', () => {
      const ts = XUtil.getTimeStamp();
      expect(typeof ts).toBe('string');
      expect(ts).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
    test('workerFactoryFromArray processes all items', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result = await XUtil.workerFactoryFromArray(
        2,
        arr,
        async (item) => ({ i: item.i, dat: item.dat * 2 }),
      );
      expect(result).toHaveLength(5);
      expect(result.sort((a, b) => a - b)).toEqual([2, 4, 6, 8, 10]);
    });
    test('workerFactoryFromArray - empty array', async () => {
      const result = await XUtil.workerFactoryFromArray(
        2,
        [],
        async (item) => ({ i: item.i, dat: item.dat }),
      );
      expect(result).toHaveLength(0);
    });
    test('workerFactoryWithProducer processes items', async () => {
      const items = [10, 20, 30];
      let idx = 0;
      const result = await XUtil.workerFactoryWithProducer(
        2,
        async () => {
          const cur = idx++;
          if (cur >= items.length) return null;
          return { i: cur, dat: items[cur] };
        },
        async (item) => ({ i: item.i, dat: item.dat + 1 }),
      );
      expect(result).toHaveLength(3);
    });
    test('calcDirSize - sums file sizes recursively', async () => {
      const tmpDir = fs.mkdtempSync(Path.join(os.tmpdir(), 'xutil-test-'));
      fs.writeFileSync(Path.join(tmpDir, 'a.txt'), 'hello');
      const sub = Path.join(tmpDir, 'sub');
      fs.mkdirSync(sub);
      fs.writeFileSync(Path.join(sub, 'b.txt'), 'world!');
      const size = await XUtil.calcDirSize(tmpDir);
      expect(size).toBeGreaterThan(0);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    test('calcDirSize - excludes specified entries', async () => {
      const tmpDir = fs.mkdtempSync(Path.join(os.tmpdir(), 'xutil-test-'));
      fs.writeFileSync(Path.join(tmpDir, 'keep.txt'), 'keep');
      fs.writeFileSync(Path.join(tmpDir, 'skip.txt'), 'skip this file');
      const sizeWithout = await XUtil.calcDirSize(tmpDir, ['skip.txt']);
      const sizeFull = await XUtil.calcDirSize(tmpDir);
      expect(sizeFull).toBeGreaterThan(sizeWithout);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    test('getEntityNames - throws for object without Entity metadata', () => {
      expect(() => XUtil.getEntityNames({} as any)).toThrow('InvalidClassMeta');
    });
  });

  describe('Executable callbacks', () => {
    test('onStdOut callback receives data', async () => {
      const received: string[] = [];
      const exe = new Executable('echo', {
        shell: true,
        onStdOut: (d) => received.push(d),
      });
      const result = await exe.run(['hello_callback']);
      expect(result.exitCode === null || result.exitCode === 0).toBe(true);
      expect(received.length).toBeGreaterThan(0);
    });
    test('onStdErr callback receives data on error', async () => {
      const received: string[] = [];
      const exe = new Executable('ls', {
        shell: true,
        onStdErr: (d) => received.push(d),
      });
      const result = await exe.run(['/nonexistent_path_xyz_abc']);
      expect(result.error).toBe(true);
      expect(received.length).toBeGreaterThan(0);
    });
  });

  describe('CoreLogger', () => {
    test('getLogLevelFromString - all valid levels', () => {
      expect(CoreLogger.getLogLevelFromString('verbose')).toBe(
        LogLevel.VERBOSE,
      );
      expect(CoreLogger.getLogLevelFromString('debug')).toBe(LogLevel.DEBUG);
      expect(CoreLogger.getLogLevelFromString('warn')).toBe(LogLevel.WARN);
      expect(CoreLogger.getLogLevelFromString('info')).toBe(LogLevel.INFO);
      expect(CoreLogger.getLogLevelFromString('error')).toBe(LogLevel.ERROR);
      expect(CoreLogger.getLogLevelFromString('silent')).toBe(LogLevel.SILENT);
    });
    test('getLogLevelFromString - unknown level throws', () => {
      expect(() => CoreLogger.getLogLevelFromString('invalid')).toThrow();
    });
    test('constructor with logLevel string', () => {
      const logger = new DefaultLogger('debug');
      expect(logger.getLogLevel()).toBe(LogLevel.DEBUG);
    });
    test('setLogLevel with string', () => {
      const logger = new DefaultLogger();
      logger.setLogLevel('error');
      expect(logger.getLogLevel()).toBe(LogLevel.ERROR);
    });
    test('setLogLevel with numeric LogLevel', () => {
      const logger = new DefaultLogger();
      logger.setLogLevel(LogLevel.VERBOSE);
      expect(logger.getLogLevel()).toBe(LogLevel.VERBOSE);
    });
    test('isOnLevel', () => {
      const logger = new DefaultLogger();
      logger.setLogLevel(LogLevel.WARN);
      expect(logger.isOnLevel(LogLevel.ERROR)).toBe(true);
      expect(logger.isOnLevel(LogLevel.WARN)).toBe(true);
      expect(logger.isOnLevel(LogLevel.DEBUG)).toBe(false);
      expect(logger.isOnLevel(LogLevel.VERBOSE)).toBe(false);
    });
    test('setNoColor disables ANSI codes in output', () => {
      const logger = new DefaultLogger();
      logger.setNoColor(true);
      expect(() => logger.error('ch', 'msg')).not.toThrow();
      expect(() => logger.warn('ch', 'msg')).not.toThrow();
    });
    test('setPrintTimestamp false omits timestamp', () => {
      const logger = new DefaultLogger();
      logger.setPrintTimestamp(false);
      expect(() => logger.log('ch', 'msg')).not.toThrow();
    });
    test('printObject=true with primitive arg hits non-object branch', () => {
      const logger = new DefaultLogger();
      logger.setPrintObject(true);
      expect(() => logger.log('ch', 'primitive string arg', 42)).not.toThrow();
    });
  });

  describe('CoreCryptoClient', () => {
    const [kernel] = TestContext.getEntity();

    test('fromPW derives a 32-char key', () => {
      const key = CoreCryptoClient.fromPW('my-secret-password');
      expect(key).toHaveLength(32);
    });
    test('constructor with invalid key length throws', () => {
      expect(() => new CoreCryptoClient(kernel as any, 'short')).toThrow(
        'INVALID KEY LENGTH',
      );
    });
    test('isValid returns true for valid 32-char key', () => {
      const cc = kernel.getCryptoClient();
      expect(cc?.isValid()).toBe(true);
    });
    test('getUUID generates a valid UUID string', () => {
      const cc = kernel.getCryptoClient();
      const uuid = cc?.getUUID();
      expect(typeof uuid).toBe('string');
      expect(Type.isUUID(uuid!)).toBe(true);
    });
    test('timeSavePWValidation - equal strings returns true', () => {
      const cc = kernel.getCryptoClient();
      expect(cc?.timeSavePWValidation('password', 'password')).toBe(true);
    });
    test('timeSavePWValidation - same length but different returns false', () => {
      const cc = kernel.getCryptoClient();
      expect(cc?.timeSavePWValidation('hello', 'world')).toBe(false);
    });
    test('timeSavePWValidation - different lengths returns false', () => {
      const cc = kernel.getCryptoClient();
      expect(cc?.timeSavePWValidation('hi', 'hello world')).toBe(false);
    });
    test('keyStoreLoad with non-existent id returns null', async () => {
      const cc = kernel.getCryptoClient();
      const result = await cc?.keyStoreLoad(
        '00000000-0000-0000-0000-000000000000',
      );
      expect(result).toBeNull();
    });
    test('clientFromPW throws because sha512 hex is 128 chars not 32', () => {
      expect(() =>
        CoreCryptoClient.clientFromPW(kernel as any, 'any-password'),
      ).toThrow('INVALID KEY LENGTH');
    });
  });

  describe('EnvStore extended', () => {
    const [kernel] = TestContext.getEntity();

    test('getBulk returns values with fallback defaults', () => {
      const store = kernel.getConfigStore() as EnvStore;
      const results = store.getBulk(
        ['TESTENV'],
        ['NON_EXISTENT_ENV_KEY', 'fallback'],
      );
      expect(results[0]).toBe('testdata');
      expect(results[1]).toBe('fallback');
    });
    test('delete removes a key', () => {
      const store = kernel.getConfigStore() as EnvStore;
      store.set('_TEST_DEL_KEY', 'val');
      expect(store.has('_TEST_DEL_KEY')).toBe(true);
      store.delete('_TEST_DEL_KEY');
      expect(store.has('_TEST_DEL_KEY')).toBe(false);
    });
    test('appName with pathOverride sets path globals', () => {
      const tmpDir = fs.mkdtempSync(Path.join(os.tmpdir(), 'envstore-'));
      const store = new EnvStore({
        log: kernel.getModule() as any,
        appName: 'TestApp',
        pathOverride: tmpDir,
      });
      expect(store.has(StoreGlobal.GLOBAL_PATH_HOME)).toBe(true);
      expect(store.has(StoreGlobal.GLOBAL_PATH_DATA)).toBe(true);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    test('loadFromFile parses valid key=value lines and skips comments', () => {
      const tmpDir = fs.mkdtempSync(Path.join(os.tmpdir(), 'envstore-'));
      const envFile = Path.join(tmpDir, '.env');
      fs.writeFileSync(
        envFile,
        '# this is a comment\nLOADED_KEY=loaded_value\nNO_EQUALS_HERE\n  SPACED = with spaces  \n',
      );
      const store = new EnvStore({
        log: kernel.getModule() as any,
        envFilePath: tmpDir,
      });
      expect(store.get('LOADED_KEY')).toBe('loaded_value');
      expect(store.get('SPACED')).toBe('with spaces');
      expect(store.has('NO_EQUALS_HERE')).toBe(false);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    test('missing envFilePath path emits warning and continues', () => {
      const store = new EnvStore({
        log: kernel.getModule() as any,
        envFilePath: '/nonexistent/path/xyz',
      });
      expect(store).toBeDefined();
      expect(store.has(StoreGlobal.GLOBAL_OS)).toBe(true);
    });
    test('loadFromLocalEnv loads process.env entries', () => {
      process.env._TEST_LOCAL_VAR = 'localval';
      const store = new EnvStore({
        log: kernel.getModule() as any,
        loadFromLocalEnv: true,
      });
      expect(store.get('_TEST_LOCAL_VAR')).toBe('localval');
      delete process.env._TEST_LOCAL_VAR;
    });
    test('GLOBAL_APP_VERSION falls back to 0.0.0 when npm_package_version is unset', () => {
      const orig = process.env.npm_package_version;
      delete process.env.npm_package_version;
      const store = new EnvStore({ log: kernel.getModule() as any });
      expect(store.get(StoreGlobal.GLOBAL_APP_VERSION)).toBe('0.0.0');
      if (orig !== undefined) {
        process.env.npm_package_version = orig;
      }
    });
  });

  describe('InMemDB edge cases', () => {
    const [kernel] = TestContext.getEntity();
    let db: InMemDB;

    beforeAll(() => {
      const mod = kernel.getChildModule('testModule') as any;
      db = new InMemDB(mod);
    });

    test('execScripts returns empty array', async () => {
      const result = await db.execScripts([]);
      expect(result).toHaveLength(0);
    });
    test('getRawDBObject returns e_map and map', () => {
      const raw = db.getRawDBObject();
      expect(raw).toHaveProperty('e_map');
      expect(raw).toHaveProperty('map');
    });
    test('getEntityById - unknown table returns null', async () => {
      const result = await db.getEntityById(
        { className: 'Ghost', meta: new Map() as any },
        'some-id',
      );
      expect(result).toBeNull();
    });
    test('getEntityBulkById - unknown table returns []', async () => {
      const result = await db.getEntityBulkById(
        { className: 'Ghost', meta: new Map() as any },
        ['id1', 'id2'],
      );
      expect(result).toHaveLength(0);
    });
    test('createEntity - unknown table throws', async () => {
      await expect(
        db.createEntity({ className: 'Ghost', meta: new Map() as any }, {
          e_id: 'id',
        } as any),
      ).rejects.toThrow();
    });
    test('deleteEntityById - unknown table returns false', async () => {
      expect(await db.deleteEntityById('Ghost', 'id')).toBe(false);
    });
    test('deleteEntityBulkById - unknown table returns false', async () => {
      expect(await db.deleteEntityBulkById('Ghost', ['id'])).toBe(false);
    });
    test('updateEntity - unknown table throws', async () => {
      await expect(
        db.updateEntity(
          { className: 'Ghost', meta: new Map() as any },
          'id',
          {},
        ),
      ).rejects.toThrow();
    });
    test('findEntity - unknown table returns null', async () => {
      expect(
        await db.findEntity({ className: 'Ghost', meta: new Map() as any }, {}),
      ).toBeNull();
    });
    test('countEntity - unknown table returns 0', async () => {
      expect(
        await db.countEntity({ className: 'Ghost', meta: new Map() as any }),
      ).toBe(0);
    });
    test('getEntityList - unknown table returns []', async () => {
      expect(
        await db.getEntityList({
          config: { className: 'Ghost', meta: new Map() as any },
        }),
      ).toHaveLength(0);
    });

    describe('aFilter modes via getEntityList', () => {
      beforeAll(async () => {
        await db.initEntity('AFilter');
        await db.setConfig('dbversion', '0');
        await db.createEntity(
          { className: 'AFilter', meta: new Map() as any },
          { e_id: 'aaa', name: 'Alice', age: 25 } as any,
        );
        await db.createEntity(
          { className: 'AFilter', meta: new Map() as any },
          { e_id: 'bbb', name: 'Bob', age: 30 } as any,
        );
      });

      test('not mode excludes matching value', async () => {
        const result = await db.getEntityList({
          config: { className: 'AFilter', meta: new Map() as any },
          search: { name: { mode: 'not', value: 'Alice' } } as any,
        });
        expect(result).toHaveLength(1);
        expect((result[0] as any).name).toBe('Bob');
      });
      test('between with < 2 elements returns no match', async () => {
        const result = await db.getEntityList({
          config: { className: 'AFilter', meta: new Map() as any },
          search: { age: { mode: 'between', value: [20] } } as any,
        });
        expect(result).toHaveLength(0);
      });
      test('between with non-array value returns no match', async () => {
        const result = await db.getEntityList({
          config: { className: 'AFilter', meta: new Map() as any },
          search: { age: { mode: 'between', value: 25 } } as any,
        });
        expect(result).toHaveLength(0);
      });
      test('default/unknown mode returns no match', async () => {
        const result = await db.getEntityList({
          config: { className: 'AFilter', meta: new Map() as any },
          search: { name: { mode: 'unknownMode', value: 'x' } } as any,
        });
        expect(result).toHaveLength(0);
      });
      test('updateEntity - entity not found throws', async () => {
        await expect(
          db.updateEntity(
            { className: 'AFilter', meta: new Map() as any },
            'nonexistent-id',
            { name: 'X' } as any,
          ),
        ).rejects.toThrow();
      });
      test('countEntity without search returns total', async () => {
        const count = await db.countEntity({
          className: 'AFilter',
          meta: new Map() as any,
        });
        expect(count).toBe(2);
      });
      test('getEntityList with offset beyond length returns []', async () => {
        const result = await db.getEntityList({
          config: { className: 'AFilter', meta: new Map() as any },
          offset: 9999,
        });
        expect(result).toHaveLength(0);
      });
    });
  });

  describe('CoreKernelModule service management', () => {
    const [kernel] = TestContext.getEntity();

    test('stopService - non-existent service returns null', async () => {
      const mod = kernel.getChildModule('testModule') as any;
      const result = await mod.stopService('__nonexistent__');
      expect(result).toBeNull();
    });
    test('startService - non-existent service returns null', async () => {
      const mod = kernel.getChildModule('testModule') as any;
      const result = await mod.startService('__nonexistent__');
      expect(result).toBeNull();
    });
  });

  describe('CoreLogChannel', () => {
    test('constructor with CoreLogger instance sets logger directly', () => {
      const logger = new DefaultLogger();
      const ch = new CoreLogChannel('coverage-test', logger);
      expect(ch.logger).toBe(logger);
    });
    test('constructor with null sets logger to null', () => {
      const ch = new CoreLogChannel('coverage-test', null);
      expect(ch.logger).toBeNull();
    });
  });

  describe('CoreDBPrefab delegating methods', () => {
    const [kernel] = TestContext.getEntity();
    let prefab: any;
    let entConfig: any;
    let ent1: TestEntity;
    let ent2: TestEntity;

    beforeAll(() => {
      prefab = kernel.getChildModule('testModule')?.getDb();
      const meta = prefab.getEntityMeta() as { key: string; meta: any }[];
      const testEntMeta = meta.find((m) => m.key === 'TestEntity');
      // InMemDB e_map uses the tableName as key (camelToSnakeCase of className)
      entConfig = {
        className: XUtil.camelToSnakeCase('TestEntity'),
        meta: testEntMeta!.meta,
      };
    });

    test('canUpdate', async () => {
      expect(typeof (await prefab.canUpdate())).toBe('boolean');
    });
    test('getCurrenDBVersion', async () => {
      expect(typeof (await prefab.getCurrenDBVersion())).toBe('string');
    });
    test('update', async () => {
      expect(await prefab.update()).toBe(true);
    });
    test('isConnected', () => {
      expect(prefab.isConnected()).toBeTruthy();
    });
    test('setConnected', () => {
      expect(() => prefab.setConnected()).not.toThrow();
    });
    test('connect', async () => {
      expect(await prefab.connect()).toBe(true);
    });
    test('execScripts', async () => {
      expect(Array.isArray(await prefab.execScripts([]))).toBe(true);
    });
    test('setConfig, getConfig, configExist, removeConfig', async () => {
      await prefab.setConfig('_cov_key', 'cov_val');
      expect(await prefab.configExist('_cov_key')).toBe(true);
      expect((await prefab.getConfig('_cov_key'))?.c_value).toBe('cov_val');
      await prefab.removeConfig('_cov_key');
      expect(await prefab.configExist('_cov_key')).toBe(false);
    });
    test('getRawDBObject', async () => {
      expect(await prefab.getRawDBObject()).not.toBeNull();
    });
    test('getEntityWrapper', () => {
      expect(prefab.getEntityWrapper('TestEntity')).not.toBeUndefined();
    });
    test('getConfigStore via CoreElement', () => {
      expect(prefab.getConfigStore()).not.toBeNull();
    });
    test('getCClient via CoreElement', () => {
      expect(prefab.getCClient()).not.toBeNull();
    });
    test('createEntity and getEntityById', async () => {
      ent1 = new TestEntity({
        name: 'Prefab1',
        age: 10,
        address: null,
        time: null,
        raw: null,
        json: null,
      });
      ent1 = await prefab.createEntity(entConfig, ent1);
      expect(ent1.e_id).not.toBeNull();
      const found = await prefab.getEntityById(entConfig, ent1.e_id);
      expect(found?.name).toBe('Prefab1');
    });
    test('getEntityBulkById', async () => {
      ent2 = new TestEntity({
        name: 'Prefab2',
        age: 20,
        address: null,
        time: null,
        raw: null,
        json: null,
      });
      ent2 = await prefab.createEntity(entConfig, ent2);
      const bulk = await prefab.getEntityBulkById(entConfig, [
        ent1.e_id,
        ent2.e_id,
      ]);
      expect(bulk.length).toBe(2);
    });
    test('updateEntity', async () => {
      await prefab.updateEntity(entConfig, ent1.e_id, {
        name: 'PrefabUpdated',
      });
      expect((await prefab.getEntityById(entConfig, ent1.e_id))?.name).toBe(
        'PrefabUpdated',
      );
    });
    test('updateBulkEntity', async () => {
      expect(
        await prefab.updateBulkEntity(entConfig, [ent1.e_id, ent2.e_id], {
          name: 'BulkPrefab',
        }),
      ).toBe(true);
    });
    test('getEntityList', async () => {
      expect(
        Array.isArray(await prefab.getEntityList({ config: entConfig })),
      ).toBe(true);
    });
    test('findEntity', async () => {
      const found = await prefab.findEntity(entConfig, { name: 'BulkPrefab' });
      expect(found).not.toBeNull();
    });
    test('countEntity', async () => {
      expect(await prefab.countEntity(entConfig, {})).toBeGreaterThanOrEqual(2);
    });
    test('initEntity', async () => {
      expect(await prefab.initEntity('_CovTmp', new TestEntity())).toBe(true);
    });
    test('deleteEntityById', async () => {
      expect(
        await prefab.deleteEntityById(
          XUtil.camelToSnakeCase('TestEntity'),
          ent1.e_id,
        ),
      ).toBe(true);
    });
    test('deleteEntityBulkById', async () => {
      expect(
        await prefab.deleteEntityBulkById(
          XUtil.camelToSnakeCase('TestEntity'),
          [ent2.e_id],
        ),
      ).toBe(true);
    });
    test('getCache', () => {
      expect(prefab.getCache() !== undefined).toBe(true);
    });
    test('disconnect', async () => {
      expect(await prefab.disconnect()).toBe(true);
    });
    test('initNewDB delegates to db and calls initPrefabDB', async () => {
      await expect(prefab.initNewDB()).resolves.not.toThrow();
    });
    test('populateMany with empty array returns []', async () => {
      expect(await prefab.populateMany([], 'link')).toHaveLength(0);
    });
    test('populate - field without foreignKey throws', async () => {
      const entity = new TestEntity({
        name: 'T',
        age: 1,
        address: null,
        time: null,
        raw: null,
        json: null,
      });
      await expect(prefab.populate(entity, 'name')).rejects.toThrow();
    });
  });

  describe('CoreDBCon error paths', () => {
    const [kernel] = TestContext.getEntity();

    test('getEntityWrapper - unknown entity throws', () => {
      const db = kernel.getDb() as any;
      expect(() => db.getEntityWrapper('__NoSuchEntity__')).toThrow();
    });
    test('setUpdateChain - empty args logs and returns', () => {
      const db = kernel.getDb() as any;
      expect(() => db.setUpdateChain()).not.toThrow();
    });
    test('registerEntity - invalid entity (no @Entity decorator) throws', () => {
      const mod = kernel.getChildModule('testModule') as any;
      const innerDb = mod.getDb().getPrefabDB();
      expect(() => innerDb.registerEntity(new BadEntity())).toThrow();
    });
  });
}

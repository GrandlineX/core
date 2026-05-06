import TestEntity from '../testClass/db/entity/TestEntity.js';
import {
  CoreDBCon,
  CoreDBPrefab,
  CoreEntityWrapper,
  validateEntity,
} from '../../classes/index.js';
import { ICoreKernelModule, IDataBase } from '../../lib/index.js';
import TestPrefab from '../testClass/db/TestPrefab.js';

import TestEntityLinked from '../testClass/db/entity/TestEntityLinked.js';
import { EntityValidator, XUtil } from '../../utils/index.js';
import TestContext from '../TestContext.js';
import { InMemCache } from '../../modules/index.js';
import BadEntity from '../testClass/db/entity/BadEntity.js';
import TestModule from '../testClass/TestModule.js';

export default function jestDb() {
  const testText = 'hello_world';
  const [kernel] = TestContext.getEntity();
  describe('Database', () => {
    test('get version', async () => {
      expect(kernel.getState()).toBe('running');
      const db = kernel.getDb();
      expect(db).not.toBeNull();
      const conf = await db?.getConfig('dbversion');
      expect(conf?.c_value).not.toBeNull();
    });

    test('config test', async () => {
      expect(kernel.getState()).toBe('running');
      const db = kernel.getDb();
      expect(db).not.toBeNull();
      if (db) {
        const conf = await db.setConfig(testText, testText);
        expect(conf).toBeTruthy();
        const res = await db.getConfig(testText);
        expect(res?.c_value).toBe(testText);
        await db.removeConfig(testText);
        const res2 = await db.getConfig(testText);
        expect(res2).toBeUndefined();

        expect(await db?.setConfig('test', 'test')).toBeTruthy();
        await db?.removeConfig('test');
        expect(await db?.configExist('test')).toBeFalsy();
      }
    });
  });

  describe('TestDatabase', () => {
    test('get version', async () => {
      const db = kernel.getChildModule('testModule')?.getDb();
      const conf = await db?.getConfig('dbversion');
      expect(conf?.c_value).not.toBeNull();
    });
    test('test entity', async () => {
      const db = kernel.getChildModule('testModule')?.getDb() as TestPrefab;
      expect(db.getEntityMeta()).toHaveLength(2);
      expect(await db.ent.getObjList()).toHaveLength(0);
    });
    test('manual update', async () => {
      const dbpre = kernel
        .getChildModule('testModule')
        ?.getDb() as CoreDBPrefab<any>;
      const db = dbpre.getPrefabDB();
      const conf = await db.getConfig('dbversion');
      expect(conf?.c_value).not.toBeNull();
      expect(db.dbVersion).toBe('0');
      db.dbVersion = '2';
      expect(await db.canUpdate()).toBeTruthy();
      expect(await db.update()).toBeTruthy();
      expect(await db.getCurrenDBVersion()).toBe('2');
      await db.setConfig('dbversion', '0');
    });
  });
  describe.each([
    ['noCache', false],
    ['withCache', true],
  ])('Entity :(%s):', (name: string, hasCace: boolean) => {
    let wrapper: undefined | CoreEntityWrapper<TestEntity>;
    let wrapper2: undefined | CoreEntityWrapper<TestEntityLinked>;

    let entity: TestEntity = new TestEntity({
      name: 'Bob',
      age: 30,
      address: 'home',
      time: new Date(),
      raw: null,
      json: { some: 'value' },
    });
    let entity2: TestEntity = new TestEntity({
      name: 'Alice',
      age: 29,
      address: null,
      time: null,
      raw: null,
      json: [{ some: 'value' }, { some: 'array' }],
    });
    let entity3: TestEntityLinked = new TestEntityLinked({
      name: 'Alice',
      age: 29,
      address: null,
      time: null,
      link: null,
      raw: Buffer.from('message'),
      json: null,
      flag: true,
      floating: 0.9,
    });
    let entity4: TestEntity = new TestEntity({
      name: 'Bulk01',
      age: 1,
      address: null,
      time: null,
      raw: null,
      json: null,
    });
    let entity5: TestEntity = new TestEntity({
      name: 'Bulk02',
      age: 1,
      address: null,
      time: null,
      raw: null,
      json: null,
    });

    test('get wrapper class', async () => {
      const mod = kernel.getChildModule('testModule') as ICoreKernelModule<
        any,
        any,
        any,
        any,
        any
      >;
      const db = mod.getDb() as CoreDBCon<any, any>;
      expect(
        EntityValidator.validateManualObj(db, 'TestEntity', entity, false),
      ).toBeTruthy();
      wrapper = db.getEntityWrapper<TestEntity>('TestEntity');
      if (wrapper) {
        if (hasCace) {
          wrapper.cache = mod.getCache() || new InMemCache(mod);
        } else {
          wrapper.cache = null;
        }
      }
      if (wrapper2) {
        if (hasCace) {
          wrapper2.cache = mod.getCache() || new InMemCache(mod);
        } else {
          wrapper2.cache = null;
        }
      }
      wrapper2 = db.getEntityWrapper<TestEntityLinked>('TestEntityLinked');
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect((await wrapper.getObjList()).length).toBe(0);
      }
    });
    test('create new', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        entity = (await wrapper.createObject(entity)) || entity;
        expect(entity?.e_id).not.toBeNull();
        expect((await wrapper.getObjList()).length).toBe(1);
      }
    });
    test('create new - failing', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          wrapper!.createObject({
            name: 'FailBob',
            age: 30,
            address: 'home',
            time: new Date(),
            raw: null,
            json: { some: 'value' },
          } as any),
        ).rejects.toThrow();
      }
    });
    test('create new 2', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        entity2 = (await wrapper.createObject(entity2)) || entity2;
        expect(entity2?.e_id).not.toBeNull();
        expect((await wrapper.getObjList()).length).toBe(2);
      }
    });
    test('create new 3', async () => {
      expect(wrapper2).not.toBeUndefined();
      if (wrapper2) {
        entity3.link = entity.e_id;
        entity3 = (await wrapper2.createObject(entity3)) || entity3;
        expect(entity2?.e_id).not.toBeNull();
        expect((await wrapper2.getObjList()).length).toBe(1);
      }
    });
    test('create new 4', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        entity4 = (await wrapper.createObject(entity4)) || entity4;
        expect(entity4?.e_id).not.toBeNull();
        expect((await wrapper.getObjList()).length).toBe(3);
      }
    });
    test('create new 5', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        entity5 = (await wrapper.createObject(entity5)) || entity5;
        expect(entity5?.e_id).not.toBeNull();
        expect((await wrapper.getObjList()).length).toBe(4);
      }
    });

    test('get by id', async () => {
      expect(wrapper).not.toBeUndefined();
      expect(entity.e_id).not.toBeNull();
      if (wrapper) {
        expect(await wrapper.getObjById(entity.e_id)).not.toBeNull();
      }
    });

    test('listing search id', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: { e_id: entity.e_id },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search fk id', async () => {
      expect(wrapper2).not.toBeUndefined();
      if (wrapper2) {
        expect(
          await wrapper2.getObjList({
            search: { link: entity.e_id },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search bob', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: { name: 'Bob' },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search multi 01', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: { age: 1, name: 'Bulk01', address: null },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search multi 02', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: {
              age: {
                mode: 'equals',
                value: 1,
              },
              name: 'Bulk01',
            },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search multi 03', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: {
              age: [
                {
                  mode: 'equals',
                  value: 1,
                },
              ],
              name: 'Bulk01',
            },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search bob like', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: {
              name: {
                value: 'ob',
                mode: 'like',
              },
            },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search les age', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: {
              age: {
                value: 30,
                mode: 'smallerThan',
              },
            },
          }),
        ).toHaveLength(3);
      }
    });
    test('listing search greater age', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: {
              age: {
                value: 29,
                mode: 'greaterThan',
              },
            },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search multiple', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: {
              age: [
                {
                  value: 1,
                  mode: 'greaterThan',
                },
                {
                  value: 30,
                  mode: 'smallerThan',
                },
              ],
            },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search in', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: { age: { value: [1, 29], mode: 'in' } },
          }),
        ).toHaveLength(3);
      }
    });
    test('listing search notIn', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: { age: { value: [1, 29], mode: 'notIn' } },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search between', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: { age: { value: [1, 29], mode: 'between' } },
          }),
        ).toHaveLength(3);
      }
    });
    test('listing search isNull', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: { address: { mode: 'isNull' } },
          }),
        ).toHaveLength(3);
      }
    });
    test('listing search isNotNull', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: { address: { mode: 'isNotNull' } },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search startsWith', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: { name: { value: 'B', mode: 'startsWith' } },
          }),
        ).toHaveLength(3);
      }
    });
    test('listing search endsWith', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.getObjList({
            search: { name: { value: '01', mode: 'endsWith' } },
          }),
        ).toHaveLength(1);
      }
    });
    test('listing search bob check date', async () => {
      expect(wrapper).not.toBeUndefined();

      if (wrapper) {
        const bonb = await wrapper.getObjList({
          search: {
            name: {
              value: 'Bob',
              mode: 'equals',
            },
          },
        });
        expect(bonb).toHaveLength(1);
        expect(bonb[0].time).not.toBeNull();
      }
    });
    test('find entity by id', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(
          await wrapper.findObj({
            e_id: {
              value: entity.e_id,
              mode: 'equals',
            },
          }),
        ).not.toBeNull();
      }
    });

    test('update', async () => {
      expect(wrapper).not.toBeUndefined();
      expect(entity.e_id).not.toBeNull();
      if (wrapper) {
        expect(entity.name).toBe('Bob');

        await wrapper.updateObject(entity.e_id, {
          name: 'Bobi',
        });
        const update = await wrapper.getObjById(entity.e_id);
        expect(update).not.toBeNull();
        expect(update?.name).toBe('Bobi');
        expect((await wrapper.getObjList()).length).toBe(4);
      }
    });

    test('update-bulk', async () => {
      expect(wrapper).not.toBeUndefined();
      expect(entity4.e_id).not.toBeNull();
      expect(entity5.e_id).not.toBeNull();
      if (wrapper) {
        expect(entity4.name).toBe('Bulk01');
        expect(entity5.name).toBe('Bulk02');

        await wrapper.updateObjectBulk([entity4.e_id, entity5.e_id], {
          name: 'BulkXX',
        });
        const update = await wrapper.getObjByIdBulk([
          entity4.e_id,
          entity5.e_id,
        ]);
        expect(update.length).toBe(2);

        for (const el of update) {
          expect(el).not.toBeNull();
          expect(el?.name).toBe('BulkXX');
        }
        expect((await wrapper.getObjList()).length).toBe(4);
      }
    });

    test('count all', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(await wrapper.count()).toBe(4);
      }
    });
    test('count with search', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(await wrapper.count({ age: 1 })).toBe(2);
      }
    });
    test('exists - true', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(await wrapper.exists({ name: 'Bobi' })).toBe(true);
      }
    });
    test('exists - false', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(await wrapper.exists({ name: 'Bob' })).toBe(false);
      }
    });
    test('upsert - update existing', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        const result = await wrapper.upsert(
          { name: 'Bobi' },
          new TestEntity({
            name: 'Bobi',
            age: 31,
            address: 'home',
            time: null,
            raw: null,
            json: null,
          }),
        );
        expect(result.age).toBe(31);
        expect(await wrapper.count()).toBe(4);
        await wrapper.updateObject(result.e_id, { age: 30 });
      }
    });
    test('upsert - create new', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        const result = await wrapper.upsert(
          { name: 'Temp' },
          new TestEntity({
            name: 'Temp',
            age: 5,
            address: null,
            time: null,
            raw: null,
            json: null,
          }),
        );
        expect(result.name).toBe('Temp');
        expect(await wrapper.count()).toBe(5);
        await wrapper.delete(result.e_id);
        expect(await wrapper.count()).toBe(4);
      }
    });
    test('findOrCreate - existing', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        const { entity: et, created } = await wrapper.findOrCreate(
          { name: 'Bobi' },
          new TestEntity({
            name: 'Bobi',
            age: 30,
            address: 'home',
            time: null,
            raw: null,
            json: null,
          }),
        );
        expect(created).toBe(false);
        expect(et.name).toBe('Bobi');
        expect(await wrapper.count()).toBe(4);
      }
    });
    test('findOrCreate - new', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        const { entity: et, created } = await wrapper.findOrCreate(
          { name: 'NewGuy' },
          new TestEntity({
            name: 'NewGuy',
            age: 50,
            address: null,
            time: null,
            raw: null,
            json: null,
          }),
        );
        expect(created).toBe(true);
        expect(et.name).toBe('NewGuy');
        expect(await wrapper.count()).toBe(5);
        await wrapper.delete(et.e_id);
        expect(await wrapper.count()).toBe(4);
      }
    });
    test('delete-bulk', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect((await wrapper.getObjList()).length).toBe(4);
        expect(
          await wrapper.deleteBulk([entity4.e_id, entity5.e_id]),
        ).toBeTruthy();
        expect((await wrapper.getObjList()).length).toBe(2);
      }
    });
    test('delete', async () => {
      expect(wrapper).not.toBeUndefined();
      expect(wrapper2).not.toBeUndefined();

      if (wrapper2) {
        expect((await wrapper2.getObjList()).length).toBe(1);
        expect(await wrapper2.delete(entity3.e_id)).toBeTruthy();
        expect((await wrapper2.getObjList()).length).toBe(0);
      }
      if (wrapper) {
        expect(await wrapper.delete(entity.e_id)).toBeTruthy();
        expect((await wrapper.getObjList()).length).toBe(1);
        expect(await wrapper.delete(entity2.e_id)).toBeTruthy();
        expect((await wrapper.getObjList()).length).toBe(0);
      }
    });
    test('full validation', () => {
      expect(validateEntity(entity)).toBeTruthy();
    });
  });

  describe.each([
    ['noCache', false],
    ['withCache', true],
  ])('Bulk Entity :(%s):', (name: string, hasCace: boolean) => {
    let wrapper: undefined | CoreEntityWrapper<TestEntity>;
    const idList: string[] = [];
    const max = 100;
    test('get wrapper class', async () => {
      const mod = kernel.getChildModule('testModule') as ICoreKernelModule<
        any,
        any,
        any,
        any,
        any
      >;
      const db = mod.getDb() as CoreDBCon<any, any>;
      wrapper = db.getEntityWrapper<TestEntity>('TestEntity');
      if (wrapper) {
        if (hasCace) {
          wrapper.cache = mod.getCache() || new InMemCache(mod);
        } else {
          wrapper.cache = null;
        }
      }
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect((await wrapper.getObjList()).length).toBe(0);
      }
    });
    test('create new', async () => {
      expect(wrapper).not.toBeUndefined();
      expect(wrapper).not.toBeNull();
      if (wrapper) {
        for (let i = 0; i < max; i++) {
          let entity: TestEntity = new TestEntity({
            name: 'Bob',
            age: i,
            address: 'home',
            time: new Date(),
            raw: null,
            json: { some: 'value', index: i },
          });
          entity = (await wrapper.createObject(entity)) || entity;
          expect(entity.e_id).not.toBeNull();
          idList.push(entity.e_id);
          expect((await wrapper.getObjList()).length).toBe(i + 1);
          expect(
            (
              await wrapper.getObjList({
                search: { time: entity.time },
              })
            ).length,
          ).toBeGreaterThanOrEqual(1);
        }
      } else {
        expect(false).toBeTruthy();
      }
    });
    test('listing search id limit 0', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(await wrapper.getObjList({ limit: 0 })).toHaveLength(0);
      }
    });
    test('listing search id limit 1', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(await wrapper.getObjList({ limit: 1 })).toHaveLength(1);
      }
    });
    test('listing search id limit 2', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        expect(await wrapper.getObjList({ limit: 2 })).toHaveLength(2);
      }
    });
    test('test offset', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        const first = (await wrapper.getObjList({ limit: 1 }))[0];
        const sec = (await wrapper.getObjList({ limit: 1, offset: 1 }))[0];
        expect(first.e_id).not.toBe(sec.e_id);
      }
    });

    test('listing search id limit ASC DESC', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        const a = await wrapper.getObjList({
          limit: 2,
          order: [{ key: 'e_id', order: 'ASC' }],
        });
        const b = await wrapper.getObjList({
          limit: 2,
          order: [{ key: 'e_id', order: 'DESC' }],
        });
        expect(a.length).toBe(2);
        expect(b.length).toBe(2);
        expect(a[0].e_id !== b[0].e_id).toBeTruthy();
      }
    });
    test('delete', async () => {
      expect(wrapper).not.toBeUndefined();
      if (wrapper) {
        for (const el of idList) {
          expect(await wrapper.delete(el)).toBeTruthy();
        }
        expect((await wrapper.getObjList()).length).toBe(0);
      }
    });
  });
  describe('CoreDBPrefab delegating methods', () => {
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
  describe('DBEdgeCase edge cases', () => {
    let db: IDataBase<any, any>;

    beforeAll(() => {
      const mod = kernel.getChildModule<TestModule>('testModule');
      db = mod.getDb() as IDataBase<any, any>;
    });

    test('execScripts returns empty array', async () => {
      const result = await db.execScripts([]);
      expect(result).toHaveLength(0);
    });
    test('getRawDBObject returns e_map and map', async () => {
      const raw = await (db.getRawDBObject() as any);
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
      let wrapper: CoreEntityWrapper<TestEntity>;
      beforeAll(async () => {
        wrapper = await db.registerEntity(new TestEntity(), false);
        await db.setConfig('dbversion', '0');
        await wrapper.createObject(
          new TestEntity({
            address: null,
            json: null,
            raw: null,
            time: null,
            name: 'Alice',
            age: 25,
          }),
        );
        await wrapper.createObject(
          new TestEntity({
            address: null,
            json: null,
            raw: null,
            time: null,
            name: 'Bob',
            age: 30,
          }),
        );
      });

      test('not mode excludes matching value', async () => {
        const result = await wrapper.getObjList({
          search: { name: { mode: 'not', value: 'Alice' } } as any,
        });
        expect(result).toHaveLength(1);
        expect((result[0] as any).name).toBe('Bob');
      });
      test('between with < 2 elements returns no match', async () => {
        const result = await wrapper.getObjList({
          search: { age: { mode: 'between', value: [20] } } as any,
        });
        expect(result).toHaveLength(0);
      });
      test('between with non-array value returns no match', async () => {
        const result = await wrapper.getObjList({
          search: { age: { mode: 'between', value: 25 } } as any,
        });
        expect(result).toHaveLength(0);
      });
      test('default/unknown mode returns no match', async () => {
        const result = await wrapper.getObjList({
          search: { name: { mode: 'unknownMode', value: 'x' } } as any,
        });
        expect(result).toHaveLength(0);
      });
      test('updateEntity - entity not found throws', async () => {
        await expect(
          wrapper.updateObject('nonexistent-id', { name: 'X' } as any),
        ).rejects.toThrow();
      });
      test('countEntity without search returns total', async () => {
        const count = await wrapper.count();
        expect(count).toBe(2);
      });
      test('getEntityList with offset beyond length returns []', async () => {
        const result = await wrapper.getObjList({
          offset: 9999,
        });
        expect(result).toHaveLength(0);
      });
    });
  });
}

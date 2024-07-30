import TestEntity from '../testClass/db/entity/TestEntity.js';
import {
  CoreDBCon,
  CoreDBPrefab,
  CoreEntityWrapper,
  validateEntity,
} from '../../classes/index.js';
import { ICoreKernelModule } from '../../lib/index.js';
import TestPrefab from '../testClass/db/TestPrefab.js';

import TestEntityLinked from '../testClass/db/entity/TestEntityLinked.js';
import { EntityValidator } from '../../utils/index.js';
import TestContext from '../TestContext.js';
import { InMemCache } from '../../modules/index.js';

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
    test('listing search bob check date', async () => {
      expect(wrapper).not.toBeUndefined();

      if (wrapper) {
        const bonb = await wrapper.getObjList({
          search: { name: 'Bob' },
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
            e_id: entity.e_id,
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
}

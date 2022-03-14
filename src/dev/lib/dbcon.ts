import TestEntity from '../testClass/db/entity/TestEntity';
import {
  CoreDBCon,
  CoreDBPrefab,
  CoreEntityWrapper,
  validateEntity,
} from '../../classes';
import { ICoreKernelModule } from '../../lib';
import TestPrefab from '../testClass/db/TestPrefab';

import TestEntityLinked from '../testClass/db/entity/TestEntityLinked';
import { TestContext } from '../../index';

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

describe('Entity', () => {
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
        })
      ).toHaveLength(1);
    }
  });
  test('listing search fk id', async () => {
    expect(wrapper2).not.toBeUndefined();
    if (wrapper2) {
      expect(
        await wrapper2.getObjList({
          search: { link: entity.e_id },
        })
      ).toHaveLength(1);
    }
  });
  test('listing search bob', async () => {
    expect(wrapper).not.toBeUndefined();
    if (wrapper) {
      expect(
        await wrapper.getObjList({
          search: { name: 'Bob' },
        })
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
        })
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
describe('Bulk Entity', () => {
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
          ).length
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

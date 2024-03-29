import {
  CoreDBCon,
  CoreDBPrefab,
  CoreEntityWrapper,
} from '../../../classes/index.js';
import TestDBUpdate01 from './TestDBUpdate01.js';
import TestDBUpdate02 from './TestDBUpdate02.js';
import TestEntity from './entity/TestEntity.js';
import TestEntityLinked from './entity/TestEntityLinked.js';

export default class TestPrefab extends CoreDBPrefab<CoreDBCon<any, any>> {
  ent: CoreEntityWrapper<TestEntity>;

  entL: CoreEntityWrapper<TestEntityLinked>;

  constructor(db: CoreDBCon<any, any>) {
    super(db);
    this.setEntityCache(true);
    this.ent = this.registerEntity(new TestEntity());
    this.entL = this.registerEntity(new TestEntityLinked());
    db.setUpdateChain(new TestDBUpdate01(db), new TestDBUpdate02(db));
  }

  async initPrefabDB(): Promise<void> {
    const i = new TestEntity({
      address: '',
      age: 0,
      json: undefined,
      name: '',
      raw: Buffer.from(''),
      time: new Date(),
    });
    await this.ent.createObject(i);
    await this.ent.delete(i.e_id);
  }
}

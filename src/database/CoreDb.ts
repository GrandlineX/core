import { randomUUID } from 'crypto';
import GKey from './entity/GKey';
import { CoreDBCon, CoreDBPrefab, CoreEntityWrapper } from '../classes';
import { generateSeed } from '../modules/crypto/utils';
import { ICoreDb } from '../lib';

export const CORE_DB_VERSION = '0';

export default class CoreDb extends CoreDBPrefab<any> implements ICoreDb {
  private gKey: CoreEntityWrapper<GKey>;

  constructor(db: CoreDBCon<any, any>) {
    super(db);
    this.gKey = this.registerEntity<GKey>(new GKey());
  }

  async initPrefabDB(): Promise<void> {
    const seed = generateSeed();
    await this.setConfig('seed', seed);
    await this.setConfig('uid', randomUUID());
  }

  async deleteKey(e_id: string): Promise<void> {
    await this.gKey.delete(e_id);
  }

  getKey(e_id: string): Promise<GKey | null> {
    return this.gKey.getObjById(e_id);
  }

  async setKey(secret: string, iv: Buffer, auth: Buffer): Promise<string> {
    return (await this.gKey.createObject(new GKey({ secret, iv, auth }))).e_id;
  }
}

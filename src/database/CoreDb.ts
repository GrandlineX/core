import { randomUUID } from 'crypto';
import GKey from './entity/GKey.js';
import {
  CoreDBCon,
  CoreDBPrefab,
  CoreEntityWrapper,
} from '../classes/index.js';
import { generateSeed } from '../modules/index.js';
import { ICoreDb } from '../lib/index.js';

export const CORE_DB_VERSION = '0';

/**
 * CoreDb handles the storage, retrieval, and deletion of cryptographic keys (GKey entities) within the underlying database.
 *
 * @class
 * @extends CoreDBPrefab<any>
 * @implements ICoreDb
 *
 * @constructor
 * @param {CoreDBCon<any, any>} db - The CoreDBCon instance that this CoreDb wraps.
 *
 * @method initPrefabDB
 * @returns {Promise<void>}
 * @description Generates a seed and a unique identifier, then stores them in the configuration. This method is called to initialize the prefab database.
 *
 * @method deleteKey
 * @param {string} e_id - The identifier of the GKey to delete.
 * @returns {Promise<void>}
 * @description Removes the GKey identified by `e_id` from the database.
 *
 * @method getKey
 * @param {string} e_id - The identifier of the GKey to retrieve.
 * @returns {Promise<GKey|null>}
 * @description Retrieves a GKey object by its identifier. Returns `null` if no matching key is found.
 *
 * @method setKey
 * @param {string} secret - The secret key value.
 * @param {Buffer} iv - The initialization vector.
 * @param {Buffer} auth - The authentication data.
 * @returns {Promise<string>}
 * @description Creates a new GKey entry with the provided parameters and returns the newly generated identifier.
 */
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

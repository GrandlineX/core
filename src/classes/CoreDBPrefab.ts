import {
  ConfigType,
  IBaseDBUpdate,
  ICoreCache,
  IDataBase,
  RawQuery,
} from '../lib';
import CoreEntity from './CoreEntity';
import CoreEntityWrapper from './CoreEntityWrapper';
import CoreElement from './CoreElement';
import { EntityConfig, EOrderBy, EUpDateProperties } from './annotation';
import CoreDBCon from './CoreDBCon';

export default class CoreDBPrefab<T extends CoreDBCon<any, any>>
  extends CoreElement
  implements IDataBase<unknown, unknown>
{
  db: T;

  constructor(db: T) {
    super(`db${db.getModule().getName()}`, db.getModule());
    this.db = db;
  }

  getPrefabDB() {
    return this.db;
  }

  setEntityCache(status: boolean) {
    this.db.setEntityCache(status);
  }

  registerEntity<E extends CoreEntity>(ent: E): CoreEntityWrapper<E> {
    return this.db.registerEntity<E>(ent);
  }

  getEntityWrapper<E extends CoreEntity>(
    className: string
  ): CoreEntityWrapper<E> | undefined {
    return this.db.getEntityWrapper<E>(className);
  }

  setUpdateChain(...chain: IBaseDBUpdate[]): void {
    this.db.setUpdateChain(...chain);
  }

  async canUpdate(): Promise<boolean> {
    return this.db.canUpdate();
  }

  async getCurrenDBVersion(): Promise<string> {
    return this.getCurrenDBVersion();
  }

  async update(): Promise<boolean> {
    return this.update();
  }

  isConnected(): boolean {
    return this.db.isConnected();
  }

  setConnected(): void {
    this.db.setConnected();
  }

  async start(): Promise<void> {
    await this.db.start();
  }

  async disconnect(): Promise<boolean> {
    return this.db.disconnect();
  }

  async connect(): Promise<boolean> {
    return this.db.connect();
  }

  async execScripts(list: RawQuery[]): Promise<T[]> {
    return this.db.execScripts(list);
  }

  async getConfig(key: string): Promise<ConfigType | undefined> {
    return this.db.getConfig(key);
  }

  async setConfig(key: string, value: string): Promise<boolean> {
    return this.db.setConfig(key, value);
  }

  async configExist(key: string): Promise<boolean> {
    return this.db.configExist(key);
  }

  async removeConfig(key: string): Promise<void> {
    return this.db.removeConfig(key);
  }

  async getRawDBObject(): Promise<unknown> {
    return this.db.getRawDBObject();
  }

  async initNewDB(): Promise<void> {
    return this.db.initNewDB();
  }

  /**
   * Create new Entity object
   * @param config
   * @param entity
   */
  async createEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    entity: E
  ): Promise<E> {
    return this.db.createEntity<E>(config, entity);
  }

  /**
   * Update Entity object
   * @param config
   * @param e_id
   * @param entity
   */
  async updateEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    e_id: number,
    entity: EUpDateProperties<E>
  ): Promise<boolean> {
    return this.db.updateEntity<E>(config, e_id, entity);
  }

  /**
   * Get Entity object by ID
   * @param config
   * @param id
   */
  async getEntityById<E extends CoreEntity>(
    config: EntityConfig<E>,
    id: number
  ): Promise<E | null> {
    return this.db.getEntityById<E>(config, id);
  }

  /**
   * Delete Entity object by ID
   * @param className
   * @param id
   */
  async deleteEntityById(className: string, id: number): Promise<boolean> {
    return this.db.deleteEntityById(className, id);
  }

  /**
   * Get Entity object list
   * @param config
   * @param limit
   * @param search
   * @param order
   */
  async getEntityList<E extends CoreEntity>(
    config: EntityConfig<E>,
    limit?: number,
    search?: {
      [P in keyof E]?: E[P];
    },
    order?: EOrderBy<E>
  ): Promise<E[]> {
    return this.db.getEntityList<E>(config, limit, search, order);
  }

  /**
   * Get Entity object list
   * @param config
   * @param search
   */
  async findEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    search: {
      [P in keyof E]?: E[P];
    }
  ): Promise<E | null> {
    return this.db.findEntity<E>(config, search);
  }

  /**
   * Init Entity object list
   * @param className
   * @param entity
   */
  async initEntity<E extends CoreEntity>(
    className: string,
    entity: E
  ): Promise<boolean> {
    return this.db.initEntity<E>(className, entity);
  }

  getCache<E extends ICoreCache>(): E | null {
    return this.db.getCache<E>();
  }
}

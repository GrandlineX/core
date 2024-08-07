import {
  ConfigType,
  IBaseDBUpdate,
  IDataBase,
  QueryInterface,
  RawQuery,
} from '../lib/index.js';
import CoreEntity from './CoreEntity.js';
import CoreEntityWrapper from './CoreEntityWrapper.js';
import CoreElement from './CoreElement.js';
import {
  ColumnPropMap,
  EntityConfig,
  EUpDateProperties,
  IEntity,
} from './annotation/index.js';
import CoreDBCon from './CoreDBCon.js';

export default abstract class CoreDBPrefab<
    T extends CoreDBCon<any, any, any, any, any, any, any>,
  >
  extends CoreElement
  implements IDataBase<unknown, unknown>
{
  db: T;

  constructor(db: T) {
    super(`db${db.getModule().getName()}`, db.getModule());
    this.db = db;
  }

  abstract initPrefabDB(): Promise<void>;

  getEntityMeta(): { key: string; meta: ColumnPropMap<any> }[] {
    return this.db.getEntityMeta();
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
    className: string,
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
    return this.db.getCurrenDBVersion();
  }

  async update(): Promise<boolean> {
    return this.db.update();
  }

  isConnected(): boolean {
    return this.db.isConnected();
  }

  setConnected(): void {
    this.db.setConnected();
  }

  async start(): Promise<void> {
    await this.db.start();
    if (this.db.getNew()) {
      await this.initPrefabDB();
    }
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
    await this.db.initNewDB();
    await this.initPrefabDB();
  }

  /**
   * Create new Entity object
   * @param config
   * @param entity
   */
  async createEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    entity: E,
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
    e_id: string,
    entity: EUpDateProperties<E>,
  ): Promise<boolean> {
    return this.db.updateEntity<E>(config, e_id, entity);
  }

  /**
   * Update Entity objects
   * @param config
   * @param e_id
   * @param entity
   */
  async updateBulkEntity<E extends IEntity>(
    config: EntityConfig<E>,
    e_id: string[],
    entity: EUpDateProperties<E>,
  ): Promise<boolean> {
    return this.db.updateBulkEntity(config, e_id, entity);
  }

  /**
   * Get Entity object by ID
   * @param config
   * @param id
   */
  async getEntityById<E extends CoreEntity>(
    config: EntityConfig<E>,
    id: string,
  ): Promise<E | null> {
    return this.db.getEntityById<E>(config, id);
  }

  /**
   * Get Entity objects by ID
   * @param config
   * @param id
   */
  async getEntityBulkById<E extends CoreEntity>(
    config: EntityConfig<E>,
    id: string[],
  ): Promise<E[]> {
    return this.db.getEntityBulkById<E>(config, id);
  }

  /**
   * Delete Entity object by ID
   * @param className
   * @param e_id
   */
  async deleteEntityById(className: string, e_id: string): Promise<boolean> {
    return this.db.deleteEntityById(className, e_id);
  }

  /**
   * Delete Entity objects by ID
   * @param className
   * @param e_id
   */
  deleteEntityBulkById(className: string, e_id: string[]): Promise<boolean> {
    return this.db.deleteEntityBulkById(className, e_id);
  }

  /**
   * Get Entity object list
   * @param query
   */
  async getEntityList<E extends CoreEntity>(
    query: QueryInterface<E>,
  ): Promise<E[]> {
    return this.db.getEntityList<E>(query);
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
    },
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
    entity: E,
  ): Promise<boolean> {
    return this.db.initEntity<E>(className, entity);
  }

  getCache() {
    return this.db.getCache();
  }
}

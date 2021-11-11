import {
  ConfigType,
  IBaseDBUpdate,
  ICoreKernelModule,
  IDataBase,
  RawQuery,
} from '../lib';
import CoreLogChannel from './CoreLogChannel';
import CoreEntity, { ICoreEntityHandler } from './CoreEntity';

export default abstract class CoreDBCon<T>
  extends CoreLogChannel
  implements IDataBase<T>, ICoreEntityHandler
{
  dbversion: string;

  updater: IBaseDBUpdate | null;

  public schemaName: string;

  private conected: boolean;

  protected constructor(
    dbversion: string,
    schemaName: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(`db${module.getName()}`, module);
    this.conected = false;
    this.dbversion = dbversion;
    this.updater = null;
    this.schemaName = schemaName;
    this.debug = this.debug.bind(this);
  }

  /**
   * returns true if init new db should be triggered
   */
  abstract isNew(): Promise<boolean>;

  setUpdateChain(chain: IBaseDBUpdate): void {
    this.updater = chain;
  }

  async canUpdate(): Promise<boolean> {
    const version = await this.getConfig('dbversion');
    if (version) {
      return version.c_value !== this.dbversion;
    }
    return false;
  }

  async getCurrenDBVersion(): Promise<string> {
    const version = await this.getConfig('dbversion');
    return version?.c_value || '';
  }

  async update(): Promise<boolean> {
    if (this.updater && (await this.canUpdate())) {
      const update = this.updater.find(await this.getCurrenDBVersion());
      if (update) {
        return update.update();
      }
    }
    return true;
  }

  isConected(): boolean {
    return this.conected;
  }

  setConnected(): void {
    this.conected = true;
  }

  async start(): Promise<void> {
    await this.connect();
    if (await this.canUpdate()) {
      await this.update();
    }
    if (await this.isNew()) {
      await this.initNewDB();
    }
  }

  abstract disconnect(): Promise<boolean>;

  abstract connect(): Promise<boolean>;

  abstract execScripts(list: RawQuery[]): Promise<T[]>;

  abstract getConfig(key: string): Promise<ConfigType | undefined>;

  abstract setConfig(key: string, value: string): Promise<boolean>;

  abstract configExist(key: string): Promise<boolean>;

  abstract removeConfig(key: string): Promise<void>;

  abstract getRawDBObject(): T | null;

  abstract initNewDB(): Promise<void>;

  /**
   * Create new Entity object
   * @param entity
   */
  abstract createEntity<E extends CoreEntity<any>>(
    entity: E
  ): Promise<E | null>;

  /**
   * Update Entity object
   * @param entity
   */
  abstract updateEntity<E extends CoreEntity<any>>(
    entity: E
  ): Promise<E | null>;

  /**
   * Get Entity object by ID
   * @param entity
   * @param id
   */
  abstract getEntityById<E extends CoreEntity<any>>(
    entity: E,
    id: number
  ): Promise<E | null>;

  /**
   * Delete Entity object by ID
   * @param entity
   * @param id
   */
  abstract deleteEntityById<E extends CoreEntity<any>>(
    entity: E,
    id: number
  ): Promise<boolean>;

  /**
   * Get Entity object list
   * @param entity
   */
  abstract getEntityList<E extends CoreEntity<any>>(entity: E): Promise<E[]>;
  /**
   * Init Entity object list
   * @param entity
   */
  abstract initEntity<E extends CoreEntity<any>>(entity: E): Promise<boolean>;
}

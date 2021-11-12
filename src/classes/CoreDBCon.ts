import {
  ConfigType,
  IBaseDBUpdate,
  ICoreKernelModule,
  IDataBase,
  RawQuery,
} from '../lib';
import CoreLogChannel from './CoreLogChannel';
import CoreEntity, { ICoreEntityHandler } from './CoreEntity';
import CoreEntityWrapper from './CoreEntityWrapper';

export default abstract class CoreDBCon<D, T>
  extends CoreLogChannel
  implements IDataBase<D, T>, ICoreEntityHandler
{
  dbVersion: string;

  updater: IBaseDBUpdate | null;

  public schemaName: string;

  private connected: boolean;

  private wrapperMap: Map<string, CoreEntityWrapper<any>>;

  private isNew: boolean;

  protected constructor(
    dbVersion: string,
    schemaName: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(`db${module.getName()}`, module);
    this.wrapperMap = new Map<string, CoreEntityWrapper<any>>();
    this.connected = false;
    this.dbVersion = dbVersion;
    this.updater = null;
    this.schemaName = schemaName;
    this.isNew = false;
    this.debug = this.debug.bind(this);
  }

  /**
   * trigger the db init
   */
  protected setNew(val: boolean): void {
    this.isNew = val;
  }

  registerEntity<E extends CoreEntity>(ent: E): void {
    const cName = ent.constructor.name;
    this.wrapperMap.set(
      cName,
      new CoreEntityWrapper(this, cName, () => {
        return ent;
      })
    );
  }

  getEntityWrapper<E extends CoreEntity>(
    className: string
  ): CoreEntityWrapper<E> | undefined {
    return this.wrapperMap.get(className);
  }

  setUpdateChain(chain: IBaseDBUpdate): void {
    this.updater = chain;
  }

  async canUpdate(): Promise<boolean> {
    const version = await this.getConfig('dbversion');
    if (version) {
      return version.c_value !== this.dbVersion;
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

  isConnected(): boolean {
    return this.connected;
  }

  setConnected(): void {
    this.connected = true;
  }

  async start(): Promise<void> {
    await this.connect();
    if (await this.canUpdate()) {
      await this.update();
    }
    if (this.isNew) {
      const keys = this.wrapperMap.keys();
      let key = keys.next().value;
      while (key) {
        const ins = this.wrapperMap.get(key)?.getIns();
        if (ins) {
          await this.initEntity(ins);
        }
        key = keys.next().value;
      }

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

  abstract getRawDBObject(): D | null;

  abstract initNewDB(): Promise<void>;

  /**
   * Create new Entity object
   * @param entity
   */
  abstract createEntity<E extends CoreEntity>(entity: E): Promise<E | null>;

  /**
   * Update Entity object
   * @param entity
   */
  abstract updateEntity<E extends CoreEntity>(entity: E): Promise<E | null>;

  /**
   * Get Entity object by ID
   * @param className
   * @param id
   */
  abstract getEntityById<E extends CoreEntity>(
    className: string,
    id: number
  ): Promise<E | null>;

  /**
   * Delete Entity object by ID
   * @param className
   * @param id
   */
  abstract deleteEntityById(className: string, id: number): Promise<boolean>;

  /**
   * Get Entity object list
   * @param className
   */
  abstract getEntityList<E extends CoreEntity>(className: string): Promise<E[]>;
  /**
   * Init Entity object list
   * @param entity
   */
  abstract initEntity<E extends CoreEntity>(entity: E): Promise<boolean>;
}

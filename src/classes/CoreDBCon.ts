import {
  ConfigType,
  IBaseDBUpdate,
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
  QueryInterface,
  RawQuery,
} from '../lib';
import CoreEntity from './CoreEntity';
import CoreEntityWrapper from './CoreEntityWrapper';
import CoreElement from './CoreElement';
import {
  ColumnPropMap,
  EntityConfig,
  EUpDateProperties,
  validateEntity,
} from './annotation';
import { XUtil } from '../utils';

export default abstract class CoreDBCon<
    D,
    T,
    K extends ICoreKernel<any> = ICoreKernel<any>,
    X extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    Y extends ICorePresenter<any> | null = any
  >
  extends CoreElement<K, X, P, C, Y>
  implements IDataBase<D, T>
{
  dbVersion: string;

  updater: IBaseDBUpdate | null;

  public schemaName: string;

  private connected: boolean;

  private cacheEnabled: boolean;

  private wrapperMap: Map<string, CoreEntityWrapper<any>>;

  private isNew: boolean;

  protected constructor(
    dbVersion: string,
    schemaName: string,
    module: ICoreKernelModule<K, X, P, C, Y>
  ) {
    super(`db${module.getName()}`, module);
    this.wrapperMap = new Map<string, CoreEntityWrapper<any>>();
    this.connected = false;
    this.dbVersion = dbVersion;
    this.updater = null;
    this.schemaName = schemaName;
    this.isNew = false;
    this.cacheEnabled = false;
    this.debug = this.debug.bind(this);
  }

  setEntityCache(status: boolean) {
    this.cacheEnabled = status;
  }

  registerEntity<E extends CoreEntity>(ent: E): CoreEntityWrapper<E> {
    if (!validateEntity(ent)) {
      this.error(`Invalid Entity: ${ent.constructor.name}`);
      throw this.lError('Invalid Entity');
    }
    const cName = XUtil.getEntityNames(ent);
    const wrapper = new CoreEntityWrapper(this, cName.tableName, () => {
      return ent;
    });
    this.wrapperMap.set(cName.className, wrapper);
    return wrapper;
  }

  getEntityWrapper<E extends CoreEntity>(
    className: string
  ): CoreEntityWrapper<E> | undefined {
    return this.wrapperMap.get(className);
  }

  getEntityMeta() {
    const out: { key: string; meta: ColumnPropMap<any> }[] = [];
    this.wrapperMap.forEach((value, key) => {
      out.push({
        key,
        meta: value.getPropMap(),
      });
    });
    return out;
  }

  setUpdateChain(...chain: IBaseDBUpdate[]): void {
    const [first] = chain;
    if (!first) {
      this.error('No element in update chain');
      return;
    }
    this.updater = first;
    chain.forEach((el, index) => {
      if (index < chain.length - 1) {
        el.setNext(chain[index + 1]);
      }
    });
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
    if (!(await this.connect())) {
      this.error('Cant connect to Database');
      process.exit(3);
    }
    if (await this.canUpdate()) {
      await this.update();
    }
    if (this.isNew) {
      const keys = this.wrapperMap.keys();
      let key = keys.next().value;
      while (key) {
        const wrapper = this.wrapperMap.get(key);
        if (wrapper) {
          await wrapper.init();
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
   * @param config
   * @param entity
   */
  abstract createEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    entity: E
  ): Promise<E>;

  /**
   * Update Entity object
   * @param config
   * @param e_id
   * @param entity
   */
  abstract updateEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    e_id: string,
    entity: EUpDateProperties<E>
  ): Promise<boolean>;

  /**
   * Get Entity object by ID
   * @param config
   * @param e_id
   */
  abstract getEntityById<E extends CoreEntity>(
    config: EntityConfig<E>,
    e_id: string
  ): Promise<E | null>;

  /**
   * Delete Entity object by ID
   * @param className
   * @param id
   */
  abstract deleteEntityById(className: string, e_id: string): Promise<boolean>;

  /**
   * Get Entity object list
   * @param query search query config
   */
  abstract getEntityList<E extends CoreEntity>(
    query: QueryInterface<E>
  ): Promise<E[]>;

  /**
   * Get Entity object list
   * @param config
   * @param search
   */
  abstract findEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    search: {
      [B in keyof E]?: E[B];
    }
  ): Promise<E | null>;

  /**
   * Init Entity object list
   * @param className
   * @param entity
   */
  abstract initEntity<E extends CoreEntity>(
    className: string,
    entity: E
  ): Promise<boolean>;

  getCache(): C | null {
    if (!this.cacheEnabled) {
      return null;
    }
    return this.getModule().getCache();
  }

  /**
   * get the db trigger value
   */
  getNew(): boolean {
    return this.isNew;
  }

  /**
   * trigger the db init
   */
  protected setNew(val: boolean): void {
    this.isNew = val;
  }
}

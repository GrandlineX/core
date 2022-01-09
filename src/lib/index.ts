import CoreLogger from '../classes/CoreLogger';
import {
  ColumnPropMap,
  EntityConfig,
  EOrderBy,
  EProperties,
  EUpDateProperties,
  IEntity,
} from '../classes/annotation';

export interface ICoreEntityHandler {
  getEntityMeta(): { key: string; meta: ColumnPropMap<any> }[];

  getCache<E extends ICoreCache>(): E | null;

  createEntity<E extends IEntity>(
    config: EntityConfig<E>,
    entity: EProperties<E>
  ): Promise<E>;

  updateEntity<E extends IEntity>(
    config: EntityConfig<E>,
    e_id: number,
    entity: EUpDateProperties<E>
  ): Promise<boolean>;

  getEntityById<E extends IEntity>(
    config: EntityConfig<E>,
    e_id: number
  ): Promise<E | null>;

  deleteEntityById(className: string, id: number): Promise<boolean>;

  getEntityList<E extends IEntity>(
    config: EntityConfig<E>,
    limit?: number,
    search?: {
      [P in keyof E]?: E[P];
    },
    order?: EOrderBy<E>
  ): Promise<E[]>;

  findEntity<E extends IEntity>(
    config: EntityConfig<E>,
    search: {
      [P in keyof E]?: E[P];
    }
  ): Promise<E | null>;

  initEntity<E extends IEntity>(className: string, entity: E): Promise<boolean>;
}

/**
 * Trigger:
 * - pre = executed before modules load
 * - load = executed before modules load except the base module
 * - start = executed after modules load
 * - stop = executed before modules stopped
 */
export type KernelTrigger = 'pre' | 'load' | 'start' | 'stop';

export enum BridgeState {
  'init',
  'ready',
  'end',
}

export type ServiceStates = 'INIT' | 'RUNNING' | 'SLEEPING';

export interface ICoreCache {
  start(): Promise<void>;

  set(key: string, val: string): Promise<void>;

  get(key: string): Promise<string | null>;

  delete(key: string): Promise<void>;

  clearAll(): Promise<void>;

  exist(key: string): Promise<boolean>;

  setE<E extends IEntity>(className: string, val: E): Promise<void>;

  getE<E extends IEntity>(className: string, e_id: number): Promise<E | null>;

  deleteE(className: string, e_id: number): Promise<boolean>;

  clearAllE(className: string): Promise<void>;

  stop(): Promise<void>;
}

export interface ICoreCClient {
  encrypt(message: string): {
    auth: Buffer;
    iv: Buffer;
    enc: string;
  };

  decrypt(enc: string, iv: Buffer, authTag: Buffer): string;

  isValid(): boolean;

  generateSecureToken(length: number): Promise<string>;

  getHash(seed: string, val: string): string;
}

export interface ICoreKernel<X extends ICoreCClient>
  extends ILogChannel,
    IHaveLogger {
  start(): Promise<boolean>;

  stop(): Promise<boolean>;

  setState(message: string): void;

  getState(): string;

  getAppCode(): string;

  getAppName(): string;

  setCryptoClient(crypto: X | null): void;

  getCryptoClient(): X | null;

  hasCryptoClient(): boolean;

  triggerFunction(triger: KernelTrigger): Promise<void>;

  setTriggerFunction(
    trigger: KernelTrigger,
    triggerFunc: (ik: ICoreKernel<X>) => Promise<void>
  ): void;

  getDb(): IDataBase<any, any> | null;

  addModule(module: ICoreAnyModule): void;

  getModule(): ICoreAnyModule;

  getOffline(): boolean;

  setOffline(mode: boolean): void;

  getDevMode(): boolean;

  setDevMode(mode: boolean): void;

  getConfigStore(): IStore;
}

export type ICoreClient = ICoreElement;
export type ICoreAnyModule = ICoreKernelModule<any, any, any, any, any>;
export interface ICoreKernelModule<
  K extends ICoreKernel<any>,
  T extends IDataBase<any, any> | null,
  P extends ICoreClient | null,
  C extends ICoreCache | null,
  E extends ICorePresenter<any> | null
> extends ILogChannel,
    IHaveLogger {
  addSrcBridge(bridge: ICoreBridge): void;

  addTarBridge(bridge: ICoreBridge): void;

  getBridges(): ICoreBridge[];

  getDependencyList(): string[];

  register(): Promise<void>;

  shutdown(): Promise<void>;

  start(): Promise<void>;

  final(): Promise<void>;

  startup(): Promise<void>;

  beforeServiceStart(): Promise<void>;

  addAction(...action: ICoreAction[]): void;

  addService(...service: ICoreService[]): void;

  getServiceList(): ICoreService[];

  getKernel(): K;

  getDb(): T;

  setDb(db: T): void;

  hasDb(): boolean;

  getClient(): P;

  setClient(client: P): void;

  hasClient(): boolean;

  getPresenter(): E;

  setPresenter(presenter: E): void;

  hasPresenter(): boolean;

  getCache(): C;

  setCache(cache: C): void;

  hasCache(): boolean;

  getBridgeModule<M extends ICoreAnyModule>(name: string): M | undefined;
}

export interface ICorePresenter<E> extends ICoreElement {
  start(): Promise<boolean>;

  stop(): Promise<boolean>;

  getApp(): E;
}

export interface ICoreElement extends ILogChannel {
  getKernel(): ICoreKernel<any>;

  getModule<M extends ICoreAnyModule>(): M;
}

export interface ICoreAction extends ICoreElement {
  register(): void;
}

export interface ICoreService extends ICoreElement {
  start(): Promise<any>;

  stop(): Promise<any>;
}

export interface ICoreBridge {
  connect(): void;

  setState(state: BridgeState): void;

  waitForState(state: BridgeState): Promise<boolean>;

  getTarget(): ICoreAnyModule;
}

export type WorkLoad<T> = Promise<T>[];

export interface ILogChannel {
  log(...ags: unknown[]): void;

  debug(...ags: unknown[]): void;

  info(...ags: unknown[]): void;

  error(...ags: unknown[]): void;

  warn(...ags: unknown[]): void;

  verbose(...ags: unknown[]): void;

  lError(message: string): Error;

  getName(): string;
}

export interface ConfigType {
  c_key: string;
  c_value: string;
}

export interface RawQuery {
  exec: string;
  param: any[];
}

export interface IBaseDBUpdate {
  update(): Promise<boolean>;

  performe(): Promise<boolean>;

  updateNext(): Promise<boolean>;

  setNext(db: IBaseDBUpdate): void;

  find(version: string): IBaseDBUpdate | null;

  getDb(): IDataBase<any, any>;

  getSource(): string;
}

export interface IDataBase<D, T> extends ICoreDB, ICoreEntityHandler {
  initNewDB(): Promise<void>;

  getRawDBObject(): D | null;

  configExist(key: string): Promise<boolean>;

  setConfig(key: string, value: string): Promise<boolean>;

  removeConfig(key: string): Promise<void>;

  getConfig(key: string): Promise<ConfigType | undefined>;

  execScripts(list: RawQuery[]): Promise<T[] | null>;

  canUpdate(): Promise<boolean>;

  getCurrenDBVersion(): Promise<string>;

  update(): Promise<boolean>;
}

/**
 * Don't use this interface use {IDataBase} instead
 * @see  IDataBase
 */
export interface ICoreDB extends ILogChannel {
  setUpdateChain(chain: IBaseDBUpdate): void;

  start(): Promise<void>;

  isConnected(): boolean;

  disconnect(): Promise<boolean>;

  setConnected(): void;

  connect(): Promise<boolean>;
}

export interface IHaveLogger {
  getLogger: () => CoreLogger;
}

export interface IStore {
  clear(): void;

  get(key: string): string | undefined;

  has(key: string): boolean;

  set(key: string, value: string): void;
}

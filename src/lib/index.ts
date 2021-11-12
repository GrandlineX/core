import CoreLogger from '../classes/CoreLogger';

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

  clearAll(key: string): Promise<void>;

  exist(key: string): Promise<boolean>;

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

export interface ICoreKernel<X extends ICoreCClient> extends ILogChanel {
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

  addModule(module: ICoreKernelModule<any, any, any, any, any>): void;

  getModule(): ICoreKernelModule<any, any, any, any, any>;

  getOffline(): boolean;

  setOffline(mode: boolean): void;

  getMaster(): boolean;

  setMaster(mode: boolean): void;

  getDevMode(): boolean;

  setDevMode(mode: boolean): void;

  getConfigStore(): IStore;
}

export interface ICoreKernelModule<
  K extends ICoreKernel<any>,
  T extends IDataBase<any, any> | null,
  P extends ICoreElement | null,
  C extends ICoreCache | null,
  E extends ICorePresenter<any> | null
> extends ILogChanel {
  addSrcBridge(bridge: ICoreBridge): void;
  addTarBridge(bridge: ICoreBridge): void;
  getBridges(): ICoreBridge[];

  getDependencyList(): string[];

  register(): Promise<void>;

  shutdown(): Promise<void>;

  start(): Promise<void>;

  final?(): Promise<void>;

  startup?(): Promise<void>;

  beforeServiceStart?(): Promise<void>;

  addAction(action: ICoreAction): void;

  addService(service: ICoreService): void;

  getServiceList(): ICoreService[];

  getKernel(): K;

  getDb(): T | null;

  setDb(db: T): void;

  getClient(): P | null;

  setClient(client: P): void;

  getEndpoint(): E | null;

  setEndpoint(endpoint: E): void;

  getCache(): C | null;

  setCache(cache: C): void;

  getName(): string;

  getBridgeModule(
    name: string
  ): ICoreKernelModule<K, any, any, any, any> | undefined;
}

export interface ICorePresenter<E> extends ICoreElement {
  start(): Promise<boolean>;

  stop(): Promise<boolean>;

  getApp(): E;
}

export interface ICoreElement extends ILogChanel {
  getKernel(): ICoreKernel<any>;

  getModule(): ICoreKernelModule<any, any, any, any, any>;
}

export interface ICoreAction extends ICoreElement {
  register(): void;
}

export interface ICoreService extends ICoreElement {
  getName(): string;

  start(): Promise<any>;

  stop(): Promise<any>;
}

export interface ICoreBridge {
  connect(): void;
  setState(state: BridgeState): void;
  waitForState(state: BridgeState): Promise<boolean>;
  getTarget(): ICoreKernelModule<any, any, any, any, any>;
}
export type WorkLoad<T> = Promise<T>[];

export interface ILogChanel {
  log(...ags: unknown[]): void;

  debug(...ags: unknown[]): void;

  info(...ags: unknown[]): void;

  error(...ags: unknown[]): void;

  warn(...ags: unknown[]): void;

  verbose(...ags: unknown[]): void;
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

export interface IDataBase<D, T> extends ICoreDB {
  initNewDB(): Promise<void>;

  getRawDBObject(): D | null;

  configExist(key: string): Promise<boolean>;

  setConfig(key: string, value: string): Promise<boolean>;

  removeConfig(key: string): Promise<void>;

  getConfig(key: string): Promise<ConfigType | undefined>;

  execScripts(list: RawQuery[]): Promise<T[] | null>;
}

export interface ICoreDB extends ILogChanel {
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

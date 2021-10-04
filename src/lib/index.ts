import { CoreConfig } from '../utils/config';
import { ILogger } from '../modules/logger/Logger';
import { IDataBase } from '../modules/DBConnector/lib';
import DBConnection from '../modules/DBConnector/classes/DBConnection';

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

export interface ICoreKernel<X extends ICoreCClient> extends ILogger {
  start(): Promise<boolean>;

  stop(): Promise<boolean>;

  setLog(message: string): void;

  getLog(): string;

  setState(message: string): void;

  getState(): string;

  getAppCode(): string;

  getAppName(): string;

  setCryptoClient(crypto: X | null): void;

  getCryptoClient(): X | null;

  hasCryptoClient(): boolean;

  trigerFunction(triger: KernelTrigger): Promise<void>;

  setTrigerFunction(
    trigger: KernelTrigger,
    triggerFunc: (ik: ICoreKernel<X>) => Promise<void>
  ): void;

  getDb(): DBConnection<any> | null;

  addModule(module: ICoreKernelModule<any, any, any, any, any>): void;

  getModule(): ICoreKernelModule<any, any, any, any, any>;

  getOffline(): boolean;

  setOffline(mode: boolean): void;

  getMaster(): boolean;

  setMaster(mode: boolean): void;

  getDevMode(): boolean;

  setDevMode(mode: boolean): void;

  getGlobalConfig(): CoreConfig;
}

export interface ICoreKernelModule<
  K extends ICoreKernel<any>,
  T extends IDataBase<any> | null,
  P extends ICoreElement | null,
  C extends ICoreCache | null,
  E extends ICoreEndpoint<any> | null
> extends ILogger {
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

export interface ICoreEndpoint<E> extends ICoreElement {
  start(): Promise<boolean>;

  stop(): Promise<boolean>;

  getApp(): E;
}

export interface ICoreElement extends ILogger {
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
export type WorkLoad = Promise<any>[];

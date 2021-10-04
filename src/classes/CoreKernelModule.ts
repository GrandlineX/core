import {
  BridgeState,
  ICoreBridge,
  ICoreEndpoint,
  ICoreKernelModule,
  ICoreKernel,
  ICoreCache,
} from '../lib';
import CoreAction from './CoreAction';
import Logger from '../modules/logger/Logger';
import CoreService from './CoreService';
import CoreClient from './CoreClient';
import CoreCache from './CoreCache';
import { IDataBase } from '../modules/DBConnector/lib';

export default abstract class CoreKernelModule<
    K extends ICoreKernel<any>,
    T extends IDataBase<any> | null,
    P extends CoreClient | null,
    C extends ICoreCache | null,
    E extends ICoreEndpoint<any> | null
  >
  extends Logger
  implements ICoreKernelModule<K, T | null, P | null, C | null, E | null>
{
  private actionlist: CoreAction[];

  private servicelist: CoreService[];

  private deps: string[];

  private srcBridges: ICoreBridge[];

  private tarBridges: ICoreBridge[];

  private readonly kernel: K;

  private db: T | null;

  private client: P | null;

  private cache: C | null;

  private endpoint: E | null;

  private readonly name: string;

  constructor(name: string, kernel: K, ...deps: string[]) {
    super(`${name}Module`, kernel.getGlobalConfig().dir.temp);
    this.name = name;
    this.actionlist = [];
    this.servicelist = [];
    this.kernel = kernel;
    this.db = null;
    this.client = null;
    this.cache = null;
    this.endpoint = null;
    this.srcBridges = [];
    this.tarBridges = [];
    this.deps = deps;
  }

  addSrcBridge(bridge: ICoreBridge): void {
    this.srcBridges.push(bridge);
  }

  addTarBridge(bridge: ICoreBridge): void {
    this.tarBridges.push(bridge);
  }

  abstract startup(): Promise<void>;

  async start(): Promise<void> {
    await this.endpoint?.start();
    await this.startup();
  }

  getEndpoint(): E | null {
    return this.endpoint;
  }

  setEndpoint(endpoint: E | null): void {
    this.endpoint = endpoint;
  }

  getDb(): T | null {
    return this.db;
  }

  setDb(db: T): void {
    this.db = db;
  }

  getClient(): P | null {
    return this.client;
  }

  setClient(client: P): void {
    this.client = client;
  }

  getCache(): C | null {
    return this.cache;
  }

  setCache(cache: C): void {
    this.cache = cache;
  }

  async waitForBridgeState(state: BridgeState): Promise<void> {
    const waitList: Promise<any>[] = [];
    this.srcBridges.forEach((b) => waitList.push(b.waitForState(state)));
    await Promise.all(waitList);
  }

  notifyBridges(state: BridgeState): void {
    this.tarBridges.forEach((b) => b.setState(state));
  }

  abstract initModule(): Promise<void>;

  abstract beforeServiceStart(): Promise<void>;

  async register(): Promise<void> {
    await this.waitForBridgeState(BridgeState.ready);
    await this.initModule();
    await this.db?.start();
    await this.cache?.start();
    this.actionlist.forEach((el) => {
      el.register();
    });
    await this.beforeServiceStart();
    this.servicelist.forEach((service) => {
      service.log('Starting');
      service.start();
    });
    this.notifyBridges(BridgeState.ready);
  }

  async shutdown(): Promise<void> {
    await this.waitForBridgeState(BridgeState.end);
    if (this.endpoint) {
      this.endpoint.stop();
    }

    const workload: Promise<any>[] = [];

    this.servicelist.forEach((el) => workload.push(el.stop()));
    await Promise.all(workload);

    await this.db?.disconnect();
    await this.cache?.stop();
    this.notifyBridges(BridgeState.end);
  }

  addAction(action: CoreAction): void {
    this.actionlist.push(action);
  }

  addService(service: CoreService): void {
    this.servicelist.push(service);
  }

  getKernel(): K {
    return this.kernel;
  }

  getName(): string {
    return this.name;
  }

  getDependencyList(): string[] {
    return this.deps;
  }

  getBridges(): ICoreBridge[] {
    return this.srcBridges;
  }

  getBridgeModule(
    name: string
  ): ICoreKernelModule<any, any, any, any, any> | undefined {
    const br = this.srcBridges.find(
      (bridge) => bridge.getTarget().getName() === name
    );
    return br?.getTarget();
  }

  abstract final(): Promise<void>;
}

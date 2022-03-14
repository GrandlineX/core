import {
  BridgeState,
  ICoreAnyModule,
  ICoreBridge,
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  ICoreService,
  IDataBase,
  KernelTrigger,
} from '../lib';
import CoreAction from './CoreAction';
import CoreService from './CoreService';
import CoreLogChannel from './CoreLogChannel';
import CoreLogger from './CoreLogger';

/**
 * Core kernel module
 *
 * ```typescript
 * // Default use
 *
 * class ExampleModulen extends CoreKernelModule<any, any, any, any, any> {
 *   constructor(module: ICoreKernel<any>) {
 *     super('example', module);
 *   }
 *
 *   beforeServiceStart(): Promise<void> {
 *     return Promise.resolve(undefined);
 *   }
 *
 *   final(): Promise<void> {
 *     return Promise.resolve(undefined);
 *   }
 *
 *   initModule(): Promise<void> {
 *     return Promise.resolve(undefined);
 *   }
 *
 *   startup(): Promise<void> {
 *     return Promise.resolve(undefined);
 *   }
 * }
 *
 * class Kernel extends CoreKernel<any> {
 *   constructor() {
 *     super({ appName: 'TestName', appCode: 'testcode' });
 *     // OPTION 01
 *     this.addModule(new ExampleModulen(this));
 *   }
 * }
 * const kernel = new Kernel();
 * // OPTION 02
 *   kernel.setTriggerFunction('pre', async (ik) => {
 *   ik.addModule(new ExampleModulen(ik));
 * });
 *
 * kernel.start();
 * ```
 */
export default abstract class CoreKernelModule<
    K extends ICoreKernel<any>,
    T extends IDataBase<any, any> | null,
    P extends ICoreClient | null,
    C extends ICoreCache | null,
    E extends ICorePresenter<any> | null
  >
  extends CoreLogChannel
  implements ICoreKernelModule<K, T, P, C, E>
{
  protected trigger?: () => Promise<void>;

  private actionlist: CoreAction[];

  private readonly servicelist: CoreService[];

  private readonly deps: string[];

  private readonly srcBridges: ICoreBridge[];

  private tarBridges: ICoreBridge[];

  private readonly kernel: K;

  private db: T | null;

  private client: P | null;

  private cache: C | null;

  private presenter: E | null;

  private readonly name: string;

  constructor(name: string, kernel: K, ...deps: string[]) {
    super(`${name}Module`, kernel);
    this.name = name;
    this.actionlist = [];
    this.servicelist = [];
    this.kernel = kernel;
    this.db = null;
    this.client = null;
    this.cache = null;
    this.presenter = null;
    this.srcBridges = [];
    this.tarBridges = [];
    this.deps = deps;
  }

  hasDb(): boolean {
    return !!this.db;
  }

  hasClient(): boolean {
    return !!this.client;
  }

  hasPresenter(): boolean {
    return !!this.presenter;
  }

  hasCache(): boolean {
    return !!this.cache;
  }

  addSrcBridge(bridge: ICoreBridge): void {
    this.srcBridges.push(bridge);
  }

  addTarBridge(bridge: ICoreBridge): void {
    this.tarBridges.push(bridge);
  }

  async startup(): Promise<void> {
    this.verbose('run-startup');
  }

  async start(): Promise<void> {
    await this.presenter?.start();
    await this.startup();
  }

  getPresenter(): E {
    if (!this.presenter) {
      throw this.lError('no endpoint');
    }
    return this.presenter;
  }

  setPresenter(presenter: E | null): void {
    this.presenter = presenter;
  }

  getDb(): T {
    if (!this.db) {
      throw this.lError('no db');
    }
    return this.db;
  }

  setDb(db: T): void {
    this.db = db;
  }

  getClient(): P {
    if (!this.client) {
      throw this.lError('no client');
    }
    return this.client;
  }

  setClient(client: P): void {
    this.client = client;
  }

  getCache(): C {
    if (!this.cache) {
      throw this.lError('no cache');
    }
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

  async beforeServiceStart(): Promise<void> {
    this.verbose('run-before-service');
  }

  async register(action?: KernelTrigger): Promise<void> {
    await this.waitForBridgeState(BridgeState.ready);
    await this.initModule();
    if (action) {
      await this.getKernel().triggerFunction(action);
    }
    if (this.trigger) {
      await this.trigger();
    }
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
    if (this.presenter) {
      this.presenter.stop();
    }

    const workload: Promise<any>[] = [];

    this.servicelist.forEach((el) => workload.push(el.stop()));
    await Promise.all(workload);

    await this.db?.disconnect();
    await this.cache?.stop();
    this.notifyBridges(BridgeState.end);
  }

  addAction(...action: CoreAction[]): void {
    action.forEach((value) => {
      this.actionlist.push(value);
    });
  }

  addService(...service: CoreService[]): void {
    service.forEach((value) => {
      this.servicelist.push(value);
    });
  }

  getServiceList(): ICoreService[] {
    return this.servicelist;
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

  getBridgeModule<M extends ICoreAnyModule>(name: string): M | undefined {
    const br = this.srcBridges.find(
      (bridge) => bridge.getTarget().getName() === name
    );
    if (!br) {
      return undefined;
    }
    return br.getTarget() as M;
  }

  async final(): Promise<void> {
    this.verbose('run-final');
  }

  getLogger(): CoreLogger {
    return this.kernel.getLogger();
  }
}

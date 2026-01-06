import {
  BridgeState,
  ICoreAction,
  ICoreAnyModule,
  ICoreBridge,
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  ICoreService,
  IDataBase,
  KernelEvent,
} from '../lib/index.js';
import CoreAction from './CoreAction.js';
import CoreService from './CoreService.js';
import CoreLogChannel from './CoreLogChannel.js';
import CoreLogger from './CoreLogger.js';

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
    E extends ICorePresenter<any> | null,
  >
  extends CoreLogChannel
  implements ICoreKernelModule<K, T, P, C, E>
{
  /**
   * Optional trigger function to be executed during registration.
   */
  protected trigger?: () => Promise<void>;

  /**
   * List of actions registered in this module.
   */
  private actionlist: CoreAction[];

  /**
   * Map of service name to CoreService instances.
   */
  private readonly servicelist: Map<string, CoreService>;

  /**
   * List of dependency names.
   */
  private readonly deps: string[];

  /**
   * List of source bridges.
   */
  private readonly srcBridges: ICoreBridge[];

  /**
   * List of target bridges.
   */
  private tarBridges: ICoreBridge[];

  /**
   * Reference to the kernel instance.
   */
  private readonly kernel: K;

  /**
   * Database instance.
   */
  private db: T | null;

  /**
   * Client instance.
   */
  private client: P | null;

  /**
   * Cache instance.
   */
  private cache: C | null;

  /**
   * Presenter instance.
   */
  private presenter: E | null;

  /**
   * Name of the module.
   */
  private readonly name: string;

  /**
   * Constructs a new CoreKernelModule.
   * @param name Name of the module
   * @param kernel Kernel instance
   * @param deps List of dependency names
   */
  constructor(name: string, kernel: K, ...deps: string[]) {
    super(`${name}Module`, kernel);
    this.name = name;
    this.actionlist = [];
    this.servicelist = new Map();
    this.kernel = kernel;
    this.db = null;
    this.client = null;
    this.cache = null;
    this.presenter = null;
    this.srcBridges = [];
    this.tarBridges = [];
    this.deps = deps;
  }

  /**
   * Returns the list of actions.
   */
  getActionList(): ICoreAction[] {
    return this.actionlist;
  }

  /**
   * Returns true if a database is set.
   */
  hasDb(): boolean {
    return !!this.db;
  }

  /**
   * Returns true if a client is set.
   */
  hasClient(): boolean {
    return !!this.client;
  }

  /**
   * Returns true if a presenter is set.
   */
  hasPresenter(): boolean {
    return !!this.presenter;
  }

  /**
   * Returns true if a cache is set.
   */
  hasCache(): boolean {
    return !!this.cache;
  }

  /**
   * Adds a source bridge.
   * @param bridge The bridge to add
   */
  addSrcBridge(bridge: ICoreBridge): void {
    this.srcBridges.push(bridge);
  }

  /**
   * Adds a target bridge.
   * @param bridge The bridge to add
   */
  addTarBridge(bridge: ICoreBridge): void {
    this.tarBridges.push(bridge);
  }

  /**
   * Startup logic for the module.
   */
  async startup(): Promise<void> {
    this.verbose('run-startup');
  }

  /**
   * Starts the presenter and the module.
   */
  async start(): Promise<void> {
    await this.presenter?.start();
    await this.startup();
  }

  /**
   * Returns the presenter instance.
   * @throws Error if presenter is not set
   */
  getPresenter(): E {
    if (!this.presenter) {
      throw this.lError('no endpoint');
    }
    return this.presenter;
  }

  /**
   * Sets the presenter instance.
   * @param presenter The presenter to set
   */
  setPresenter(presenter: E | null): void {
    this.presenter = presenter;
  }

  /**
   * Returns the database instance.
   * @throws Error if database is not set
   */
  getDb(): T {
    if (!this.db) {
      throw this.lError('no db');
    }
    return this.db;
  }

  /**
   * Sets the database instance.
   * @param db The database to set
   */
  setDb(db: T): void {
    this.db = db;
  }

  /**
   * Returns the client instance.
   * @throws Error if client is not set
   */
  getClient(): P {
    if (!this.client) {
      throw this.lError('no client');
    }
    return this.client;
  }

  /**
   * Sets the client instance.
   * @param client The client to set
   */
  setClient(client: P): void {
    this.client = client;
  }

  /**
   * Returns the cache instance.
   * @throws Error if cache is not set
   */
  getCache(): C {
    if (!this.cache) {
      throw this.lError('no cache');
    }
    return this.cache;
  }

  /**
   * Sets the cache instance.
   * @param cache The cache to set
   */
  setCache(cache: C): void {
    this.cache = cache;
  }

  /**
   * Waits for all source bridges to reach a specific state.
   * @param state The bridge state to wait for
   */
  async waitForBridgeState(state: BridgeState): Promise<void> {
    const waitList: Promise<any>[] = [];
    this.srcBridges.forEach((b) => waitList.push(b.waitForState(state)));
    await Promise.all(waitList);
  }

  /**
   * Notifies all target bridges of a state change.
   * @param state The state to set
   */
  notifyBridges(state: BridgeState): void {
    this.tarBridges.forEach((b) => b.setState(state));
  }

  /**
   * Abstract method to initialize the module.
   */
  abstract initModule(): Promise<void>;

  /**
   * Hook called before services are started.
   */
  async beforeServiceStart(): Promise<void> {
    this.verbose('run-before-service');
  }

  /**
   * Registers the module, actions, and services.
   * @param action Optional kernel event to trigger
   */
  async register(action?: KernelEvent): Promise<void> {
    await this.waitForBridgeState(BridgeState.ready);
    await this.initModule();
    if (action) {
      await this.getKernel().triggerEvent(action);
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
      if (!service.skipAutoStart) {
        service.debug('Starting');
        service.start();
      }
    });
    this.notifyBridges(BridgeState.ready);
  }

  /**
   * Shuts down the module and its services.
   */
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

  /**
   * Adds one or more actions to the module.
   * @param action Actions to add
   */
  addAction(...action: CoreAction[]): void {
    action.forEach((value) => {
      this.actionlist.push(value);
    });
  }

  /**
   * Adds one or more services to the module.
   * @param service Services to add
   */
  addService(...service: CoreService[]): void {
    service.forEach((value) => {
      this.servicelist.set(value.getName(), value);
    });
  }

  /**
   * Returns the list of services.
   */
  getServiceList(): ICoreService[] {
    return Array.from(this.servicelist.values());
  }

  /**
   * Stops a service by name.
   * @param name Name of the service
   * @returns The stopped service or null
   */
  async stopService(name: string): Promise<ICoreService | null> {
    const s = this.servicelist.get(name);
    if (!s?.isRunning()) {
      return null;
    }
    s.stop();
    s.state = 'SLEEPING';

    return s;
  }

  /**
   * Starts a service by name.
   * @param name Name of the service
   * @returns The started service or null
   */
  async startService(name: string): Promise<ICoreService | null> {
    const s = this.servicelist.get(name);
    if (!s || s.isRunning()) {
      return null;
    }
    s.start();
    s.state = 'RUNNING';
    return s;
  }

  /**
   * Returns the kernel instance.
   */
  getKernel(): K {
    return this.kernel;
  }

  /**
   * Returns the name of the module.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Returns the list of dependency names.
   */
  getDependencyList(): string[] {
    return this.deps;
  }

  /**
   * Returns the list of source bridges.
   */
  getBridges(): ICoreBridge[] {
    return this.srcBridges;
  }

  /**
   * Returns a bridge module by name.
   * @param name Name of the module
   * @returns The bridge module
   */
  getBridgeModule<M extends ICoreAnyModule>(name: string): M {
    const br = this.srcBridges.find(
      (bridge) => bridge.getTarget().getName() === name,
    );
    if (!br) {
      throw this.lError(`no bridge module found: ${name}`);
    }
    return br.getTarget() as M;
  }

  /**
   * Finalization logic for the module.
   */
  async final(): Promise<void> {
    this.verbose('run-final');
  }

  /**
   * Returns the logger instance from the kernel.
   */
  getLogger(): CoreLogger {
    return this.kernel.getLogger();
  }
}

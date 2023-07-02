import {
  ICoreAction,
  ICoreAnyModule,
  ICoreCClient,
  ICoreDb,
  ICoreKernel,
  ICoreKernelModule,
  ICoreModule,
  ICoreService,
  IHaveLogger,
  IStore,
  KernelTrigger,
} from './lib/index.js';

import initHandler from './utils/initHandler.js';
import { CoreLogChannel, CoreLogger } from './classes/index.js';

import {
  DefaultLogger,
  EnvStore,
  InMemDB,
  StoreGlobal,
  EnvStoreCProps,
} from './modules/index.js';
import CoreModule from './CoreModule.js';
import { XUtil } from './utils/index.js';

/**
 *  Core Kernel class
 * @typeParam X Type of Crypto client.
 * ```typescript
 * // Default use
 * class Kernel extends CoreKernel<any> {
 * constructor() {
 *   super({ appName: 'TestName', appCode: 'testcode' });
 *  }
 * }
 * const kernel = new Kernel();
 * kernel.start();
 * ```
 */

export type CoreKernelProps = {
  appName: string;
  appCode: string;
  logger?: (kernel: CoreKernel<any>) => CoreLogger;
} & Omit<EnvStoreCProps, 'kernel'>;

export default abstract class CoreKernel<
    X extends ICoreCClient,
    Y extends ICoreKernelModule<any, any, any, any, any> = ICoreAnyModule
  >
  extends CoreLogChannel
  implements ICoreKernel<X>, IHaveLogger
{
  protected devMode: boolean;

  protected appCode: string;

  protected appName: string;

  protected appVersion: string;

  protected cryptoClient: X | null;

  protected state: any = null;

  protected moduleList: ICoreKernelModule<any, any, any, any, any>[];

  protected coreModule: ICoreModule;

  protected kernelModule: Y | null;

  protected offline: boolean;

  protected updateSkip: boolean;

  protected envStore: IStore;

  protected triggerMap: Map<
    string,
    (kernel: CoreKernel<X>) => Promise<unknown>
  >;

  protected globalLogger: CoreLogger;

  /**
   * Default Constructor
   * - appName: string - AppName
   * - appCode: string - AppCode only lower case letters
   * - pathOverride: string - Path to config folder [optional]
   * > Default path is ${HOME}/AppName or ${HOME}/Library/AppName (osx)
   * - logger: CoreLogger {@link CoreLogger} [optional]
   * @param options Kernel options
   */
  protected constructor(options: CoreKernelProps) {
    super('kernel', null);
    this.appName = options.appName;
    this.devMode = false;
    this.appCode = options.appCode;
    this.cryptoClient = null;
    this.moduleList = [];
    this.offline = false;
    this.updateSkip = false;
    this.appVersion = 'noVersion';
    this.triggerFunction = this.triggerFunction.bind(this);
    this.triggerMap = new Map<
      string,
      (kernel: CoreKernel<X>) => Promise<unknown>
    >();

    this.envStore = new EnvStore({
      kernel: this,
      ...options,
    });
    if (options.logger === undefined) {
      this.globalLogger = new DefaultLogger();
    } else {
      this.globalLogger = options.logger(this);
    }
    this.setLogger(this.globalLogger);
    const log = this.envStore.get(StoreGlobal.GLOBAL_LOG_LEVEL);
    if (log) {
      this.globalLogger.setLogLevel(log);
    }

    this.coreModule = new CoreModule(this, (mod) => new InMemDB(mod));
    this.kernelModule = null;
    this.setState('init');
  }

  /**
   * get core kernel module
   */
  getCoreModule(): ICoreModule {
    return this.coreModule;
  }

  /**
   * get base kernel module
   */
  getModule(): Y {
    if (this.kernelModule) {
      return this.kernelModule;
    }
    throw this.lError('No Base module found');
  }

  /**
   * get global logger
   */
  getLogger(): CoreLogger {
    return this.globalLogger;
  }

  /**
   * get app name
   */
  getAppName(): string {
    return this.appName;
  }

  /**
   * get app code
   */
  getAppCode(): string {
    return this.appCode;
  }

  /**
   * startup kernel
   */
  public async start(): Promise<boolean> {
    this.startUpInfo();
    this.debug('Run startup script');
    this.preloadSetup();
    await this.triggerFunction('pre');
    this.info('Startup script complete');
    this.debug('Run launcher');
    await this.startUp();
    this.setState('running');
    return true;
  }

  /**
   * Run trigger function
   * Cycle functions
   * @see KernelTrigger
   * @param trigger
   */
  async triggerFunction(trigger: KernelTrigger): Promise<unknown> {
    const fc = this.triggerMap.get(trigger);
    if (!fc) {
      this.debug(`Trigger not implemented. [${trigger}]`);
      return undefined;
    }
    return fc(this);
  }

  /**
   * Set function run on trigger
   * Cycle functions
   * @see KernelTrigger
   * @param trigger
   * @param triggerFunc
   */
  setTriggerFunction(
    trigger: KernelTrigger,
    triggerFunc: (ik: CoreKernel<X>) => Promise<unknown>
  ): void {
    this.triggerMap.set(trigger, triggerFunc);
  }

  /**
   * Set core state code
   * @param message
   */
  setState(message: string): void {
    this.state = message;
  }

  /**
   * Get core state code
   */
  getState(): string {
    return this.state;
  }

  /**
   * Set global crypt client
   * @link ICoreCClient
   * @param crypto
   */
  setCryptoClient(crypto: X | null): void {
    this.cryptoClient = crypto;
  }

  /**
   * Get global crypt client
   * @link ICoreCClient
   */
  getCryptoClient(): X | null {
    return this.cryptoClient;
  }

  /**
   * Has global crypt client
   * @link ICoreCClient
   */
  hasCryptoClient(): boolean {
    return this.cryptoClient !== null;
  }

  /**
   * Get database object of the core kernel module
   * @link ICoreDb
   */
  getDb(): ICoreDb {
    return this.coreModule.getDb();
  }

  /**
   * Get the offline flag
   */
  getOffline(): boolean {
    return this.offline;
  }

  /**
   * Set the offline flag
   * @param mode
   */
  setOffline(mode: boolean): void {
    this.offline = mode;
  }

  /**
   * Get environment config store
   * @link EnvStore
   */
  getConfigStore(): IStore {
    return this.envStore;
  }

  /**
   * Get dev mode flag
   */
  getDevMode(): boolean {
    return this.devMode;
  }

  /**
   * Set dev mode flag
   */
  setDevMode(mode: boolean): void {
    this.devMode = mode;
  }

  /**
   * register new module
   * > In general there are two places to add Modules correctly: In the Kernel constructor or in the pre-trigger-function
   *
   * @see CoreKernelModule
   * @param module
   * @typeParam X Type of Crypto client.
   */
  addModule(...module: ICoreKernelModule<any, any, any, any, any>[]): void {
    this.moduleList.push(...module);
  }

  setBaseModule(module: Y): void {
    this.kernelModule = module;
  }

  setCoreModule<E extends ICoreModule>(module: E): void {
    this.coreModule = module;
  }

  async stop(): Promise<boolean> {
    const workload: Promise<void>[] = [];
    await this.triggerFunction('stop');
    this.moduleList.forEach((el) => workload.push(el.shutdown()));
    await Promise.all(workload);
    await this.getModule().shutdown();
    await this.getCoreModule().shutdown();
    this.setState('exited');
    return true;
  }

  getChildModule<
    T extends ICoreKernelModule<any, any, any, any, any> = ICoreAnyModule
  >(modName: string): T | null {
    const mod = this.moduleList.find((mo) => mo.getName() === modName);
    if (mod) {
      return mod as T;
    }
    return null;
  }

  getModCount(full = false): number {
    return this.moduleList.length + (full ? 2 : 0);
  }

  private preloadSetup() {
    const st = this.getConfigStore();
    this.appVersion = st.get(StoreGlobal.GLOBAL_APP_VERSION) || '';
    if (
      !XUtil.createFolderBulk(
        st.get(StoreGlobal.GLOBAL_PATH_HOME) || '',
        st.get(StoreGlobal.GLOBAL_PATH_DATA) || '',
        st.get(StoreGlobal.GLOBAL_PATH_DB) || '',
        st.get(StoreGlobal.GLOBAL_PATH_TEMP) || ''
      )
    ) {
      console.error(`Cant create config folder at $GLOBAL_PATH_HOME`);
      this.error(`Cant create config folder at $GLOBAL_PATH_HOME`);
      process.exit(1);
    }
  }

  /**
   * Prints the default startup message
   * @private
   */
  private startUpInfo() {
    const out = [
      `Starting Kernel`,
      `⊢ Code:           ${this.appCode}`,
      `⊢ Version:        ${this.envStore.get(StoreGlobal.GLOBAL_APP_VERSION)}`,
      `⊢ Mode:           ${this.devMode ? 'Dev' : 'Prod'}`,
      `⊢ Mod count:      ${this.moduleList.length}`,
      `⊢ Action count:   ${this.getActionList().length}`,
      `⊢ Service count:  ${this.getServiceList().length}`,
      `⊢ Log level:      ${this.globalLogger.getLogLevel()}`,
    ];
    out.forEach((x) => this.info(x));
  }
  /**
   * @private
   */

  private async startUp() {
    await this.getCoreModule().register('core-load');
    await this.getModule().register('load');
    await initHandler(this.moduleList, this);
    await this.getCoreModule().start();
    await this.getModule().start();
    for (const mod of this.moduleList) {
      if (mod.final !== undefined) {
        await mod.final();
      }
    }
    await this.triggerFunction('start');
  }

  getActionList(full = false): ICoreAction[] {
    const out: ICoreAction[] = [];
    if (full) {
      this.coreModule.getActionList().forEach((el) => out.push(el));
      this.kernelModule?.getActionList().forEach((el) => out.push(el));
    }
    this.moduleList.forEach((el) => {
      out.push(...el.getActionList());
    });
    return out;
  }

  getServiceList(full = false): ICoreService[] {
    const out: ICoreService[] = [];
    if (full) {
      this.coreModule.getServiceList().forEach((el) => out.push(el));
      this.kernelModule?.getServiceList().forEach((el) => out.push(el));
    }
    this.moduleList.forEach((el) => {
      out.push(...el.getServiceList());
    });
    return out;
  }
}

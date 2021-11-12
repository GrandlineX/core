import {
  ICoreKernelModule,
  ICoreCClient,
  ICoreKernel,
  KernelTrigger,
  IStore,
} from './lib';
import { createFolderIfNotExist } from './utils';
import initHandler from './utils/initHandler';
import CoreLogger from './classes/CoreLogger';
import CoreLogChannel from './classes/CoreLogChannel';
import CoreDBCon from './classes/CoreDBCon';
import EnvStore from './modules/env/EnvStore';
import { DefaultLogger } from './modules';
import { CoreKernelModule } from './classes';

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

export default abstract class CoreKernel<X extends ICoreCClient>
  extends CoreLogChannel
  implements ICoreKernel<X>
{
  protected master: boolean;

  protected devMode: boolean;

  protected appCode: string;

  protected appName: string;

  protected appVersion: string;

  protected cryptoClient: X | null;

  protected state: any = null;

  protected moduleList: ICoreKernelModule<any, any, any, any, any>[];

  protected kernelModule: ICoreKernelModule<any, any, any, any, any> | null;

  protected offline: boolean;

  protected updateSkip: boolean;

  protected envStore: IStore;

  protected preRun?: (kernel: this) => Promise<void>;

  protected startRun?: (kernel: this) => Promise<void>;

  protected stopRun?: (kernel: this) => Promise<void>;

  protected loadRun?: (kernel: this) => Promise<void>;

  protected globalLogger: CoreLogger | null;

  /**
   * Default Constructor
   * - appName: string - AppName
   * - appCode: string - AppCode only lower case letters
   * - pathOverride: string - Path to config folder [optional]
   * > Default path is ${HOME}/AppName or ${HOME}/Library/AppName (osx)
   * - logger: CoreLogger {@link CoreLogger} [optional]
   * @param options Kernel options
   */
  constructor(options: {
    appName: string;
    appCode: string;
    pathOverride?: string;
    logger?: CoreLogger;
  }) {
    super('kernel', options.logger || null);
    this.appName = options.appName;
    this.devMode = false;
    this.appCode = options.appCode;
    this.cryptoClient = null;
    this.moduleList = [];
    this.offline = false;
    this.updateSkip = false;
    this.appVersion = 'noVersion';
    this.master = true;
    this.triggerFunction = this.triggerFunction.bind(this);
    if (options.logger === undefined) {
      this.globalLogger = new DefaultLogger();
    } else {
      this.globalLogger = options.logger;
    }
    this.setLogger(this.globalLogger);

    this.envStore = new EnvStore(this, options.pathOverride);
    this.kernelModule = null;
    this.setState('init');
  }

  /**
   * GetKernelMode
   */
  getMaster(): boolean {
    return this.master;
  }

  /**
   * set KernelMode
   * @param mode
   */
  setMaster(mode: boolean): void {
    this.master = mode;
  }

  /**
   * get base kernel module
   */
  getModule(): ICoreKernelModule<any, any, any, any, any> {
    if (this.kernelModule) {
      return this.kernelModule;
    }
    throw new Error('No Base module found');
  }

  /**
   * get global logger
   */
  getLogger(): CoreLogger | null {
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
    this.log(
      `Start Kernel v${process.env.npm_package_version} ${
        this.devMode ? 'DEV' : 'Prod'
      }`
    );
    this.log('Run startup script');
    this.preloadSetup();
    await this.triggerFunction('pre');
    this.log('Startup script complete');
    this.log('Run launcher');
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
  async triggerFunction(trigger: KernelTrigger): Promise<void> {
    switch (trigger) {
      case 'pre':
        if (this.preRun) {
          await this.preRun(this);
        }
        break;
      case 'start':
        if (this.startRun) {
          await this.startRun(this);
        }
        break;
      case 'stop':
        if (this.stopRun) {
          await this.stopRun(this);
        }
        break;
      case 'load':
        if (this.loadRun) {
          await this.loadRun(this);
        }
        break;
      default:
        throw new Error('Method not implemented.');
    }
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
    triggerFunc: (ik: this) => Promise<void>
  ): void {
    switch (trigger) {
      case 'pre':
        this.preRun = triggerFunc;
        break;
      case 'start':
        this.startRun = triggerFunc;
        break;
      case 'stop':
        this.stopRun = triggerFunc;
        break;
      case 'load':
        this.loadRun = triggerFunc;
        break;
      default:
        throw new Error('Method not implemented.');
    }
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
   * Get database object of the base kernel module
   * @link CoreDBCon
   */
  getDb(): CoreDBCon<any> | null {
    if (this.kernelModule) {
      return this.kernelModule.getDb();
    }
    throw new Error('No base module found');
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
  addModule(module: ICoreKernelModule<any, any, any, any, any>): void {
    this.moduleList.push(module);
  }

  setBaseModule(module: ICoreKernelModule<any, any, any, any, any>): void {
    this.kernelModule = module;
  }

  async stop(): Promise<boolean> {
    const workload: Promise<void>[] = [];
    await this.triggerFunction('stop');
    this.moduleList.forEach((el) => workload.push(el.shutdown()));
    await Promise.all(workload);
    await this.getModule().shutdown();
    this.setState('exited');
    return true;
  }

  getChildModule(
    modName: string
  ): ICoreKernelModule<any, any, any, any, any> | null {
    const mod = this.moduleList.find((mo) => mo.getName() === modName);
    if (mod) {
      return mod;
    }
    return null;
  }

  private preloadSetup() {
    const st = this.getConfigStore();
    this.appVersion = st.get('GLOBAL_APP_VERSION') || '';
    if (
      !(
        createFolderIfNotExist(st.get('GLOBAL_PATH_HOME') || '') &&
        createFolderIfNotExist(st.get('GLOBAL_PATH_DATA') || '') &&
        createFolderIfNotExist(st.get('GLOBAL_PATH_DB') || '') &&
        createFolderIfNotExist(st.get('GLOBAL_PATH_TEMP') || '')
      )
    ) {
      console.error(`Cant create config folder at $GLOBAL_PATH_HOME`);
      process.exit(1);
    }
  }

  private async startUp() {
    await this.getModule().register();
    await initHandler(this.moduleList, this);
    await this.getModule().start();
    for (const mod of this.moduleList) {
      if (mod.final !== undefined) {
        await mod.final();
      }
    }
    await this.triggerFunction('start');
  }

  getModCount(): number {
    return this.moduleList.length;
  }
}

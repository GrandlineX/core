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

/**
 *  @class Kernel
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

  getMaster(): boolean {
    return this.master;
  }

  setMaster(mode: boolean): void {
    this.master = mode;
  }

  getModule(): ICoreKernelModule<any, any, any, any, any> {
    if (this.kernelModule) {
      return this.kernelModule;
    }
    throw new Error('No Base module found');
  }

  getLogger(): CoreLogger | null {
    return this.globalLogger;
  }

  getAppName(): string {
    return this.appName;
  }

  getAppCode(): string {
    return this.appCode;
  }

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

  setState(message: string) {
    this.state = message;
  }

  getState(): string {
    return this.state;
  }

  setCryptoClient(crypto: X | null): void {
    this.cryptoClient = crypto;
  }

  getCryptoClient(): X | null {
    return this.cryptoClient;
  }

  hasCryptoClient(): boolean {
    return this.cryptoClient !== null;
  }

  getDb(): CoreDBCon<any> | null {
    if (this.kernelModule) {
      return this.kernelModule.getDb();
    }
    throw new Error('No base module found');
  }

  /**
   * @deprecated The method should not be used
   */
  getModuleList(): ICoreKernelModule<any, any, any, any, any>[] {
    return this.moduleList;
  }

  getOffline() {
    return this.offline;
  }

  setOffline(mode: boolean) {
    this.offline = mode;
  }

  getConfigStore() {
    return this.envStore;
  }

  getDevMode(): boolean {
    return this.devMode;
  }

  setDevMode(mode: boolean): void {
    this.devMode = mode;
  }

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
}

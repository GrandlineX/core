import {
  ICoreKernelModule,
  ICoreCClient,
  ICoreKernel,
  KernelTrigger,
} from './lib';
import {
  CoreConfig,
  createCertsIfNotExist,
  createFolderIfNotExist,
  getConfig,
} from './utils';
import Logger from './modules/logger/Logger';
import initHandler from './utils/initHandler';
import { DBConnection } from './modules';

/**
 *  @class Kernel
 */

export default abstract class CoreKernel<X extends ICoreCClient>
  extends Logger
  implements ICoreKernel<X>
{
  protected master: boolean;

  protected devMode: boolean;

  protected appCode: string;

  protected appName: string;

  protected appVersion: string;

  protected cryptoClient: X | null;

  protected state: any = null;

  protected logM: string;

  protected moduleList: ICoreKernelModule<any, any, any, any, any>[];

  protected kernelModule: ICoreKernelModule<any, any, any, any, any> | null;

  protected offline: boolean;

  protected updateSkip: boolean;

  protected globalConfig: CoreConfig;

  protected preRun?: (kernel: this) => Promise<void>;

  protected startRun?: (kernel: this) => Promise<void>;

  protected stopRun?: (kernel: this) => Promise<void>;

  protected loadRun?: (kernel: this) => Promise<void>;

  /**
   * Default Constructor
   * @param appName App Name
   * @param appCode App Code (Only lower case)
   * @param pathOverride set base path for config folder
   */
  constructor(appName: string, appCode: string, pathOverride?: string) {
    super('kernel', getConfig(appName, pathOverride).dir.temp);
    this.appName = appName;
    this.devMode = false;
    this.appCode = appCode;
    this.logM = 'Process Starting';
    this.cryptoClient = null;
    this.moduleList = [];
    this.offline = false;
    this.updateSkip = false;
    this.appVersion = 'noVersion';
    this.master = true;
    this.trigerFunction = this.trigerFunction.bind(this);
    if (pathOverride) {
      this.debug(`use custiom config path @ ${pathOverride}`);
    }
    this.globalConfig = {
      ...getConfig(appName, pathOverride),
    };
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
    await this.trigerFunction('pre');
    this.log('Startup script complete');
    this.log('Run launcher');
    await this.startUp();
    this.setState('running');
    return true;
  }

  async trigerFunction(triger: KernelTrigger): Promise<void> {
    switch (triger) {
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

  setTrigerFunction(
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

  setLog(message: string) {
    this.logM = message;
  }

  getLog(): string {
    return this.logM;
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

  getDb(): DBConnection<any> | null {
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

  getGlobalConfig() {
    return this.globalConfig;
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
    await this.trigerFunction('stop');
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
    const config = this.getGlobalConfig();
    const { root, data, db, temp, certs } = config.dir;
    const { env } = process;

    if (
      !(
        createFolderIfNotExist(root) &&
        createFolderIfNotExist(data) &&
        createFolderIfNotExist(db) &&
        createFolderIfNotExist(certs) &&
        createFolderIfNotExist(temp)
      )
    ) {
      console.error(`Cant create config folder at ${root}`);
      process.exit(1);
    }
    if (env?.npm_package_version) {
      this.appVersion = env.npm_package_version;
    }
    if (
      env?.DBPATH &&
      env?.DBPORT &&
      env?.POSTGRES_PASSWORD &&
      env?.POSTGRES_USER
    ) {
      this.globalConfig.db = {
        postgres: {
          host: env.DBPATH,
          port: Number(env.DBPORT),
          password: env.POSTGRES_PASSWORD,
          user: env.POSTGRES_USER,
        },
      };
    }
    if (env?.REDIS_URL && env?.REDIS_PORT) {
      const conf = {
        url: env.REDIS_URL,
        port: Number(env.REDIS_PORT),
        password: env?.REDIS_PASSWORD,
      };
      if (this.globalConfig.db) {
        this.globalConfig.db.redis = conf;
      } else {
        this.globalConfig.db = { redis: conf };
      }
    }
    createCertsIfNotExist(config);
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
    await this.trigerFunction('start');
  }
}

import * as Path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { ICoreKernel, IStore } from '../../lib';
import { EnvKey, StoreGlobal, StoreItem } from './Global';

export default class EnvStore implements IStore {
  store: Map<EnvKey, StoreItem>;

  kernel: ICoreKernel<any>;

  constructor(
    kernel: ICoreKernel<any>,
    pathOverride?: string,
    envFilePath?: string
  ) {
    this.store = new Map<EnvKey, StoreItem>();
    this.kernel = kernel;
    this.initNew(pathOverride, envFilePath);
  }

  initNew(pathOverride?: string, envFilePath?: string): void {
    this.clear();
    const root = envFilePath || process.env.npm_config_local_prefix;
    if (root) {
      const path = Path.join(root, '.env');
      if (fs.existsSync(path)) {
        this.loadFromFile(path);
      } else {
        this.kernel.warn(`Cant load env from ${path}`);
      }
    }

    this.setBulk(
      [StoreGlobal.GLOBAL_OS, os.platform()],
      [StoreGlobal.GLOBAL_ARCH, os.arch()],
      [StoreGlobal.GLOBAL_HOME_DIR, os.homedir()],
      [StoreGlobal.GLOBAL_HOST_NAME, os.hostname()]
    );

    const appName = this.kernel.getAppName();
    let base;
    if (os.platform() === 'darwin') {
      base = pathOverride
        ? Path.join(pathOverride, appName)
        : Path.join(os.homedir(), 'Library', appName);
    } else {
      base = pathOverride
        ? Path.join(pathOverride, appName)
        : Path.join(os.homedir(), appName);
    }
    this.setBulk(
      [StoreGlobal.GLOBAL_PATH_HOME, base],
      [StoreGlobal.GLOBAL_PATH_DATA, Path.join(base, 'data')],
      [StoreGlobal.GLOBAL_PATH_DB, Path.join(base, 'db')],
      [StoreGlobal.GLOBAL_PATH_TEMP, Path.join(base, 'temp')]
    );
    if (process.env.npm_package_version) {
      this.set(StoreGlobal.GLOBAL_APP_VERSION, process.env.npm_package_version);
    } else {
      this.set(StoreGlobal.GLOBAL_APP_VERSION, '0.0.0');
    }
  }

  clear(): void {
    this.store = new Map<EnvKey, StoreItem>();
  }

  get(key: EnvKey, defaultValue = ''): StoreItem {
    return this.store.get(key) || defaultValue;
  }

  has(key: EnvKey): boolean {
    return this.store.has(key);
  }

  delete(key: EnvKey): boolean {
    return this.store.delete(key);
  }

  set(key: EnvKey, value: StoreItem): void {
    this.store.set(key, value);
  }

  setBulk(...list: [EnvKey, StoreItem][]): void {
    for (const [key, value] of list) {
      this.store.set(key, value);
    }
  }

  getBulk(...list: [EnvKey, string?][]): StoreItem[] {
    return list.map(([key, value]) => this.get(key, value));
  }

  private loadFromFile(path: string) {
    this.kernel.log(`Load env from ${path}`);
    const env = fs.readFileSync(path).toString('utf-8');
    const lines = env.split('\n');
    lines.forEach((line) => {
      if (line.startsWith('#')) {
        return;
      }
      const split = line.indexOf('=');
      if (split > 0) {
        const key = line.substring(0, split);
        const value = line.substring(split + 1).trim();
        this.store.set(key, value);
      }
    });
  }
}

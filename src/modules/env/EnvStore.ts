import * as Path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { ICoreKernel, IStore } from '../../lib';

export default class EnvStore implements IStore {
  store: Map<string, string>;

  kernel: ICoreKernel<any>;

  constructor(
    kernel: ICoreKernel<any>,
    pathOverride?: string,
    envFilePath?: string
  ) {
    this.store = new Map<string, string>();
    this.kernel = kernel;
    this.initNew(pathOverride, envFilePath);
  }

  initNew(pathOverride?: string, envFilePath?: string): void {
    this.clear();
    const root = envFilePath || process.env.npm_config_local_prefix;
    if (root) {
      const path = Path.join(root, '.env');
      if (fs.existsSync(path)) {
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
      } else {
        this.kernel.warn(`Cant load env from ${path}`);
      }
    }

    this.store.set('GLOBAL_OS', os.platform());
    this.store.set('GLOBAL_ARCH', os.arch());
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
    this.store.set('GLOBAL_PATH_HOME', base);
    this.store.set('GLOBAL_PATH_DATA', Path.join(base, 'data'));
    this.store.set('GLOBAL_PATH_DB', Path.join(base, 'db'));
    this.store.set('GLOBAL_PATH_TEMP', Path.join(base, 'temp'));

    if (process.env.npm_package_version) {
      this.store.set('GLOBAL_APP_VERSION', process.env.npm_package_version);
    } else {
      this.store.set('GLOBAL_APP_VERSION', '0.0.0');
    }
  }

  clear(): void {
    this.store = new Map<string, string>();
  }

  get(key: string): string | undefined {
    return this.store.get(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }
}
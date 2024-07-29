import {
  ICoreCache,
  ICoreKernel,
  ICorePresenter,
  IDataBase,
} from '../lib/index.js';
import CoreClient from './CoreClient.js';
import CoreKernelModule from './CoreKernelModule.js';

export default abstract class CoreBundleModule<
  K extends ICoreKernel<any>,
  T extends IDataBase<any, any> | null,
  P extends CoreClient | null,
  C extends ICoreCache | null,
  E extends ICorePresenter<any> | null,
> extends CoreKernelModule<K, T, P, C, E> {
  protected constructor(name: string, kernel: K) {
    super(name, kernel);
    this.trigger = this.initBundleModule;
  }

  abstract initBundleModule(): Promise<void>;
}

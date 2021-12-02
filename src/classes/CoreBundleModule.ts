import { ICoreKernel, ICoreCache, IDataBase, ICorePresenter } from '../lib';
import CoreClient from './CoreClient';
import CoreKernelModule from './CoreKernelModule';

export default abstract class CoreBundleModule<
  K extends ICoreKernel<any>,
  T extends IDataBase<any, any> | null,
  P extends CoreClient | null,
  C extends ICoreCache | null,
  E extends ICorePresenter<any> | null
> extends CoreKernelModule<K, T, P, C, E> {
  protected constructor(name: string, kernel: K) {
    super(name, kernel);
    this.trigger = this.initBundleModule;
  }
  abstract initBundleModule(): Promise<void>;
}

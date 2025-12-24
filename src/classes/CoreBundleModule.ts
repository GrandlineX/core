import {
  ICoreCache,
  ICoreKernel,
  ICorePresenter,
  IDataBase,
} from '../lib/index.js';
import CoreClient from './CoreClient.js';
import CoreKernelModule from './CoreKernelModule.js';

/**
 * An abstract base class for modules that need to perform bundle‑level initialization
 * within the kernel.  It extends {@link CoreKernelModule} and supplies a standard
 * constructor that assigns the module name and kernel reference while also setting
 * the module’s `trigger` handler to the {@link initBundleModule} method.
 *
 * @template K - A concrete type that implements {@link ICoreKernel} with any argument.
 * @template T - Either a concrete {@link IDataBase} implementation or {@code null}.
 * @template P - Either a concrete {@link CoreClient} implementation or {@code null}.
 * @template C - Either a concrete {@link ICoreCache} implementation or {@code null}.
 * @template E - Either a concrete {@link ICorePresenter} implementation or {@code null}.
 *
 * @extends CoreKernelModule<K, T, P, C, E>
 */
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

import {
  ICoreCache,
  ICoreCClient,
  ICoreClient,
  ICoreElement,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
  IStore,
} from '../lib/index.js';
import CoreLogChannel from './CoreLogChannel.js';

/**
 * A fundamental building block of the kernel architecture.
 * Each {@link CoreElement} encapsulates a specific kernel module and exposes
 * convenient accessors for the underlying kernel, module, configuration store,
 * and cryptographic client.
 *
 * @template K  The type of the kernel instance (extends {@link ICoreKernel}).
 * @template T  The type of the database used by the module; may be {@code null}.
 * @template P  The type of the client component; may be {@code null}.
 * @template C  The type of the cache component; may be {@code null}.
 * @template E  The type of the presenter component; may be {@code null}.
 *
 * @extends CoreLogChannel
 * @implements ICoreElement<K, T, P, C, E>
 *
 * @param {string} channel - Identifier used for logging and tracing.
 * @param {ICoreKernelModule<K, T, P, C, E>} module - The module that this element manages.
 */
export default abstract class CoreElement<
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any,
  >
  extends CoreLogChannel
  implements ICoreElement<K, T, P, C, E>
{
  private readonly module: ICoreKernelModule<K, T, P, C, E>;

  constructor(channel: string, module: ICoreKernelModule<K, T, P, C, E>) {
    super(channel, module);
    this.module = module;
  }

  getKernel(): K {
    return this.module.getKernel();
  }

  getModule(): ICoreKernelModule<K, T, P, C, E> {
    return this.module;
  }

  getConfigStore(): IStore {
    return this.getKernel().getConfigStore();
  }

  getCClient<X extends ICoreCClient>(): X {
    return this.getKernel().getCryptoClient();
  }
}

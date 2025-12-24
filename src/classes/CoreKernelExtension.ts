import {
  ICoreCache,
  ICoreClient,
  ICoreElement,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
} from '../lib/index.js';
import CoreElement from './CoreElement.js';

/**
 * An abstract base class for kernel extensions that integrates a kernel module
 * into the core element infrastructure.
 *
 * @template K  The type of kernel that this extension will interact with,
 *               defaulting to {@link ICoreKernel<any>}.
 * @template T  The database type used by the kernel, which may be {@link IDataBase<any, any>}
 *               or {@code null} if the extension does not use a database.
 * @template P  The client type used by the kernel, which may be {@link ICoreClient}
 *               or {@code null}.
 * @template C  The cache type used by the kernel, which may be {@link ICoreCache}
 *               or {@code null}.
 * @template E  The presenter type used by the kernel, which may be {@link ICorePresenter<any>}
 *               or {@code null}.
 *
 * Extends {@link CoreElement} and implements {@link ICoreElement}, thereby inheriting
 * core element lifecycle management while providing additional functionality specific
 * to kernel extensions.
 */
export default abstract class CoreKernelExtension<
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any,
  >
  extends CoreElement<K, T, P, C, E>
  implements ICoreElement<K, T, P, C, E>
{
  skipKernelStart;

  constructor(
    channel: string,
    module: ICoreKernelModule<K, T, P, C, E>,
    skipKernelStart = false,
  ) {
    super(`ex-${channel}`, module);
    this.skipKernelStart = skipKernelStart;
  }

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
}

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
 * Abstract base class for client components in the Core framework.
 *
 * This class extends {@link CoreElement} and implements {@link ICoreElement}. It provides a
 * foundational constructor that generates a unique identifier by prefixing the supplied
 * channel name with `"client-"` and forwards that identifier along with the module instance
 * to the parent {@link CoreElement} constructor.
 *
 * @abstract
 * @class CoreClient
 * @template K - Kernel type extending {@link ICoreKernel}.
 * @template T - Database type or `null` extending {@link IDataBase}.
 * @template P - Parent client type or `null` extending {@link ICoreClient}.
 * @template C - Cache type or `null` extending {@link ICoreCache}.
 * @template E - Presenter type or `null` extending {@link ICorePresenter}.
 *
 * @extends CoreElement<K, T, P, C, E>
 * @implements ICoreElement<K, T, P, C, E>
 *
 * @param {string} channel - Identifier used to construct the client’s unique name.
 * @param {ICoreKernelModule<K, T, P, C, E>} module - Module instance providing kernel, database,
 * cache, presenter, and parent client information.
 */
export default abstract class CoreClient<
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any,
  >
  extends CoreElement<K, T, P, C, E>
  implements ICoreElement<K, T, P, C, E>
{
  constructor(module: ICoreKernelModule<K, T, P, C, E>) {
    super(`client-${module.getName()}`, module);
  }
}

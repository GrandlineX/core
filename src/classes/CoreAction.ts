import {
  ICoreAction,
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICorePresenter,
  IDataBase,
} from '../lib/index.js';
import CoreElement from './CoreElement.js';

/**
 * Represents an abstract core action within the application framework.
 * Core actions define a contract for registering action logic that can be
 * consumed by kernels, clients, caches, and presenters.
 *
 * @abstract
 * @template K extends ICoreKernel<any> = ICoreKernel<any>
 * @template T extends IDataBase<any, any> | null = any
 * @template P extends ICoreClient | null = any
 * @template C extends ICoreCache | null = any
 * @template E extends ICorePresenter<any> | null = any
 * @extends CoreElement<K, T, P, C, E>
 * @implements ICoreAction<K, T, P, C, E>
 */
export default abstract class CoreAction<
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any,
  >
  extends CoreElement<K, T, P, C, E>
  implements ICoreAction<K, T, P, C, E>
{
  abstract register(): void;
}

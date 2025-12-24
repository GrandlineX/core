import {
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
} from '../lib/index.js';
import CoreElement from './CoreElement.js';

/**
 * Base class for presenters within the Core framework.
 *
 * @template A    The type of application instance managed by the presenter.
 * @template K    The kernel type. Defaults to {@link ICoreKernel<any>}.
 * @template T    The data‑base type or {@code null}. Defaults to {@code any}.
 * @template P    The client type or {@code null}. Defaults to {@code any}.
 * @template C    The cache type or {@code null}. Defaults to {@code any}.
 * @template E    The parent presenter type or {@code null}. Defaults to {@code any}.
 */
export default abstract class CorePresenter<
    A,
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any,
  >
  extends CoreElement<K, T, P, C, E>
  implements ICorePresenter<A, K, T, P, C, E>
{
  constructor(
    channel: string,
    module: ICoreKernelModule<any, any, any, any, any>,
  ) {
    super(`presenter-${channel}`, module);
  }

  abstract start(): Promise<boolean>;

  abstract stop(): Promise<boolean>;

  abstract getApp(): A;
}

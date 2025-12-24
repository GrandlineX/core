import CoreElement from './CoreElement.js';
import {
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  ICoreService,
  IDataBase,
  ServiceStates,
} from '../lib/index.js';

/**
 * Abstract service class that represents a unit of functionality within the Core framework.
 * Concrete implementations must provide the `start` and `stop` lifecycle methods.
 *
 * @template K - Kernel type extending {@link ICoreKernel}.
 * @template T - DataBase type or {@code null} extending {@link IDataBase}.
 * @template P - Client type or {@code null} extending {@link ICoreClient}.
 * @template C - Cache type or {@code null} extending {@link ICoreCache}.
 * @template E - Presenter type or {@code null} extending {@link ICorePresenter}.
 */
export default abstract class CoreService<
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any,
  >
  extends CoreElement<K, T, P, C, E>
  implements ICoreService<K, T, P, C, E>
{
  skipAutoStart: boolean;

  constructor(
    name: string,
    module: ICoreKernelModule<K, T, P, C, E>,
    skipAutoStart?: boolean,
  ) {
    super(name, module);
    this.skipAutoStart = skipAutoStart || false;
  }

  public forceStop = false;

  public state: ServiceStates = 'INIT';

  abstract start(): Promise<any>;

  abstract stop(): Promise<any>;
  isRunning(): boolean {
    return this.state === 'RUNNING';
  }
}

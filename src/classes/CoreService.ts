import CoreElement from './CoreElement';
import {
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  ICoreService,
  IDataBase,
  ServiceStates,
} from '../lib';

export default abstract class CoreService<
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any
  >
  extends CoreElement<K, T, P, C, E>
  implements ICoreService<K, T, P, C, E>
{
  skipAutoStart: boolean;

  constructor(
    name: string,
    module: ICoreKernelModule<K, T, P, C, E>,
    skipAutoStart?: boolean
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

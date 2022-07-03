import {
  ICoreCache,
  ICoreClient,
  ICoreElement,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
} from '../lib';
import CoreLogChannel from './CoreLogChannel';

export default abstract class CoreElement<
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any
  >
  extends CoreLogChannel
  implements ICoreElement<K, T, P, C, E>
{
  private readonly module: ICoreKernelModule<K, T, P, C, E>;

  constructor(channel: string, module: ICoreKernelModule<K, T, P, C, E>) {
    super(channel, module);
    this.module = module;
  }

  getKernel(): ICoreKernel<any> {
    return this.module.getKernel();
  }

  getModule(): ICoreKernelModule<K, T, P, C, E> {
    return this.module;
  }
}

import {
  ICoreCache,
  ICoreClient,
  ICoreElement,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
} from '../lib';
import CoreElement from './CoreElement';

export default abstract class CoreClient<
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any
  >
  extends CoreElement<K, T, P, C, E>
  implements ICoreElement<K, T, P, C, E>
{
  constructor(channel: string, module: ICoreKernelModule<K, T, P, C, E>) {
    super(`client-${channel}`, module);
  }
}

import {
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
} from '../lib';
import CoreElement from './CoreElement';

export default abstract class CorePresenter<
    A,
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any
  >
  extends CoreElement<K, T, P, C, E>
  implements ICorePresenter<A, K, T, P, C, E>
{
  constructor(
    channel: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(`presenter-${channel}`, module);
  }

  abstract start(): Promise<boolean>;

  abstract stop(): Promise<boolean>;

  abstract getApp(): A;
}

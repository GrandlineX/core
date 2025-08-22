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

import CoreService from './CoreService.js';
import {
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
} from '../lib/index.js';

export default abstract class CoreTriggerService<
  K extends ICoreKernel<any> = ICoreKernel<any>,
  T extends IDataBase<any, any> | null = any,
  P extends ICoreClient | null = any,
  C extends ICoreCache | null = any,
  E extends ICorePresenter<any> | null = any,
> extends CoreService<K, T, P, C, E> {
  triggerName: string;

  constructor(
    name: string,
    triggerName: string,
    module: ICoreKernelModule<K, T, P, C, E>,
    skipAutoStart?: boolean,
  ) {
    super(name, module, skipAutoStart);
    this.triggerName = triggerName;
    this.getKernel().on(triggerName, async () => {
      return this.start();
    });
  }
}

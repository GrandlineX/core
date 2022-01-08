import { ICoreKernelModule, ICorePresenter } from '../lib';
import CoreElement from './CoreElement';

export default abstract class CorePresenter<T>
  extends CoreElement
  implements ICorePresenter<T>
{
  constructor(
    channel: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(`presenter-${channel}`, module);
  }

  abstract start(): Promise<boolean>;

  abstract stop(): Promise<boolean>;

  abstract getApp(): T;
}

import { ICoreEndpoint, ICoreKernelModule } from '../lib';
import CoreElement from './CoreElement';

export default abstract class CoreEndpoint<T>
  extends CoreElement
  implements ICoreEndpoint<T>
{
  constructor(
    chanel: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(`endpoint-${chanel}`, module);
  }

  abstract start(): Promise<boolean>;

  abstract stop(): Promise<boolean>;

  abstract getApp(): T;
}

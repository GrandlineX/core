import {
  ICoreAnyModule,
  ICoreElement,
  ICoreKernel,
  ICoreKernelModule,
} from '../lib';
import CoreLogChannel from './CoreLogChannel';

export default abstract class CoreElement
  extends CoreLogChannel
  implements ICoreElement
{
  channel: string;

  private readonly module: ICoreKernelModule<any, any, any, any, any>;

  constructor(
    channel: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(channel, module);
    this.channel = channel;
    this.module = module;
  }

  getKernel(): ICoreKernel<any> {
    return this.module.getKernel();
  }

  getModule<M extends ICoreAnyModule>(): M {
    return this.module as M;
  }
}

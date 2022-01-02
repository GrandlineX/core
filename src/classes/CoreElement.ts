import { ICoreElement, ICoreKernel, ICoreKernelModule } from '../lib';
import CoreLogChannel from './CoreLogChannel';

export default abstract class CoreElement
  extends CoreLogChannel
  implements ICoreElement
{
  chanel: string;

  private module: ICoreKernelModule<any, any, any, any, any>;

  constructor(
    chanel: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(chanel, module);
    this.chanel = chanel;
    this.module = module;
  }

  getKernel(): ICoreKernel<any> {
    return this.module.getKernel();
  }

  getModule(): ICoreKernelModule<any, any, any, any, any> {
    return this.module;
  }
}

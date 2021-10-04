import { ICoreElement, ICoreKernelModule, ICoreKernel } from '../lib';
import Logger from '../modules/logger/Logger';

export default abstract class CoreElement
  extends Logger
  implements ICoreElement
{
  chanel: string;

  private module: ICoreKernelModule<any, any, any, any, any>;

  constructor(
    chanel: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(chanel, module.getKernel().getGlobalConfig().dir.temp);
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

import { ICoreElement, ICoreKernelModule } from '../lib';
import CoreElement from './CoreElement';

export default abstract class CoreClient
  extends CoreElement
  implements ICoreElement
{
  constructor(
    channel: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(`client-${channel}`, module);
  }
}

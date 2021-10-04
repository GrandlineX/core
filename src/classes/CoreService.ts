import CoreElement from './CoreElement';
import { ICoreService, ServiceStates } from '../lib';

export default abstract class CoreService
  extends CoreElement
  implements ICoreService
{
  public forceStop = false;

  public state: ServiceStates = 'INIT';

  getName() {
    return this.chanel;
  }

  abstract start(): Promise<any>;

  abstract stop(): Promise<any>;
}

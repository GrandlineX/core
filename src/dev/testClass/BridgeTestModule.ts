import { CoreKernelModule } from '../../classes';
import { TCoreKernel } from './TestBaseMod';

export default class BridgeTestModule extends CoreKernelModule<
  TCoreKernel,
  null,
  null,
  null,
  null
> {
  constructor(kernel: TCoreKernel) {
    super('bridgeModule', kernel, 'testModule');
  }

  initModule(): Promise<void> {
    this.log('LaterTHIS');
    return Promise.resolve(undefined);
  }

  startup(): Promise<void> {
    return Promise.resolve(undefined);
  }

  beforeServiceStart(): Promise<void> {
    return Promise.resolve(undefined);
  }

  final(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

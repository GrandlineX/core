import { CoreKernelModule } from '../../classes';
import CoreKernel from '../../CoreKernel';
import { CoreCryptoClient } from '../../modules';

export default class BridgeTestModule extends CoreKernelModule<
  CoreKernel<CoreCryptoClient>,
  null,
  null,
  null,
  null
> {
  constructor(kernel: CoreKernel<CoreCryptoClient>) {
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

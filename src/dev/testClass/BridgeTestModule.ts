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

  async initModule(): Promise<void> {
    this.log('LaterTHIS');
  }
}

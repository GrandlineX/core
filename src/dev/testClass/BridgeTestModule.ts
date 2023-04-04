import { CoreKernelModule } from '../../classes/index.js';
import CoreKernel from '../../CoreKernel.js';
import { CoreCryptoClient } from '../../modules/index.js';

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
    this.debug('LaterTHIS');
  }
}

import { CoreKernelModule } from '../../classes/index.js';
import { CoreCryptoClient } from '../../modules/index.js';
import CoreKernel from '../../CoreKernel.js';

export default class TestBaseModule extends CoreKernelModule<
  CoreKernel<CoreCryptoClient>,
  null,
  null,
  null,
  null
> {
  constructor(kernel: CoreKernel<CoreCryptoClient>) {
    super('testBaseModule', kernel);
  }

  initModule(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

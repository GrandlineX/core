import { CoreKernelModule } from '../../classes';
import { CoreCryptoClient } from '../../modules';
import CoreKernel from '../../CoreKernel';

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

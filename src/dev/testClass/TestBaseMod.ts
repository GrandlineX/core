import { CoreKernelModule } from '../../classes';
import { InMemDB } from '../../modules';
import { ICoreCClient } from '../../lib';
import CoreKernel from '../../CoreKernel';

export type TCoreKernel = CoreKernel<ICoreCClient>;

export default class TestBaseMod extends CoreKernelModule<
  TCoreKernel,
  InMemDB,
  null,
  null,
  null
> {
  beforeServiceStart(): Promise<void> {
    return Promise.resolve(undefined);
  }

  final(): Promise<void> {
    return Promise.resolve(undefined);
  }

  initModule(): Promise<void> {
    this.setDb(new InMemDB(this));
    return Promise.resolve(undefined);
  }

  startup(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

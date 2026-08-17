import {
  CoreAction,
  type CoreCache,
  type CoreDBPrefab,
} from '../../../classes';
import type { ICoreAnyModule } from '../../../lib';
import TestClient from '../client/TestClient';
import CoreKernel from '../../../CoreKernel';
import { CoreCryptoClient } from '../../../modules';
import TestPresenter from '../client/TestPresenter';

export default class TestAction extends CoreAction<
  CoreKernel<CoreCryptoClient>,
  CoreDBPrefab<any>,
  TestClient,
  CoreCache,
  TestPresenter
> {
  constructor(mod: ICoreAnyModule) {
    super('test-action', mod);
  }

  register(): void {
    this.debug('register');
  }
}

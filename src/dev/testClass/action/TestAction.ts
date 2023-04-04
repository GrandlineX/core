import { CoreAction, CoreCache, CoreDBPrefab } from '../../../classes/index.js';
import { ICoreAnyModule } from '../../../lib/index.js';
import TestClient from '../client/TestClient.js';
import CoreKernel from '../../../CoreKernel.js';
import { CoreCryptoClient } from '../../../modules/index.js';
import TestPresenter from '../client/TestPresenter.js';

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

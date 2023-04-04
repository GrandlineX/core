import CorePresenter from '../../../classes/CorePresenter.js';
import { ICoreAnyModule } from '../../../lib/index.js';

export default class TestPresenter extends CorePresenter<null> {
  constructor(module: ICoreAnyModule) {
    super('test-presenter', module);
  }

  getApp(): null {
    return null;
  }

  start(): Promise<boolean> {
    return Promise.resolve(true);
  }

  stop(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

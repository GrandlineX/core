import CorePresenter from '../../../classes/CorePresenter';
import { ICoreAnyModule } from '../../../lib';

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

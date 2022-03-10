import { CoreAction } from '../../../classes';
import { ICoreAnyModule } from '../../../lib';

export default class TestAction extends CoreAction {
  constructor(mod: ICoreAnyModule) {
    super('test-action', mod);
  }

  register(): void {}
}

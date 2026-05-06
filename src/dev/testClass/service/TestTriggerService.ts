import { CoreTriggerService } from '../../../classes/index.js';

import { ICoreAnyModule } from '../../../lib/index.js';

export default class TestTriggerService extends CoreTriggerService {
  constructor(module: ICoreAnyModule) {
    super('test_trigger', 'test_trigger', module);
  }

  async onTrigger(payload?: any): Promise<boolean> {
    this.log('TestTriggerService triggered with payload:', payload);
    return true;
  }
}

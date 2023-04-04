import { CoreTriggerService } from '../../../classes/index.js';

import { ICoreAnyModule } from '../../../lib/index.js';

export default class TestTriggerService extends CoreTriggerService {
  constructor(module: ICoreAnyModule) {
    super('test_trigger', 'test_trigger', module, true);
  }

  async start(): Promise<boolean> {
    return true;
  }

  async stop(): Promise<boolean> {
    return true;
  }
}

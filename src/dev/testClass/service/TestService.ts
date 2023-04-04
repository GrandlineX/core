import { CoreLoopService } from '../../../classes/index.js';
import { XUtil } from '../../../utils/index.js';

export default class TestService extends CoreLoopService {
  async loop(): Promise<void> {
    await XUtil.sleep(2000);
    await this.next();
  }
}

import { CoreLoopService } from '../../../classes';
import { XUtil } from '../../../utils';

export default class TestService extends CoreLoopService {
  async loop(): Promise<void> {
    await XUtil.sleep(2000);
    await this.next();
  }
}

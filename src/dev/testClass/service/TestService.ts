import { CoreLoopService } from '../../../classes';
import { sleep } from '../../../utils';

export default class TestService extends CoreLoopService {
  async loop(): Promise<void> {
    await sleep(2000);
    await this.next();
  }
}

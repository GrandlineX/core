import { XUtil } from '../../utils/index.js';
import TestContext from '../TestContext.js';
import { StoreGlobal } from '../../modules/index.js';

export default function jestEnd() {
  const [kernel, clean] = TestContext.getEntity();
  describe('ShutDown', () => {
    test('exit kernel', async () => {
      const result = await kernel.stop();

      await XUtil.sleep(1000);

      expect(kernel.getState()).toBe('exited');

      expect(result).toBeTruthy();
    });

    test('cleanup', async () => {
      if (clean) {
        XUtil.removeFolderIfExist(
          kernel.getConfigStore().get(StoreGlobal.GLOBAL_PATH_HOME)!,
        );
      }
    });
  });
}

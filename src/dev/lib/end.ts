import { XUtil } from '../../utils';
import TestContext from '../TestContext';

export default function jestEnd() {
  const [kernel, cleanUpPath] = TestContext.getEntity();
  describe('ShutDown', () => {
    test('exit kernel', async () => {
      const result = await kernel.stop();

      await XUtil.sleep(1000);

      expect(kernel.getState()).toBe('exited');

      expect(result).toBeTruthy();
    });

    test('cleanup', async () => {
      if (cleanUpPath) {
        XUtil.removeFolderIfExist(cleanUpPath);
      }
    });
  });
}

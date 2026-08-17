import { describe, test, expect } from 'vitest';
import { XUtil } from '../../utils';
import TestContext from '../TestContext';
import { StoreGlobal } from '../../modules';

export default function jestEnd() {
  describe('end', () => {
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
  });
}

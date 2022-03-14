import { removeFolderIfExist, sleep } from '../../utils';
import { TestContext } from '../../index';

const [kernel, cleanUpPath] = TestContext.getEntity();
describe('ShutDown', () => {
  test('exit kernel', async () => {
    const result = await kernel.stop();

    await sleep(1000);

    expect(kernel.getState()).toBe('exited');

    expect(result).toBeTruthy();
  });

  test('cleanup', async () => {
    if (cleanUpPath) {
      removeFolderIfExist(cleanUpPath);
    }
  });
});

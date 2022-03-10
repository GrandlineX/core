import { removeFolderIfExist, sleep } from '../../utils';
import { TestKernel } from '../DevKernel';

const kernel = TestKernel.getEntity();

describe('ShutDown', () => {
  test('exit kernel', async () => {
    const result = await kernel.stop();

    await sleep(1000);

    expect(kernel.getState()).toBe('exited');

    expect(result).toBeTruthy();
  });

  test('cleanup', async () => {
    removeFolderIfExist(kernel.testPath);
  });
});

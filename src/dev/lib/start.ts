import { TestKernel } from '../DevKernel';

const kernel = TestKernel.getEntity();
describe('Clean start', () => {
  test('preload', async () => {
    expect(kernel.getState()).toBe('init');
  });
  test('start kernel', async () => {
    const result = await kernel.start();
    expect(result).toBe(true);
    expect(kernel.getModCount()).toBe(2);
    expect(kernel.getState()).toBe('running');
  });
});

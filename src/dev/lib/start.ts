import TestContext from '../TestContext';

export default function jestStart() {
  const [kernel, , modLen] = TestContext.getEntity();

  describe('Clean start', () => {
    test('preload', async () => {
      expect(kernel.getState()).toBe('init');
    });

    test('start kernel', async () => {
      const result = await kernel.start();
      expect(result).toBe(true);
      expect(kernel.getModCount()).toBe(modLen === null ? 2 : modLen);
      expect(kernel.getState()).toBe('running');
    });
  });
}

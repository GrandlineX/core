import TestContext from '../TestContext.js';

export default function jestStart() {
  const [kernel, , modLen] = TestContext.getEntity();

  describe('Clean start', () => {
    test('preload', async () => {
      expect(kernel.getState()).toBe('init');
    });

    test('start kernel', async () => {
      const result = await kernel.start();
      expect(result).toBe(true);
      expect(kernel.getModCount()).toBe(modLen ?? 2);
      expect(kernel.getState()).toBe('running');
    });
    test('kernel info', async () => {
      expect(kernel.getModCount(true)).toBe(
        modLen === null ? 2 + 2 : modLen + 2,
      );
      expect(kernel.getServiceList(true).length).toBeGreaterThan(0);
      expect(kernel.getActionList(true).length).toBeGreaterThan(0);
      expect(kernel.getState()).toBe('running');
    });
  });
}

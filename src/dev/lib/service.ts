import { describe, test, expect } from 'vitest';
import TestContext from '../TestContext';

export default function jestService() {
  describe('service', () => {
    const [kernel] = TestContext.getEntity();
    describe('CoreKernelModule service management', () => {
      test('stopService - non-existent service returns null', async () => {
        const mod = kernel.getChildModule('testModule') as any;
        const result = await mod.stopService('__nonexistent__');
        expect(result).toBeNull();
      });
      test('startService - non-existent service returns null', async () => {
        const mod = kernel.getChildModule('testModule') as any;
        const result = await mod.startService('__nonexistent__');
        expect(result).toBeNull();
      });
    });
  });
}

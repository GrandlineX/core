import { describe, test } from 'vitest';
import TestContext from '../TestContext';

export default function testLogger() {
  describe('logger', () => {
    const [kernel] = TestContext.getEntity();
    describe('Advanced Logger', () => {
      test('Write Many lines', async () => {
        for (let i = 0; i < 1000; i++) {
          kernel.debug(`Test debug line ${i}`);
        }
      });
    });
  });
}

import { TestContext } from '../../index';

const [kernel] = TestContext.getEntity();

describe('EnvStore', () => {
  test('can load from .env file', async () => {
    const store = kernel.getConfigStore();
    expect(store.has('TESTENV')).toBeTruthy();
    expect(store.get('TESTENV')).toBe('testdata');
  });
});

import fs from 'fs';
import * as Path from 'node:path';
import * as os from 'node:os';
import { EnvStore, StoreGlobal } from '../../modules/index.js';
import TestContext from '../TestContext.js';

export default function jestStore() {
  const [kernel] = TestContext.getEntity();

  describe('EnvStore', () => {
    test('can load from .env file', async () => {
      const store = kernel.getConfigStore();
      expect(store.has('TESTENV')).toBeTruthy();
      expect(store.get('TESTENV')).toBe('testdata');
    });
    test('getBulk returns values with fallback defaults', () => {
      const store = kernel.getConfigStore() as EnvStore;
      const results = store.getBulk(
        ['TESTENV'],
        ['NON_EXISTENT_ENV_KEY', 'fallback'],
      );
      expect(results[0]).toBe('testdata');
      expect(results[1]).toBe('fallback');
    });
    test('delete removes a key', () => {
      const store = kernel.getConfigStore() as EnvStore;
      store.set('_TEST_DEL_KEY', 'val');
      expect(store.has('_TEST_DEL_KEY')).toBe(true);
      store.delete('_TEST_DEL_KEY');
      expect(store.has('_TEST_DEL_KEY')).toBe(false);
    });
    test('appName with pathOverride sets path globals', () => {
      const tmpDir = fs.mkdtempSync(Path.join(os.tmpdir(), 'envstore-'));
      const store = new EnvStore({
        log: kernel.getModule() as any,
        appName: 'TestApp',
        pathOverride: tmpDir,
      });
      expect(store.has(StoreGlobal.GLOBAL_PATH_HOME)).toBe(true);
      expect(store.has(StoreGlobal.GLOBAL_PATH_DATA)).toBe(true);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    test('loadFromFile parses valid key=value lines and skips comments', () => {
      const tmpDir = fs.mkdtempSync(Path.join(os.tmpdir(), 'envstore-'));
      const envFile = Path.join(tmpDir, '.env');
      fs.writeFileSync(
        envFile,
        '# this is a comment\nLOADED_KEY=loaded_value\nNO_EQUALS_HERE\n  SPACED = with spaces  \n',
      );
      const store = new EnvStore({
        log: kernel.getModule() as any,
        envFilePath: tmpDir,
      });
      expect(store.get('LOADED_KEY')).toBe('loaded_value');
      expect(store.get('SPACED')).toBe('with spaces');
      expect(store.has('NO_EQUALS_HERE')).toBe(false);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    test('missing envFilePath path emits warning and continues', () => {
      const store = new EnvStore({
        log: kernel.getModule() as any,
        envFilePath: '/nonexistent/path/xyz',
      });
      expect(store).toBeDefined();
      expect(store.has(StoreGlobal.GLOBAL_OS)).toBe(true);
    });
    test('loadFromLocalEnv loads process.env entries', () => {
      process.env._TEST_LOCAL_VAR = 'localval';
      const store = new EnvStore({
        log: kernel.getModule() as any,
        loadFromLocalEnv: true,
      });
      expect(store.get('_TEST_LOCAL_VAR')).toBe('localval');
      delete process.env._TEST_LOCAL_VAR;
    });
    test('GLOBAL_APP_VERSION falls back to 0.0.0 when npm_package_version is unset', () => {
      const orig = process.env.npm_package_version;
      delete process.env.npm_package_version;
      const store = new EnvStore({ log: kernel.getModule() as any });
      expect(store.get(StoreGlobal.GLOBAL_APP_VERSION)).toBe('0.0.0');
      if (orig !== undefined) {
        process.env.npm_package_version = orig;
      }
    });
  });
}

import { describe, test, expect } from 'vitest';
import fs from 'fs';
import TestContext from '../TestContext';
import { StoreGlobal } from '../../modules';

export default function jestStart() {
  describe('start', () => {
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
      test('kernel folder', async () => {
        const folderList = kernel
          .getConfigStore()
          .getBulk(
            [StoreGlobal.GLOBAL_PATH_HOME],
            [StoreGlobal.GLOBAL_PATH_DATA],
            [StoreGlobal.GLOBAL_PATH_DB],
            [StoreGlobal.GLOBAL_PATH_TEMP],
          );
        for (const folder of folderList) {
          expect(fs.existsSync(folder)).toBeTruthy();
        }
      });
    });
  });
}

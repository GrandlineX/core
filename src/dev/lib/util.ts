import { XUtil } from '../../utils/index.js';
import {
  CMap,
  CoreCachedFc,
  CoreSemaphor,
  CoreTimeCache,
} from '../../classes/index.js';
import { DefaultLogger } from '../../modules/index.js';

export default function jestUtils() {
  describe('utils', () => {
    test('exec', async () => {
      const cmd = await XUtil.exec('echo', ['helloWorld'], { shell: true });
      expect(cmd.exitCode === null || cmd.exitCode === 0).toBeTruthy();
    });
    test('CoreSemaphor', async () => {
      const sem = new CoreSemaphor(1);
      expect(sem.hasFree()).toBeTruthy();
      const free = await sem.request();
      expect(sem.hasFree()).toBeFalsy();
      free();
      expect(sem.hasFree()).toBeTruthy();
    });
    test('CoreCachedFC', async () => {
      let counter = 0;
      const cached = new CoreCachedFc(2000, async () => {
        counter += 1;
        return counter;
      });
      let res = await cached.get();
      expect(res).toBe(1);
      res = await cached.get();
      expect(res).toBe(1);
      await XUtil.sleep(2000);
      res = await cached.get();
      expect(res).toBe(2);
    });
    test('CoreTimeCache', async () => {
      const cached = new CoreTimeCache<{ a: number }>(
        'test',
        {
          getLogger: () => new DefaultLogger(),
        },
        500,
      );
      cached.set('123', { a: 1 }, 1000);
      expect(cached.get('123')?.a).toBe(1);
      cached.extend('123', 500);
      await XUtil.sleep(2500);
      expect(cached.get('123')?.a).toBeUndefined();
      cached.set('123', { a: 1 }, 1000);
      expect(cached.has('123')).toBeTruthy();
      cached.flash();
      expect(cached.get('123')?.a).toBeUndefined();
      cached.set('123', { a: 1 }, 1000);
      expect(cached.has('123')).toBeTruthy();
      cached.delete('123');
      expect(cached.get('123')?.a).toBeUndefined();
      cached.stop();
    });
    test('CMap', async () => {
      let map = new CMap<string, number>();
      map.set('fist', 0);
      map.set('second', 1);
      expect(map.toKeyArray()).toHaveLength(2);
      expect(map.toValueArray()).toHaveLength(2);
      expect(map.map((x) => x)).toHaveLength(2);
      map.clear();
      expect(map.size).toBe(0);
      map = new CMap<string, number>([
        ['first', 1],
        ['first', 1],
        ['sec', 2],
        ['third', 3],
      ]);
      expect(map.size).toBe(3);
      for (const [k, v] of map) {
        expect(v).toBe(map.get(k));
      }
      expect(map.values()).toBeDefined();
      expect(map.has('no')).toBeFalsy();
      expect(map.has('first')).toBeTruthy();
      expect(map[Symbol.iterator]()).toBeDefined();
      expect(map.keys()).toBeDefined();
      expect(map.entries()).toBeDefined();
      map.deleteSelected((value) => {
        return value > 1;
      });
      expect(map.size).toBe(1);
      expect(
        map.merge(
          new CMap<string, number>([
            ['first', 2],
            ['second', 3],
          ]),
        ).size,
      ).toBe(2);
      expect(
        map.merge(
          new CMap<string, number>([
            ['first', 4],
            ['second', 5],
          ]),
          true,
        ).size,
      ).toBe(2);
      expect(map.get('first')).toBe(2);
    });
  });
}

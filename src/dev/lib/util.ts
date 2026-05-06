import fs from 'fs';
import * as Path from 'node:path';
import * as os from 'node:os';
import { Executable, XUtil } from '../../utils/index.js';
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

    test('numPrint - single digit gets leading zero', () => {
      expect(XUtil.numPrint(5)).toBe('05');
      expect(XUtil.numPrint(0)).toBe('00');
      expect(XUtil.numPrint(9)).toBe('09');
    });
    test('numPrint - double digit stays as-is', () => {
      expect(XUtil.numPrint(10)).toBe('10');
      expect(XUtil.numPrint(99)).toBe('99');
    });
    test('getTimeStamp returns formatted string', () => {
      const ts = XUtil.getTimeStamp();
      expect(typeof ts).toBe('string');
      expect(ts).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
    test('workerFactoryFromArray processes all items', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result = await XUtil.workerFactoryFromArray(
        2,
        arr,
        async (item) => ({
          i: item.i,
          dat: item.dat * 2,
        }),
      );
      expect(result).toHaveLength(5);
      expect(result.sort((a, b) => a - b)).toEqual([2, 4, 6, 8, 10]);
    });
    test('workerFactoryFromArray - empty array', async () => {
      const result = await XUtil.workerFactoryFromArray(
        2,
        [],
        async (item) => ({
          i: item.i,
          dat: item.dat,
        }),
      );
      expect(result).toHaveLength(0);
    });
    test('workerFactoryWithProducer processes items', async () => {
      const items = [10, 20, 30];
      let idx = 0;
      const result = await XUtil.workerFactoryWithProducer(
        2,
        async () => {
          const cur = idx++;
          if (cur >= items.length) return null;
          return { i: cur, dat: items[cur] };
        },
        async (item) => ({ i: item.i, dat: item.dat + 1 }),
      );
      expect(result).toHaveLength(3);
    });
    test('calcDirSize - sums file sizes recursively', async () => {
      const tmpDir = fs.mkdtempSync(Path.join(os.tmpdir(), 'xutil-test-'));
      fs.writeFileSync(Path.join(tmpDir, 'a.txt'), 'hello');
      const sub = Path.join(tmpDir, 'sub');
      fs.mkdirSync(sub);
      fs.writeFileSync(Path.join(sub, 'b.txt'), 'world!');
      const size = await XUtil.calcDirSize(tmpDir);
      expect(size).toBeGreaterThan(0);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    test('calcDirSize - excludes specified entries', async () => {
      const tmpDir = fs.mkdtempSync(Path.join(os.tmpdir(), 'xutil-test-'));
      fs.writeFileSync(Path.join(tmpDir, 'keep.txt'), 'keep');
      fs.writeFileSync(Path.join(tmpDir, 'skip.txt'), 'skip this file');
      const sizeWithout = await XUtil.calcDirSize(tmpDir, ['skip.txt']);
      const sizeFull = await XUtil.calcDirSize(tmpDir);
      expect(sizeFull).toBeGreaterThan(sizeWithout);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    test('getEntityNames - throws for object without Entity metadata', () => {
      expect(() => XUtil.getEntityNames({} as any)).toThrow('InvalidClassMeta');
    });
    describe('Executable callbacks', () => {
      test('onStdOut callback receives data', async () => {
        const received: string[] = [];
        const exe = new Executable('echo', {
          shell: true,
          onStdOut: (d) => received.push(d),
        });
        const result = await exe.run(['hello_callback']);
        expect(result.exitCode === null || result.exitCode === 0).toBe(true);
        expect(received.length).toBeGreaterThan(0);
      });
      test('onStdErr callback receives data on error', async () => {
        const received: string[] = [];
        const exe = new Executable('ls', {
          shell: true,
          onStdErr: (d) => received.push(d),
        });
        const result = await exe.run(['/nonexistent_path_xyz_abc']);
        expect(result.error).toBe(true);
        expect(received.length).toBeGreaterThan(0);
      });
    });
  });
}

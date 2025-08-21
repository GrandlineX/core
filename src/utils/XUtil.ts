import fs from 'fs';
import * as Path from 'path';
import https from 'https';
import http from 'http';
import { ColumnProps, getEntityMeta, IEntity } from '../classes/index.js';
import CoreEntity from '../classes/CoreEntity.js';
import { Executable, ExecutableOptions } from './Executable.js';

export interface ClassNameInterface {
  className: string;
  tableName: string;
}
export type WDat<T> = { dat: T; i: number };
export type XExecResult = {
  exitCode: number | null;
  error: boolean;
  stdout: string;
  stderr: string;
};
export const MineTypeMap = new Map<string, string>([
  ['text/html; charset=utf-8', 'html'],
  ['text/html', 'html'],
  ['text/plain', 'txt'],
  ['video/mp4', 'mp4'],
  ['video/mpeg', 'mpeg'],
  ['video/webm', 'webm'],
  ['audio/webm', 'weba'],
  ['audio/mpeg', 'mp3'],
  ['audio/wav', 'wav'],
  ['audio/aac', 'aac'],
  ['audio/webm', 'aac'],
  ['audio/opus', 'opus'],
  ['image/webp', 'webp'],
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/gif', 'gif'],
  ['image/webp', 'webp'],
  ['image/svg+xml', 'svg'],
  ['application/pdf', 'pdf'],
  ['application/zip', 'zip'],
  ['application/x-rar-compressed', 'rar'],
  ['application/x-7z-compressed', '7z'],
  ['application/x-tar', 'tar'],
  ['application/x-bzip2', 'bz2'],
  ['application/x-gzip', 'gz'],
  ['application/json; charset=utf-8', 'json'],
]);

function selectClient(url: string) {
  if (url.startsWith('https')) {
    return https;
  }
  return http;
}

export class XUtil {
  /*
   * TIME
   */
  static sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  static numPrint(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  static getTimeStamp(): string {
    const date = new Date();
    return `${date.getFullYear()}-${this.numPrint(
      date.getMonth() + 1,
    )}-${this.numPrint(date.getDate())} ${this.numPrint(
      date.getHours(),
    )}:${this.numPrint(date.getMinutes() + 1)}:${this.numPrint(
      date.getSeconds(),
    )}`;
  }

  /*
   * WORKER FACTORY
   */
  static async workerFc<T, F>(
    producer: () => Promise<WDat<T> | null>,
    consumer: (arg: WDat<T>) => Promise<WDat<F>>,
    oMap: Map<number, F>,
  ): Promise<void> {
    let next = await producer();
    while (next) {
      const res = await consumer(next);
      oMap.set(res.i, res.dat);
      next = await producer();
    }
  }

  static async workerFactoryWithProducer<T, F>(
    count: number,
    producer: () => Promise<WDat<T> | null>,
    consumer: (arg: WDat<T>) => Promise<WDat<F>>,
  ) {
    const oMap = new Map<number, F>();
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(this.workerFc(producer, consumer, oMap));
    }
    await Promise.all(promises);

    return Array.from(oMap.values());
  }

  static async workerFactoryFromArray<X, F>(
    count: number,
    arr: Array<X>,
    mapper: (arg: WDat<X>) => Promise<WDat<F>>,
  ) {
    let i = 0;
    return this.workerFactoryWithProducer(
      count,
      async () => {
        const cur = i++;
        const curEl = arr[cur];
        if (curEl) {
          return {
            i: cur,
            dat: curEl,
          };
        }
        return null;
      },
      mapper,
    );
  }

  /*
   * FS-UTIL
   */

  static createFolderBulk(...path: string[]): boolean {
    let res = true;
    path.forEach((e) => {
      if (!this.createFolderIfNotExist(e)) {
        res = false;
      }
    });
    return res;
  }

  static createFolderIfNotExist(path: string): boolean {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    return true;
  }

  static removeFolderIfExist(path: string): boolean {
    if (fs.existsSync(path)) {
      fs.rmSync(path, {
        recursive: true,
        force: true,
      });
    }
    return true;
  }

  /*
   * STRING-UTIL
   */

  /**
   * Convert Camel case string to snake case
   */
  static camelToSnakeCase(str: string): string {
    if (str.length === 0) {
      return str;
    }
    const className = str.substring(0, 1).toLowerCase() + str.substring(1);
    return className.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /*
   * Entity Util
   */

  static entityRelation<T extends CoreEntity>(entity: T, schema?: string) {
    const name = this.getEntityNames(entity);
    return {
      key: 'e_id',
      relation: name.tableName,
      schema,
    };
  }

  static entityRelationColumn<T extends CoreEntity>(
    entity: T,
    schema?: string,
  ): ColumnProps {
    return {
      dataType: 'string',
      foreignKey: this.entityRelation(entity, schema),
    };
  }

  /**
   * getTableName  by entity
   * @param entity
   */
  static getEntityNames(entity: IEntity): ClassNameInterface {
    const meta = getEntityMeta(entity);
    if (!meta) {
      throw new Error('InvalidClassMeta');
    }
    return {
      className: meta.name,
      tableName: this.camelToSnakeCase(meta.name),
    };
  }

  static setupEnvironment(
    basePath: string[],
    config: string[],
    other?: string[],
  ): string[] {
    const base = Path.join(...basePath);
    const out = [];
    let confPath = base;
    for (const e of config) {
      confPath = Path.join(confPath, e);
      this.createFolderIfNotExist(confPath);
    }
    out.push(confPath);
    other?.forEach((e) => {
      this.createFolderIfNotExist(Path.join(confPath, e));
    });

    return out;
  }

  static exec(
    cmd: string,
    args?: string[],
    options?: ExecutableOptions,
  ): Promise<XExecResult> {
    const exe = new Executable(cmd, options);
    return exe.run(args);
  }

  static downloadFile(
    url: string,
    path: string,
    extMap = MineTypeMap,
  ): Promise<{
    name: string;
    size: number;
    type: string;
  } | null> {
    return new Promise((resolve) => {
      try {
        selectClient(url)
          .get(url, (res) => {
            const raw = extMap.get(res.headers['content-type'] as string);
            const ext = raw || 'blob';
            const fName = `${path}.${ext}`;
            const file = fs.createWriteStream(fName);
            // A chunk of data has been received.
            res.on('data', (chunk) => {
              file.write(chunk);
            });

            // The whole response has been received. Print out the result.
            res.on('end', () => {
              const cl = res.headers['content-length'];
              const cli = parseInt(cl as string, 10);
              file.close();
              resolve({
                size: cli,
                name: Path.basename(fName),
                type: res.headers['content-type'] || '',
              });
            });
          })
          .on('error', (err) => {
            console.error(`Error: ${err.message}`);
            resolve(null);
          });
      } catch (e) {
        console.error(e);
        resolve(null);
      }
    });
  }
}

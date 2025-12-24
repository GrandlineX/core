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

/**
 * Returns the appropriate HTTP client module based on the URL scheme.
 *
 * @param {string} url - The URL to evaluate. If it starts with "https", the https module is returned; otherwise, the http module is returned.
 * @return {object} The HTTP client module to use (http or https).
 */
function selectClient(url: string) {
  if (url.startsWith('https')) {
    return https;
  }
  return http;
}

/**
 * Utility class providing helper functions for timing, worker pools, file system operations,
 * string manipulation, entity metadata handling, environment setup, command execution,
 * and file downloading.
 */
export class XUtil {
  /**
   * Pauses execution for the specified duration.
   *
   * @param {number} ms - The number of milliseconds to wait before resolving the promise.
   * @returns {Promise<void>} A promise that resolves after the specified delay.
   */
  static sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Formats a number as a two‑digit string. If the provided number is less than 10, a leading zero is added.
   *
   * @param {number} num - The number to format.
   * @return {string} The formatted number as a string, padded with a leading zero if necessary.
   */

  static numPrint(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  /**
   * Returns the current timestamp as a formatted string.
   *
   * @return {string} A string in the format "YYYY-MM-DD HH:mm:ss" representing the current date and time.
   */
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

  /**
   * Processes a stream of data asynchronously using a producer and a consumer.
   *
   * @template T - The type of the input data produced by the producer.
   * @template F - The type of the output data produced by the consumer.
   *
   * @param {() => Promise<WDat<T> | null>} producer
   *   A function that asynchronously returns a `WDat<T>` instance or `null` when no
   *   more items are available to process.
   *
   * @param {(arg: WDat<T>) => Promise<WDat<F>>} consumer
   *   A function that consumes a `WDat<T>` object and asynchronously returns a
   *   `WDat<F>` instance containing the processed data.
   *
   * @param {Map<number, F>} oMap
   *   A map that will receive the results from the consumer. The key is the
   *   `i` property of the `WDat` object and the value is the processed data.
   *
   * @returns {Promise<void>}
   *   Resolves when the producer has returned `null` and all produced items have
   *   been consumed and stored in the provided map.
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

  /**
   * Creates a set of concurrent workers that fetch items from a producer, process them with a consumer, and collects the results.
   *
   * @template T The type of data produced by the `producer` function.
   * @template F The type of data produced by the `consumer` function.
   *
   * @param {number} count - The number of worker instances to run concurrently.
   * @param {() => Promise<WDat<T> | null>} producer - An async function that yields a `WDat<T>` object or `null` to indicate no more items.
   * @param {(arg: WDat<T>) => Promise<WDat<F>>} consumer - An async function that receives a `WDat<T>` item and returns a processed `WDat<F>` object.
   *
   * @returns {Promise<F[]>} A promise that resolves to an array containing the `F` values extracted from the processed `WDat<F>` objects.
   */
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

  /**
   * Creates a worker factory that processes an array of items using a pool of workers.
   *
   * @param {number} count
   *   The maximum number of workers that will run concurrently.
   *
   * @param {Array<X>} arr
   *   The array of input data items to be processed.
   *
   * @param {(arg: WDat<X>) => Promise<WDat<F>>} mapper
   *   A function that receives an element wrapped in a {@link WDat} object and returns a promise that resolves to a {@link WDat} containing the mapped result.
   *
   * @returns {Promise<unknown>}
   *   A promise that resolves when all workers have finished processing, with the value returned by {@link workerFactoryWithProducer}.
   */
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

  /**
   * Creates multiple folders if they do not already exist.
   *
   * @param {...string} path - One or more folder paths to create.
   * @returns {boolean} `true` if all folders were created successfully or already existed; `false` if any folder failed to be created.
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

  /**
   * Creates a folder at the specified path if it does not already exist.
   *
   * @param {string} path - The path of the folder to create.
   * @return {boolean} Always returns true.
   */
  static createFolderIfNotExist(path: string): boolean {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    return true;
  }

  /**
   * Removes the folder at the given path if it exists.
   *
   * @param {string} path - The file system path of the folder to delete.
   * @returns {boolean} Returns true after attempting the removal. The method
   * performs the deletion only when the folder is present; otherwise it
   * simply returns true.
   */
  static removeFolderIfExist(path: string): boolean {
    if (fs.existsSync(path)) {
      fs.rmSync(path, {
        recursive: true,
        force: true,
      });
    }
    return true;
  }

  /**
   * Converts a camelCase string to snake_case.
   * @param {string} str - The camelCase string to convert.
   * @returns {string} The converted snake_case string. If the input string is empty, the same empty string is returned.
   */
  static camelToSnakeCase(str: string): string {
    if (str.length === 0) {
      return str;
    }
    const className = str.substring(0, 1).toLowerCase() + str.substring(1);
    return className.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * Returns the relation metadata for a given entity.
   *
   * @param {T} entity - The entity instance for which to retrieve relation metadata.
   * @param {string} [schema] - Optional database schema name to associate with the relation.
   *
   * @returns {{key: string, relation: string, schema?: string}}
   *   An object containing:
   *   - `key`: the fixed key name `'e_id'`.
   *   - `relation`: the table name derived from the entity.
   *   - `schema`: the optional schema name if provided.
   */
  static entityRelation<T extends CoreEntity>(entity: T, schema?: string) {
    const name = this.getEntityNames(entity);
    return {
      key: 'e_id',
      relation: name.tableName,
      schema,
    };
  }

  /**
   * Returns the column properties for a relation to the specified entity.
   *
   * @param {T} entity The entity to which the column will reference.
   * @param {string} [schema] Optional schema name for the foreign key.
   * @returns {ColumnProps} An object containing the column data type and foreign key definition.
   */
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
   * Retrieves the class and table names for the supplied entity.
   *
   * @param {IEntity} entity - The entity instance from which to extract metadata.
   * @returns {ClassNameInterface} An object containing the class name and the corresponding table name derived from the entity metadata.
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

  /**
   * Sets up the environment by creating the specified folder hierarchy.
   *
   * @param {string[]} basePath - The components that form the base path for the environment.
   * @param {string[]} config - The sequence of folder names to be appended to the base path, creating nested directories.
   * @param {string[]} [other] - Optional additional folder names that will be created inside the final configuration directory.
   * @returns {string[]} An array containing the final configuration path after all directories have been created.
   */
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

  /**
   * Executes the specified command with optional arguments and options.
   *
   * @param {string} cmd - The command to execute.
   * @param {string[]} [args] - Optional list of arguments to pass to the command.
   * @param {ExecutableOptions} [options] - Optional execution options.
   * @returns {Promise<XExecResult>} A promise that resolves with the execution result.
   */
  static exec(
    cmd: string,
    args?: string[],
    options?: ExecutableOptions,
  ): Promise<XExecResult> {
    const exe = new Executable(cmd, options);
    return exe.run(args);
  }

  /**
   * Downloads a file from the specified URL and writes it to the given path.
   *
   * @param {string} url - The URL from which to download the file.
   * @param {string} path - The destination file path without extension. The file extension is derived from the response MIME type.
   * @param {Map<string,string>} [extMap=MineTypeMap] - A map that associates MIME types with file extensions. Used to determine the file extension to append.
   * @returns {Promise<{name:string, size:number, type:string} | null>} A promise that resolves to an object containing the file name, size in bytes, and MIME type, or null if the download fails.
   */
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

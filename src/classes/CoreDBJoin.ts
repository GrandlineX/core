import CoreEntityWrapper from './CoreEntityWrapper.js';
import CoreEntity from './CoreEntity.js';
import { QInterface } from '../lib/index.js';
import { XUtil } from '../utils/index.js';

export default class CoreDBJoin<
  T extends CoreEntity = any,
  F extends CoreEntity = any
> {
  a: CoreEntityWrapper<T>;

  b: CoreEntityWrapper<F>;

  key: keyof T;

  key_2: keyof F;

  constructor(
    dat: [CoreEntityWrapper<T>, keyof T, keyof F, CoreEntityWrapper<F>]
  ) {
    const [a, aKey, bKey, b] = dat;
    this.a = a;
    this.b = b;
    this.key = aKey;
    this.key_2 = bKey;
  }

  async join(query?: QInterface<T>) {
    const q = await this.a.getObjList(query);
    return XUtil.workerFactoryFromArray(4, q, async (arg) => {
      const cur = arg.dat[this.key];
      if (typeof cur === 'string') {
        return {
          i: arg.i,
          dat: {
            ...arg,
            join_map: await this.b.getObjById(cur),
          },
        };
      }
      return {
        i: arg.i,
        dat: {
          ...arg,
          join_map: null,
        },
      };
    });
  }
}

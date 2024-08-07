import {
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
} from '../lib/index.js';
import CoreElement from './CoreElement.js';
import { IEntity } from './annotation/index.js';

export default abstract class CoreCache<
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any,
  >
  extends CoreElement<K, T, P, C, E>
  implements ICoreCache<K, T, P, C, E>
{
  constructor(
    channel: string,
    module: ICoreKernelModule<any, any, any, any, any>,
  ) {
    super(`cache-${channel}-${module.getName()}`, module);
  }

  abstract start(): Promise<void>;

  abstract stop(): Promise<void>;

  abstract set(key: string, val: string): Promise<void>;

  abstract get(key: string): Promise<string | null>;

  abstract delete(key: string): Promise<void>;

  abstract clearAll(): Promise<void>;

  abstract exist(key: string): Promise<boolean>;

  abstract clearAllE(className: string): Promise<void>;

  abstract deleteE(className: string, e_id: string): Promise<boolean>;

  abstract getE<R extends IEntity>(
    className: string,
    e_id: string,
  ): Promise<R | null>;

  abstract setE<R extends IEntity>(className: string, val: R): Promise<void>;
}

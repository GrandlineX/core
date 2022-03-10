import { ICoreCache, ICoreKernelModule } from '../lib';
import CoreElement from './CoreElement';
import { IEntity } from './annotation';

export default abstract class CoreCache
  extends CoreElement
  implements ICoreCache
{
  constructor(
    channel: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(`client-${channel}`, module);
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

  abstract getE<E extends IEntity>(
    className: string,
    e_id: string
  ): Promise<E | null>;

  abstract setE<E extends IEntity>(className: string, val: E): Promise<void>;
}

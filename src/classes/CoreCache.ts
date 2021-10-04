import { ICoreCache, ICoreKernelModule } from '../lib';
import CoreElement from './CoreElement';

export default abstract class CoreCache
  extends CoreElement
  implements ICoreCache
{
  constructor(
    chanel: string,
    module: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(`client-${chanel}`, module);
  }

  abstract start(): Promise<void>;

  abstract stop(): Promise<void>;

  abstract set(key: string, val: string): Promise<void>;

  abstract get(key: string): Promise<string | null>;

  abstract delete(key: string): Promise<void>;

  abstract clearAll(key: string): Promise<void>;

  abstract exist(key: string): Promise<boolean>;
}

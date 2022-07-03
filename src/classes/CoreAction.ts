import {
  ICoreAction,
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICorePresenter,
  IDataBase,
} from '../lib';
import CoreElement from './CoreElement';

export default abstract class CoreAction<
    K extends ICoreKernel<any> = ICoreKernel<any>,
    T extends IDataBase<any, any> | null = any,
    P extends ICoreClient | null = any,
    C extends ICoreCache | null = any,
    E extends ICorePresenter<any> | null = any
  >
  extends CoreElement<K, T, P, C, E>
  implements ICoreAction<K, T, P, C, E>
{
  abstract register(): void;
}

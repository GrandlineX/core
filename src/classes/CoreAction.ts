import { ICoreAction } from '../lib';
import CoreElement from './CoreElement';

export default abstract class CoreAction
  extends CoreElement
  implements ICoreAction
{
  abstract register(): void;
}

import CoreService from './CoreService.js';
import {
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
} from '../lib/index.js';

/**
 * Abstract service that starts automatically when a specified trigger event is emitted by the kernel.
 *
 * The service inherits from {@link CoreService} and listens for the kernel event identified by
 * {@link CoreTriggerService.triggerName}. When the event fires, the service's {@link CoreService.start}
 * method is invoked, ensuring that the service is activated in response to external signals.
 *
 * @template K extends ICoreKernel<any> = ICoreKernel<any>
 * @template T extends IDataBase<any, any> | null = any
 * @template P extends ICoreClient | null = any
 * @template C extends ICoreCache | null = any
 * @template E extends ICorePresenter<any> | null = any
 * @extends CoreService<K, T, P, C, E>
 */
export default abstract class CoreTriggerService<
  K extends ICoreKernel<any> = ICoreKernel<any>,
  T extends IDataBase<any, any> | null = any,
  P extends ICoreClient | null = any,
  C extends ICoreCache | null = any,
  E extends ICorePresenter<any> | null = any,
> extends CoreService<K, T, P, C, E> {
  triggerName: string;

  /**
   * Creates an instance that registers a listener on the kernel for a specified trigger.
   *
   * When the kernel emits the event named {@link triggerName}, the listener will
   * invoke {@link start} on this instance. The {@link skipAutoStart} flag determines
   * whether the instance should start automatically during construction or not.
   *
   * @param {string} name The name of the instance.
   * @param {string} triggerName The kernel event name that will trigger a start.
   * @param {ICoreKernelModule<K, T, P, C, E>} module The module associated with this instance.
   * @param {boolean} [skipAutoStart] If true, the instance will not start automatically.
   * @return {void}
   */
  constructor(
    name: string,
    triggerName: string,
    module: ICoreKernelModule<K, T, P, C, E>,
    skipAutoStart?: boolean,
  ) {
    super(name, module, skipAutoStart);
    this.triggerName = triggerName;
    this.getKernel().on(triggerName, async () => {
      return this.start();
    });
  }
}

import Timeout = NodeJS.Timeout;
import CoreService from './CoreService.js';
import {
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
} from '../lib/index.js';
import { XUtil } from '../utils/index.js';

/**
 * CoreLoopService is an abstract service that runs a periodic loop task.
 *
 * @template K The kernel type that extends {@link ICoreKernel<any>}.
 * @template T The database type, defaults to {@link IDataBase<any, any>} or {@code null}.
 * @template P The client type, defaults to {@link ICoreClient} or {@code null}.
 * @template C The cache type, defaults to {@link ICoreCache} or {@code null}.
 * @template E The presenter type, defaults to {@link ICorePresenter<any>} or {@code null}.
 *
 * @extends CoreService<K, T, P, C, E>
 *
 * @param {string} name - Unique identifier for the service instance.
 * @param {number} timeout - Interval in milliseconds between loop executions.
 * @param {ICoreKernelModule<K, T, P, C, E>} module - The kernel module that supplies the service’s dependencies.
 * @param {boolean} [skipAutoStart] - If true, the service will not start automatically after construction.
 *
 * @method async start()
 *   Initiates the service loop. If the service is in the 'INIT' state, it schedules the first
 *   execution immediately; otherwise, it schedules subsequent executions based on the configured
 *   timeout. The method respects the {@link forceStop} flag to avoid restarting after a stop request.
 *
 * @method async startUp()
 *   Internal routine that transitions the service into a 'RUNNING' state and then
 *   executes the {@link loop} method. If a stop has been requested, it moves the service
 *   to a 'SLEEPING' state instead.
 *
 * @method async next()
 *   Moves the service into a 'SLEEPING' state and then restarts it, ensuring the next
 *   loop iteration begins after the configured timeout.
 *
 * @method async stop()
 *   Attempts to halt the service. It sets the {@link forceStop} flag and, depending on the
 *   current state, clears scheduled timers or waits briefly before retrying until the
 *   service is fully stopped.
 *
 * @method setRunning()
 *   Sets the internal state to 'RUNNING' unless a stop has been forced.
 *
 * @method setSleeping()
 *   Sets the internal state to 'SLEEPING'.
 *
 * @abstract async loop()
 *   Subclasses must implement this method to contain the logic that should execute
 *   on each loop cycle. The method is awaited by {@link startUp}.
 */
export default abstract class CoreLoopService<
  K extends ICoreKernel<any> = ICoreKernel<any>,
  T extends IDataBase<any, any> | null = any,
  P extends ICoreClient | null = any,
  C extends ICoreCache | null = any,
  E extends ICorePresenter<any> | null = any,
> extends CoreService<K, T, P, C, E> {
  interval: Timeout | null;

  timeOut: number;

  constructor(
    name: string,
    timeout: number,
    module: ICoreKernelModule<K, T, P, C, E>,
    skipAutoStart?: boolean,
  ) {
    super(name, module, skipAutoStart);
    this.interval = null;
    this.timeOut = timeout;
    this.startUp = this.startUp.bind(this);
  }

  async start(): Promise<any> {
    if (this.state === 'INIT') {
      this.setRunning();
      this.interval = setTimeout(this.startUp, 0);
    } else if (!this.forceStop) {
      this.verbose(this.state);
      this.interval = setTimeout(this.startUp, this.timeOut);
    }
  }

  async startUp(): Promise<any> {
    if (!this.forceStop) {
      this.setRunning();
      this.verbose(this.state);
      await this.loop();
    } else {
      this.setSleeping();
    }
  }

  async next(): Promise<any> {
    this.setSleeping();
    await this.start();
  }

  async stop(): Promise<any> {
    this.debug('try to stop service');
    this.forceStop = true;
    this.debug('ForceStop');
    if (this.state === 'INIT') {
      this.debug('Service Exit 0');
    } else if (this.interval && this.state === 'SLEEPING') {
      clearInterval(this.interval);
      this.debug('Service Exit');
    } else {
      await XUtil.sleep(1000);
      await this.stop();
    }
  }

  setRunning() {
    if (!this.forceStop) {
      this.state = 'RUNNING';
    }
  }

  setSleeping() {
    this.state = 'SLEEPING';
  }

  abstract loop(): Promise<void>;
}

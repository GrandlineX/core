import Timeout = NodeJS.Timeout;
import CoreService from './CoreService';
import {
  ICoreCache,
  ICoreClient,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  IDataBase,
} from '../lib';
import { XUtil } from '../utils';

export default abstract class CoreLoopService<
  K extends ICoreKernel<any> = ICoreKernel<any>,
  T extends IDataBase<any, any> | null = any,
  P extends ICoreClient | null = any,
  C extends ICoreCache | null = any,
  E extends ICorePresenter<any> | null = any
> extends CoreService<K, T, P, C, E> {
  interval: Timeout | null;

  timeOut: number;

  constructor(
    name: string,
    timeout: number,
    module: ICoreKernelModule<K, T, P, C, E>,
    skipAutoStart?: boolean
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
      this.debug(this.state);
      this.interval = setTimeout(this.startUp, this.timeOut);
    }
  }

  async startUp(): Promise<any> {
    if (!this.forceStop) {
      this.setRunning();
      this.debug(this.state);
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
    this.log('try to stop service');
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

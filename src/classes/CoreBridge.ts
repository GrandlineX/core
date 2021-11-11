import { BridgeState, ICoreBridge, ICoreKernelModule } from '../lib';
import { sleep } from '../utils/envUtil';
import CoreLogChannel from './CoreLogChannel';

export default class CoreBridge extends CoreLogChannel implements ICoreBridge {
  private state: BridgeState;

  private src: ICoreKernelModule<any, any, any, any, any>;

  private target: ICoreKernelModule<any, any, any, any, any>;

  constructor(
    src: ICoreKernelModule<any, any, any, any, any>,
    target: ICoreKernelModule<any, any, any, any, any>
  ) {
    super(`BR:${src.getName()} => ${target.getName()}`, src.getKernel());
    this.src = src;
    this.target = target;
    this.state = BridgeState.init;
  }

  connect(): void {
    this.src.addSrcBridge(this);
    this.target.addTarBridge(this);
    this.debug('connected');
  }

  setState(state: BridgeState): void {
    this.state = state;
  }

  async waitForState(state: BridgeState): Promise<boolean> {
    while (this.state !== state) {
      await sleep(1000);
    }
    return true;
  }

  getTarget(): ICoreKernelModule<any, any, any, any, any> {
    return this.target;
  }
}

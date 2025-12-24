import { BridgeState, ICoreBridge, ICoreKernelModule } from '../lib/index.js';
import CoreLogChannel from './CoreLogChannel.js';
import { XUtil } from '../utils/index.js';

/**
 * Manages a bidirectional bridge between two kernel modules.
 *
 * The bridge exposes a simple lifecycle: it can be connected to its source
 * and target modules, its state can be updated, and callers can await a
 * specific state transition.
 *
 * @extends CoreLogChannel
 * @implements ICoreBridge
 */
export default class CoreBridge extends CoreLogChannel implements ICoreBridge {
  private state: BridgeState;

  private src: ICoreKernelModule<any, any, any, any, any>;

  private target: ICoreKernelModule<any, any, any, any, any>;

  constructor(
    src: ICoreKernelModule<any, any, any, any, any>,
    target: ICoreKernelModule<any, any, any, any, any>,
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
      await XUtil.sleep(1000);
    }
    return true;
  }

  getTarget(): ICoreKernelModule<any, any, any, any, any> {
    return this.target;
  }
}

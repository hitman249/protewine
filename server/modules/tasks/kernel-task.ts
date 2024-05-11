import AbstractTask from './abstract-task';
import type WatchProcess from '../../helpers/watch-process';
import {KernelEvent, KernelOperation, SessionType} from '../kernels/abstract-kernel';
import Kernels, {type Kernel} from '../kernels';
import type Command from '../command';
import type FileSystem from '../file-system';
import {RoutesTaskEvent} from '../../routes/routes';
import {TaskType} from './types';

export default class KernelTask extends AbstractTask {
  protected type: TaskType = TaskType.KERNEL;

  private cmd: string;
  private kernel: Kernel;

  constructor(command: Command, kernels: Kernels, fs: FileSystem) {
    super(command, kernels, fs);

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onError = this.onError.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  public async run(cmd: string, operation: KernelOperation, session: SessionType = SessionType.RUN): Promise<WatchProcess> {
    this.cmd = cmd;

    this.unbindEvents();
    this.kernel = this.kernels.getKernel();
    this.bindEvents();

    if (KernelOperation.RUN === operation) {
      this.task = await this.kernel.run(this.cmd, session);
    } else if (KernelOperation.INSTALL === operation) {
      this.task = await this.kernel.run(this.cmd, SessionType.RUN,{WINEDEBUG: ''});
    } else if (KernelOperation.REGISTER === operation) {
      this.task = await this.kernel.register(this.cmd);
    } else if (KernelOperation.LIBRARY === operation) {
      this.task = await this.kernel.regsvr32(this.cmd);
    }

    return this.task;
  }

  private unbindEvents(): void {
    if (!this.kernel) {
      return;
    }

    this.kernel.off(KernelEvent.RUN, this.onRun);
    this.kernel.off(KernelEvent.LOG, this.onLog);
    this.kernel.off(KernelEvent.ERROR, this.onError);
    this.kernel.off(KernelEvent.EXIT, this.onExit);
  }

  private bindEvents(): void {
    this.unbindEvents();

    if (!this.kernel) {
      return;
    }

    this.kernel.on(KernelEvent.RUN, this.onRun);
    this.kernel.on(KernelEvent.LOG, this.onLog);
    this.kernel.on(KernelEvent.ERROR, this.onError);
    this.kernel.on(KernelEvent.EXIT, this.onExit);
  }

  private onRun(event: KernelEvent.RUN, cmd: string): void {
    this.fireEvent(RoutesTaskEvent.RUN, cmd);
  }

  private onLog(event: KernelEvent.LOG, line: string): void {
    this.fireEvent(RoutesTaskEvent.LOG, line);
  }

  private onError(event: KernelEvent.ERROR, error: string): void {
    this.fireEvent(RoutesTaskEvent.ERROR, error);
  }

  private onExit(): void {
    this.fireEvent(RoutesTaskEvent.EXIT);
  }
}
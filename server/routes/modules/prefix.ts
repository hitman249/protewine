import type {BrowserWindow, IpcMain} from 'electron';
import type {App} from '../../app';
import {AbstractModule} from '../../modules/abstract-module';
import {RoutesPrefix} from '../routes';


export default class PrefixRoutes extends AbstractModule {
  private readonly app: App;
  private readonly ipc: IpcMain;
  private readonly window: BrowserWindow;

  constructor(ipcMain: IpcMain, window: BrowserWindow, app: App) {
    super();
    this.ipc = ipcMain;
    this.window = window;
    this.app = app;
  }

  public async init(): Promise<any> {
    this.bindExist();
    this.bindCreate();
    this.bindRefresh();
  }

  private bindExist(): void {
    this.ipc.handle(
      RoutesPrefix.EXIST,
      async (): Promise<boolean> => this.app.getPrefix().isExist(),
    );
  }

  private bindCreate(): void {
    this.ipc.handle(
      RoutesPrefix.CREATE,
      async (): Promise<any> => this.app.getPrefix().create(),
    );
  }

  private bindRefresh(): void {
    this.ipc.handle(
      RoutesPrefix.REFRESH,
      async (): Promise<any> => this.app.getPrefix().refresh(),
    );
  }
}
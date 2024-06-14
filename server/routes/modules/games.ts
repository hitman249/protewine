import type {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import type {App} from '../../app';
import {AbstractModule} from '../../modules/abstract-module';
import {RoutesGames} from '../routes';
import type {ConfigType} from '../../modules/games/config';
import type {ImageType} from '../../modules/gallery';

export default class GamesRoutes extends AbstractModule {
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
    this.bindList();
    this.bindFindLinks();
    this.bindCreate();
    this.bindRemove();
    this.bindUpdateImage();
  }

  private bindList(): void {
    this.ipc.handle(
      RoutesGames.LIST,
      async (): Promise<any> => this.app.getGames().getList(),
    );
  }

  private bindFindLinks(): void {
    this.ipc.handle(
      RoutesGames.FIND_LINKS,
      async (): Promise<any> => this.app.getLinkInfo().findLinks(),
    );
  }

  private bindCreate(): void {
    this.ipc.handle(
      RoutesGames.CREATE,
      async (event: IpcMainInvokeEvent, data: ConfigType['game']): Promise<any> => this.app.getGames().create(data),
    );
  }

  private bindRemove(): void {
    this.ipc.handle(
      RoutesGames.REMOVE,
      async (event: IpcMainInvokeEvent, id: string | number): Promise<any> => this.app.getGames().removeById(id),
    );
  }

  private bindUpdateImage(): void {
    this.ipc.handle(
      RoutesGames.UPDATE_IMAGE,
      async (event: IpcMainInvokeEvent, image: ImageType, id: string, type: 'poster' | 'icon'): Promise<any> =>
        this.app.getGames().updateImage(image, id, type),
    );
  }
}
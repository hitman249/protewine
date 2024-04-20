import {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import {ApiFileSystem, ApiKernel} from './rules';
import _ from 'lodash';
import type FileSystem from '../modules/file-system';
import System from '../modules/system';

export default class Index {
  private readonly ipc: IpcMain;
  private readonly window: BrowserWindow;

  constructor(ipcMain: IpcMain, window: BrowserWindow) {
    this.ipc = ipcMain;
    this.window = window;
  }

  public async init(): Promise<void> {
    this.setApiKernel();
    this.setFileSystemLs();
    this.setFileSystemStorages();
  }

  private setApiKernel(): void {
    this.ipc.handle(
      ApiKernel.VERSION,
      async (): Promise<any> => global.$app.getKernels().getKernel().version(),
    );
  }

  private setFileSystemLs(): void {
    this.ipc.handle(
      ApiFileSystem.LS,
      async (event: IpcMainInvokeEvent, path: string): Promise<any> => {
        const safePath: string = _.trimEnd(path, '/')
          .split('[').join('\\[').split(']').join('\\]')
          .split('(').join('\\(').split(')').join('\\)');

        const fs: FileSystem = global.$app.getFileSystem();
        const list: string[] = await fs.glob(`${safePath}/*`);
        const result: any[] = [];

        for await (const pathfile of list) {
          const directory: boolean = await fs.isDirectory(pathfile);
          const size: number = directory ? 0 : await fs.size(pathfile);

          result.push({
            path: pathfile,
            directory,
            size,
            sizeFormat: directory ? '' : fs.convertBytes(size),
            extension: _.toLower(fs.extension(pathfile)),
            basename: fs.basename(pathfile),
            dirname: fs.dirname(pathfile),
          });
        }

        const compare: (x: string, y: string) => number =
          (new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})).compare;

        return result.sort((a: any, b: any): number => {
          if (b.directory && !a.directory) {
            return 1;
          }

          if (a.directory && !b.directory) {
            return -1;
          }

          const ext: number = compare(a.extension, b.extension);

          if (-1 === ext || 1 === ext) {
            return ext;
          }

          return compare(a.path, b.path);
        });
      },
    );
  }

  private setFileSystemStorages(): void {
    this.ipc.handle(
      ApiFileSystem.STORAGES,
      async (): Promise<any> => {
        const fs: FileSystem = global.$app.getFileSystem();
        const system: System = global.$app.getSystem();

        const storages: string[] = [
          '/',
          await system.getHomeDir(),
        ];

        const media: string[] = [
          `/media/${await system.getUserName()}`,
          '/mnt',
          '/run/media',
        ];

        for await (const path of media) {
          if ((await fs.exists(path)) && (await fs.glob(`${path}/*`)).filter((path: string) => fs.isDirectory(path)).length > 0) {
            storages.push(path);
          }
        }

        return storages.map((path: string) => ({
          path,
          directory: true,
          size: 0,
          sizeFormat: '',
          extension: '',
          basename: fs.basename(path),
          dirname: fs.dirname(path),
        }));
      },
    );
  }
}
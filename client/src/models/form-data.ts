export enum GameOperation {
  INSTALL_FILE = 'install-file',
  INSTALL_IMAGE = 'install-image',
  COPY_GAME = 'copy-game',
  MOVE_GAME = 'move-game',
  SYMLINK_GAME = 'symlink-game',
  IMPORT_LINK = 'import-link',
}

export enum FileManagerMode {
  EXECUTABLE = 'executable',
  IMAGE = 'image',
  DIRECTORY = 'directory',
}

export default class FormData<T> {
  public operation: GameOperation;
  public path: string;
  public data: T;
  public fileManagerMode: FileManagerMode;
  public fileManagerRootPath: string;


  constructor(data: T) {
    this.data = data;
  }

  public setOperation(operation: GameOperation): void {
    this.operation = operation;

    if (GameOperation.INSTALL_FILE === operation) {
      this.fileManagerMode = FileManagerMode.EXECUTABLE;
    } else if (GameOperation.INSTALL_IMAGE === operation) {
      this.fileManagerMode = FileManagerMode.IMAGE;
    } else if (GameOperation.COPY_GAME === operation || GameOperation.MOVE_GAME === operation || GameOperation.SYMLINK_GAME === operation) {
      this.fileManagerMode = FileManagerMode.DIRECTORY;
    } else {
      this.fileManagerMode = undefined;
    }
  }

  public getOperation(): GameOperation {
    return this.operation;
  }

  public getFileManagerMode(): FileManagerMode {
    return this.fileManagerMode;
  }

  public getFileManagerRootPath(): string {
    return this.fileManagerRootPath;
  }

  public setFileManagerRootPath(path: string): this {
    this.fileManagerRootPath = path;
    return this;
  }
}
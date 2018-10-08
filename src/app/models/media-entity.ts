import { ElectronService } from "../providers/electron.service";

export interface MediaEntitySaveData {
    name: string;
    description: string;
}

export abstract class MediaEntity<T = MediaEntitySaveData> {

    protected _type: string;
    public get type(): string {
        return this._type;
    }

    protected _path: string;
    public get path(): string {
        return this._path;
    }

    protected _name: string;
    public get name(): string {
        return this.saveData["name"] ? this.saveData["name"] : this._name;
    }

    protected _imagePath: string;
    public get imagePath(): string {
        return this._imagePath;
    }

    protected _infoPath: string;
    public get infoPath(): string {
        return this._infoPath;
    }

    protected _saveData: T;
    public get saveData(): T {
        return this._saveData;
    }

    protected electronService: ElectronService;

    constructor(entityPath: string, electronService: ElectronService) {
        this._path = entityPath;
        this.electronService = electronService;
    }

    public load() {
        if (!this.electronService.fs.existsSync(this.infoPath)) {
            this.electronService.fs.writeFileSync(this.infoPath, "{}");
        }

        try {
            this._saveData = JSON.parse(<any>this.electronService.fs.readFileSync(this.infoPath));
        } catch (error) {
            this._saveData = null;
        }
    }

    public save(saveData: T = this.saveData) {
        const saveDataString = JSON.stringify(saveData);
        this.electronService.fs.writeFileSync(this.infoPath, saveDataString);
        this._saveData = JSON.parse(saveDataString);
    }
}

import { MediaEntity, MediaEntitySaveData } from "./media-entity";
import { ElectronService } from "../providers/electron.service";
import * as path from "path";


export class Season extends MediaEntity {

    private _episodes: string[];
    public get episodes(): string[] {
        return this._episodes;
    }

    constructor(dirName: string, episodes: string[], electronService: ElectronService) {
        super(dirName, electronService);
        this._name = this.path.split(path.sep).pop();
        this._infoPath = `${this.path}${path.sep}seasoninfo.json`;
        this._type = "season";
        this._episodes = episodes;
        this.load();
    }
}

import { MediaEntity, MediaEntitySaveData } from "./media-entity";
import { ElectronService } from "../providers/electron.service";
import * as path from "path";

export interface MovieSaveData extends MediaEntitySaveData {
    year: string;
    runtime: string;
    genre: string;
    actors: string;
}

export class Movie extends MediaEntity<MovieSaveData> {

    private _fileName: string;
    public get fileName(): string {
        return this._fileName;
    }

    constructor(dirName: string, fileName: string, electronService: ElectronService) {
        super(dirName, electronService);
        this._fileName = fileName;
        this._name = this.path.split(path.sep).pop();
        this._infoPath = `${this.path}${path.sep}movieinfo.json`;
        this._imagePath = `${this.path}${path.sep}poster.jpg`;
        this._type = "movie";
        this.load();
    }
}

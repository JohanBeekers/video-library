import { MediaEntity, MediaEntitySaveData } from "./media-entity";
import { ElectronService } from "../providers/electron.service";
import * as path from "path";
import { Season } from "./season";

export interface SeriesSaveData extends MediaEntitySaveData {
    year: string;
    genre: string;
    actors: string;
    markedSeason?: number;
    markedEpisode?: number;
}

export class Series extends MediaEntity<SeriesSaveData> {

    private _seasons: Season[];
    public get seasons(): Season[] {
        return this._seasons;
    }

    constructor(dirName: string, seasons: Season[], electronService: ElectronService) {
        super(dirName, electronService);
        this._name = this.path.split(path.sep).pop();
        this._infoPath = `${this.path}${path.sep}seriesinfo.json`;
        this._imagePath = `${this.path}${path.sep}poster.jpg`;
        this._type = "series";
        this._seasons = seasons;
        this.load();
    }
}

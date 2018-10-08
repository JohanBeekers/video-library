import * as path from "path";
import { ElectronService } from "../providers/electron.service";
import { MediaEntity } from "./media-entity";

export class MediaGroup extends MediaEntity {

    public children: MediaEntity[];

    constructor(groupPath: string, electronService: ElectronService, children: MediaEntity[] = []) {
        super(groupPath, electronService);
        this._name = groupPath.split(path.sep).pop();
        this._infoPath = `${groupPath}${path.sep}groupinfo.json`;
        this._imagePath = `${groupPath}${path.sep}poster.jpg`;
        this._type = "group";
        this.children = children;
        this.load();
    }
}

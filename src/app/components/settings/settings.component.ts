import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { SettingsService } from "../../providers/settings.service";
import { MediaService } from "../../providers/media.service";
import * as path from "path";

@Component({
    selector: "app-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.scss"]
})
export class SettingsComponent implements OnInit {

    @Output()
    public closeClick: EventEmitter<void> = new EventEmitter();

    constructor(public settingsService: SettingsService, private mediaService: MediaService) {
        // this.settingsService.settings.
    }

    ngOnInit() {
    }

    public close() {
        this.closeClick.emit();
    }

    public resetSettings() {
        this.settingsService.resetSettingsToFactory();
    }

    public reloadSettings() {
        this.settingsService.loadApplicationSettings();
    }

    public save() {
        this.settingsService.saveApplicationSettings();
    }

    public arrayTrackByFn(index: number, extention: string) {
        return index;
    }

    public movieDirChanged(event: Event) {
        if ((<HTMLInputElement>event.srcElement).files.length === 1) {
            let movieDir: string = (<HTMLInputElement>event.srcElement).files[0].path;
            movieDir = path.relative("", movieDir);
            this.settingsService.settings.movieDirectory = movieDir;
        }
    }

    public seriesDirChanged(event: any) {
        if ((<HTMLInputElement>event.srcElement).files.length === 1) {
            let seriesDir: string = (<HTMLInputElement>event.srcElement).files[0].path;
            seriesDir = path.relative("", seriesDir);
            this.settingsService.settings.seriesDirectory = seriesDir;
        }
    }
}

import { Injectable } from "@angular/core";
import { ElectronService } from "./electron.service";
import * as path from "path";

interface Settings {
    movieDirectory: string;
    seriesDirectory: string;
    theme: string;
    movieExtentions: string[];
    omdbApiKey: string;
}

@Injectable({
    providedIn: "root"
})
export class SettingsService {

    private static SETTINGS_FILE = "settings.json";
    static INITIAL_SETTINGS: Settings = {
        movieDirectory: "movies/",
        seriesDirectory: "series/",
        theme: "dark",
        movieExtentions: [".avi", ".mkv", ".mp4", ".wmv", "VIDEO_TS.IFO"],
        omdbApiKey: "2e3f3f5a"
    };

    public settings: Settings;

    constructor(private electronService: ElectronService) {
        this.loadApplicationSettings();
    }

    public loadApplicationSettings() {
        if (this.electronService.isElectron()) {
            if (!this.electronService.fs.existsSync(SettingsService.SETTINGS_FILE)) {
                this.resetSettingsToFactoryAndSave();
            } else {
                try {
                    this.settings = JSON.parse(<any>this.electronService.fs.readFileSync(SettingsService.SETTINGS_FILE));
                } catch (error) {
                    console.error(error);
                    this.settings = SettingsService.INITIAL_SETTINGS;
                }
            }
        }
    }

    public saveApplicationSettings() {
        if (this.electronService.isElectron()) {
            this.electronService.fs.writeFileSync(SettingsService.SETTINGS_FILE, JSON.stringify(this.settings, null, 4));
        }
    }

    public resetSettingsToFactoryAndSave() {
        this.settings = JSON.parse(JSON.stringify(SettingsService.INITIAL_SETTINGS));
        this.saveApplicationSettings();
    }

    public resetSettingsToFactory() {
        this.settings = JSON.parse(JSON.stringify(SettingsService.INITIAL_SETTINGS));
    }
}

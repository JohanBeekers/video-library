import { Injectable } from "@angular/core";
import { ElectronService } from "./electron.service";
import { MediaGroup } from "../models/media-group";
import { Movie } from "../models/movie";
import { MediaEntity } from "../models/media-entity";
import * as path from "path";
import { SettingsService } from "./settings.service";
import { Season } from "../models/season";
import { Series } from "../models/series";

@Injectable({
    providedIn: "root"
})
export class MediaService {

    private groupedMovies: MediaEntity[];
    private allMovies: Movie[];
    private groupedSeries: MediaEntity[];
    private allSeries: Series[];

    private _loadError: string;
    public get loadError(): string {
        return this._loadError;
    }

    constructor(private electronService: ElectronService, private settingsService: SettingsService) { }

    /**
     * Loads all media in a directory.
     * @param dir - The directory to load media from.
     */
    private loadMoviesInDir(dir: string): MediaEntity[] {
        const media: MediaEntity[] = [];
        const files = this.electronService.fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            if (this.electronService.fs.statSync(fullPath).isDirectory()) {
                const children = this.loadMoviesInDir(fullPath);
                if (children.length > 1) {
                    media.push(new MediaGroup(fullPath, this.electronService, children));
                } else {
                    media.push(...children);
                }
            } else if (this.isVideo(file)) {
                const movie = new Movie(dir, file, this.electronService);
                media.push(movie);
                this.allMovies.push(movie);
            }
        });
        return media;
    }

    /**
     * Loads all media in a directory.
     * @param dir - The directory to load media from.
     */
    private loadSeriesInDir(dir: string): MediaEntity[] {
        const media: MediaEntity[] = [];
        const files = this.electronService.fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            if (this.electronService.fs.statSync(fullPath).isDirectory()) {
                const seasonMatch = file.match(/^season\s(\d+)$/i);
                if (seasonMatch) {
                    const episodes: string[] = [];
                    const seasonFiles = this.electronService.fs.readdirSync(fullPath);
                    seasonFiles.forEach(seasonFile => {
                        const episodeMatch = seasonFile.match(/e(\d+)/i) || seasonFile.match(/episode\s?(\d+)/i);
                        if (episodeMatch) {
                            episodes[parseInt(episodeMatch[1], 10) - 1] = seasonFile;
                        }
                    });
                    media[parseInt(seasonMatch[1], 10) - 1] = new Season(fullPath, episodes, this.electronService);
                } else {
                    const children = this.loadSeriesInDir(fullPath);
                    if (children.length > 0 && children.find(child => child instanceof Season)) {
                        const series = new Series(fullPath, <Season[]>children, this.electronService);
                        media.push(series);
                        this.allSeries.push(series);
                    } else if (children.length > 1) {
                        media.push(new MediaGroup(fullPath, this.electronService, children));
                    } else {
                        media.push(...children);
                    }
                }
            }
        });
        return media;
    }

    /**
     * Returns true if a specified file is a movie.
     * @param file - File to check.
     */
    private isVideo(file: string): boolean {
        for (const extention of this.settingsService.settings.movieExtentions) {
            if (file.toLowerCase().endsWith(`${extention.toLowerCase()}`)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Load movies from the drive.
     */
    public loadMovies() {
        this.allMovies = [];
        this.groupedMovies = [];
        this._loadError = "";

        if (!this.electronService.isElectron()) {
            this._loadError = "This is not an Electron application.";
        } else {
            let movieDir = this.settingsService.settings.movieDirectory;
            movieDir = path.isAbsolute(movieDir) ? movieDir : path.resolve(movieDir);
            if (!this.electronService.fs.existsSync(movieDir)) {
                this._loadError = `Could not find configured movie directory: '${this.settingsService.settings.movieDirectory}'`;
            } else {
                this.groupedMovies = this.loadMoviesInDir(movieDir);
            }
        }
    }

    /**
     * Load series from the drive.
     */
    public loadSeries() {
        this.allSeries = [];
        this.groupedSeries = [];
        this._loadError = "";

        if (!this.electronService.isElectron()) {
            this._loadError = "This is not an Electron application.";
        } else {
            let seriesDir = this.settingsService.settings.seriesDirectory;
            seriesDir = path.isAbsolute(seriesDir) ? seriesDir : path.resolve(seriesDir);
            if (!this.electronService.fs.existsSync(seriesDir)) {
                this._loadError = `Could not find configured series directory: '${this.settingsService.settings.seriesDirectory}'`;
            } else {
                this.groupedSeries = this.loadSeriesInDir(seriesDir);
            }
        }
    }

    /**
     * Get all the loaded groups and movies.
     */
    public getGroupedMovies(): MediaEntity[] {
        if (!this.groupedMovies) {
            this.loadMovies();
        }
        return this.groupedMovies;
    }

    /**
     * Get only the loaded movies. No groups or series.
     * This includes movies that where otherwise in a group.
     */
    public getMovies(): Movie[] {
        if (!this.allMovies) {
            this.loadMovies();
        }
        return this.allMovies;
    }

    /**
     * Get all the loaded groups and series.
     */
    public getGroupedSeries(): MediaEntity[] {
        if (!this.groupedSeries) {
            this.loadSeries();
        }
        return this.groupedSeries;
    }

    /**
     * Get only the loaded series. No groups or movies.
     * This includes series that where otherwise in a group.
     */
    public getSeries(): Series[] {
        if (!this.allSeries) {
            this.loadSeries();
        }
        return this.allSeries;
    }

    /**
     * Clears the loaded data so it will be reloaded the next time you try to access it.
     */
    public clearData(): void {
        this.groupedMovies = null;
        this.allMovies = null;
        this.groupedSeries = null;
        this.allSeries = null;
    }
}

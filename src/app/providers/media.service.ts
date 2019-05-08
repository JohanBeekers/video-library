import { Injectable } from "@angular/core";
import * as path from "path";
import { Observable } from "rxjs";
import { MediaEntity } from "../models/media-entity";
import { MediaGroup } from "../models/media-group";
import { Movie } from "../models/movie";
import { Season } from "../models/season";
import { Series } from "../models/series";
import { ElectronService } from "./electron.service";
import { SettingsService } from "./settings.service";

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

    constructor(private electronService: ElectronService, private settingsService: SettingsService) {}

    /**
     * Loads all movies in a directory asynchronously.
     * @param dir - The directory to load movies from.
     */
    private loadMoviesInDirAsync(dir: string): Promise<MediaEntity[]> {
        return new Promise((resolve, reject) => {
            const media: MediaEntity[] = [];
            this.electronService.fs.readdir(dir, (err, files) => {
                if (err) {
                    return reject(err);
                }
                media.push(...this.handleMovieFiles(dir, files));
                resolve(media);
            });
        });
    }

    /**
     * Loads all movies in a directory.
     * @param dir - The directory to load movies from.
     */
    private loadMoviesInDir(dir: string): MediaEntity[] {
        const media: MediaEntity[] = [];
        const files = this.electronService.fs.readdirSync(dir);
        media.push(...this.handleMovieFiles(dir, files));
        return media;
    }

    /**
     * Converts movie files to media entities and continues recursive search in folders.
     * @param dir - The directory of the files.
     * @param files - The file names.
     */
    private handleMovieFiles(dir: string, files: string[]): MediaEntity[] {
        const media: MediaEntity[] = [];
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
     * Loads all series in a directory asynchronously.
     * @param dir - The directory to load movies from.
     */
    private loadSeriesInDirAsync(dir: string): Promise<MediaEntity[]> {
        return new Promise((resolve, reject) => {
            const media: MediaEntity[] = [];
            this.electronService.fs.readdir(dir, (err, files) => {
                if (err) {
                    return reject(err);
                }
                media.push(...this.handleSerieFiles(dir, files));
                resolve(media);
            });
        });
    }

    /**
     * Loads all series in a directory.
     * @param dir - The directory to load series from.
     */
    private loadSeriesInDir(dir: string): MediaEntity[] {
        const media: MediaEntity[] = [];
        const files = this.electronService.fs.readdirSync(dir);
        media.push(...this.handleSerieFiles(dir, files));
        return media;
    }

    /**
     * Converts serie files to media entities and continues recursive search in folders.
     * @param dir - The directory of the files.
     * @param files - The file names.
     */
    private handleSerieFiles(dir: string, files: string[]): MediaEntity[] {
        const media: MediaEntity[] = [];
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
    public async loadMovies() {
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
                this.groupedMovies = await this.loadMoviesInDirAsync(movieDir);
            }
        }
    }

    /**
     * Load series from the drive.
     */
    public async loadSeries() {
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
                this.groupedSeries = await this.loadSeriesInDirAsync(seriesDir);
            }
        }
    }

    /**
     * Get all the loaded groups and movies.
     */
    public async getGroupedMovies(): Promise<MediaEntity[]> {
        if (!this.groupedMovies) {
            await this.loadMovies();
        }
        return this.groupedMovies;
    }

    /**
     * Get only the loaded movies. No groups or series.
     * This includes movies that where otherwise in a group.
     */
    public async getMovies(): Promise<Movie[]> {
        if (!this.allMovies) {
            await this.loadMovies();
        }
        return this.allMovies;
    }

    /**
     * Get all the loaded groups and series.
     */
    public async getGroupedSeries(): Promise<MediaEntity[]> {
        if (!this.groupedSeries) {
            await this.loadSeries();
        }
        return this.groupedSeries;
    }

    /**
     * Get only the loaded series. No groups or movies.
     * This includes series that where otherwise in a group.
     */
    public async getSeries(): Promise<Series[]> {
        if (!this.allSeries) {
            await this.loadSeries();
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

import { Component } from "@angular/core";
import { MediaEntity } from "../../models/media-entity";
import { MediaService } from "../../providers/media.service";
import { ViewMode } from "../media-list/media-list.component";
import { Movie } from "../../models/movie";
import { Series } from "../../models/series";

export type MediaType = "movies" | "series";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
    public selectedMedia: MediaEntity;
    public scale: number;
    public viewMode: ViewMode;
    public showSettings: boolean = false;
    public loadedMedia: MediaEntity[];
    public displayedMedia: MediaEntity[];

    private _displayedMediaType: MediaType;
    public get displayedMediaType(): MediaType {
        return this._displayedMediaType;
    }
    public set displayedMediaType(value: MediaType) {
        this._displayedMediaType = value;
        this.loadMedia();
    }

    private _showGroups: boolean;
    public get showGroups(): boolean {
        return this._showGroups;
    }
    public set showGroups(value: boolean) {
        this._showGroups = value;
        this.loadMedia();
    }

    private _searchText: string;
    public get searchText(): string {
        return this._searchText;
    }
    public set searchText(value: string) {
        this._searchText = value.toLocaleLowerCase();
        this.filterMedia();
    }

    constructor(public mediaService: MediaService) {}

    public loadMedia() {
        this.loadedMedia = [];
        if (this.displayedMediaType && this.showGroups != null) {
            switch (this.displayedMediaType) {
                case "movies":
                    if (this.showGroups) {
                        this.mediaService.getGroupedMovies().subscribe(results => {
                            this.loadedMedia = results;
                            this.filterMedia();
                        });
                    } else {
                        this.mediaService.getMovies().subscribe(results => {
                            this.loadedMedia = results;
                            this.filterMedia();
                        });
                    }
                    break;
                case "series":
                    if (this.showGroups) {
                        this.mediaService.getGroupedSeries().subscribe(results => {
                            this.loadedMedia = results;
                            this.filterMedia();
                        });
                    } else {
                        this.mediaService.getSeries().subscribe(results => {
                            this.loadedMedia = results;
                            this.filterMedia();
                        });
                    }
                    break;
                default:
                    break;
            }
        }
    }

    public closeSettings() {
        this.showSettings = false;
        this.mediaService.clearData();
        this.loadMedia();
    }

    private filterMedia() {
        if (this.searchText != null && !this.showGroups) {
            this.displayedMedia = this.loadedMedia.filter(value => {
                if (
                    (value.name && value.name.toLocaleLowerCase().includes(this.searchText)) ||
                    (value.saveData.description && value.saveData.description.toLocaleLowerCase().includes(this.searchText))
                ) {
                    return true;
                }
                if (value instanceof Movie || value instanceof Series) {
                    if (
                        (value.saveData.actors && value.saveData.actors.toLocaleLowerCase().includes(this.searchText)) ||
                        (value.saveData.genre && value.saveData.genre.toLocaleLowerCase().includes(this.searchText)) ||
                        (value.saveData.year && value.saveData.year.toLocaleLowerCase().includes(this.searchText))
                    ) {
                        return true;
                    }
                }
            });
        } else {
            this.displayedMedia = this.loadedMedia;
        }
    }
}

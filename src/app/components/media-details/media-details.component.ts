import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { MediaEntity, MediaEntitySaveData } from "../../models/media-entity";
import { MovieSaveData, Movie } from "../../models/movie";
import { MediaGroup } from "../../models/media-group";
import { FieldClickEvent } from "../omdb-suggestions/omdb-suggestions.component";
import { ElectronService } from "../../providers/electron.service";
import * as path from "path";
import { Season } from "../../models/season";
import { Series, SeriesSaveData } from "../../models/series";

@Component({
    selector: "app-media-details",
    templateUrl: "./media-details.component.html",
    styleUrls: ["./media-details.component.scss"]
})
export class MediaDetailsComponent implements OnInit {

    @Output()
    public closeClick: EventEmitter<void> = new EventEmitter();

    @Input()
    public get media(): MediaEntity {
        return this._media;
    }
    public set media(value: MediaEntity) {
        this._media = value;
        this.initForm();
        if (value instanceof Series) {
            this.selectedSeasonIndex = value.seasons.findIndex(season => season !== undefined);
        } else {
            this.selectedSeasonIndex = null;
        }
    }
    private _media: MediaEntity;

    public formData: MovieSaveData;
    public posterPath: string;

    private _editMode: boolean = false;
    public get editMode(): boolean {
        return this._editMode;
    }
    public set editMode(v: boolean) {
        this._editMode = v;
        this.showSuggestions = false;
    }

    public selectedSeasonIndex: number;
    public showSuggestions: boolean = false;

    constructor(private electronService: ElectronService) { }

    ngOnInit() {
    }

    private initForm() {
        this.clearForm();

        this.formData.name = this.media.name;
        this.formData.description = this.media.saveData.description;
        this.posterPath = `file:///${this.media.imagePath}`;

        if (this.media instanceof Movie) {
            this.formData.year = this.media.saveData.year;
            this.formData.runtime = this.media.saveData.runtime;
            this.formData.genre = this.media.saveData.genre;
            this.formData.actors = this.media.saveData.actors;
        } else if (this.media instanceof Series) {
            this.formData.year = this.media.saveData.year;
            this.formData.genre = this.media.saveData.genre;
            this.formData.actors = this.media.saveData.actors;
        }
    }

    private clearForm() {
        this.formData = {
            name: "",
            year: "",
            runtime: "",
            genre: "",
            actors: "",
            description: ""
        };
        this.posterPath = "";
    }

    public closeClicked() {
        if (this.editMode) {
            this.editMode = false;
            this.initForm();
        } else {
            this.closeClick.emit();
        }
    }

    public finishEdit() {
        this.editMode = false;
        if (this.media instanceof Movie) {
            const movieSaveData: MovieSaveData = {
                name: this.formData.name,
                description: this.formData.description,
                year: this.formData.year,
                runtime: this.formData.runtime,
                genre: this.formData.genre,
                actors: this.formData.actors
            };
            this.media.save(movieSaveData);
        } else if (this.media instanceof Series) {
            const seriesSaveData: SeriesSaveData = {
                name: this.formData.name,
                description: this.formData.description,
                year: this.formData.year,
                genre: this.formData.genre,
                actors: this.formData.actors,
                markedSeason: this.media.saveData.markedSeason,
                markedEpisode: this.media.saveData.markedEpisode
            };
            this.media.save(seriesSaveData);
        } else if (this.media instanceof MediaGroup) {
            const groupSaveData: MediaEntitySaveData = {
                name: this.formData.name,
                description: this.formData.description
            };
            this.media.save(groupSaveData);
        } else {
            console.error("Error saving media data. Unknown media type.");
        }

        // Save new poster image.
        if (!this.posterPath.includes(this.media.imagePath)) {
            this.electronService.ipcRenderer.send("saveUrl", {
                targetDir: this.media.path,
                targetFileName: "poster.jpg",
                source: this.posterPath
            });
        }
    }

    public playClicked() {
        if (this.media instanceof Movie) {
            this.electronService.ipcRenderer.send("openFile", path.join(this.media.path, this.media.fileName));
        }
    }

    public playEpisode(index: number) {
        if (this.media instanceof Series && this.selectedSeasonIndex != null) {
            const selectedSeason: Season = this.media.seasons[this.selectedSeasonIndex];
            if (selectedSeason.episodes[index]) {
                this.electronService.ipcRenderer.send("openFile", path.join(selectedSeason.path, selectedSeason.episodes[index]));
            }
        }
    }

    public markEpisode(index: number) {
        if (this.media instanceof Series) {
            if (this.media.saveData.markedSeason === this.selectedSeasonIndex && this.media.saveData.markedEpisode === index) {
                this.media.saveData.markedSeason = null;
                this.media.saveData.markedEpisode = null;
            } else {
                this.media.saveData.markedSeason = this.selectedSeasonIndex;
                this.media.saveData.markedEpisode = index;
            }
            this.media.save();
        }
    }

    public openFolder() {
        this.electronService.ipcRenderer.send("openFile", this.media.path);
    }

    public suggestionClicked(fieldClick: FieldClickEvent) {
        switch (fieldClick.field) {
            case "title":
                this.formData.name = fieldClick.value;
                break;
            case "year":
                this.formData.year = fieldClick.value;
                break;
            case "runtime":
                this.formData.runtime = fieldClick.value;
                break;
            case "genre":
                this.formData.genre = fieldClick.value;
                break;
            case "plot":
                this.formData.description = fieldClick.value;
                break;
            case "actors":
                this.formData.actors = fieldClick.value;
                break;
            case "poster":
                this.posterPath = fieldClick.value;
                break;
        }
    }

    public showMissingPoster() {
        this.posterPath = "../../../assets/poster-missing.png";
    }

}

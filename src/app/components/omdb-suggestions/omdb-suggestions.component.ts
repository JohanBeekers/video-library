import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SettingsService } from "../../providers/settings.service";

interface OmdbSearchResults {
    Response: string;
    Search: OmdbSearchResult[];
    totalResults: string;
    Error: string;
}

interface OmdbSearchResult {
    imdbID: string;
    Title: string;
    Poster: string;
    Year: string;
}

interface OmdbResult {
    imdbID: string;
    Title: string;
    Actors: string;
    Genre: string;
    Plot: string;
    Poster: string;
    Runtime: string;
    Year: string;
}

export interface FieldClickEvent {
    field: FieldName;
    value: string;
}

type FieldName = "poster" | "title" | "year" | "runtime" | "genre" | "plot" | "actors";

@Component({
    selector: "app-omdb-suggestions",
    templateUrl: "./omdb-suggestions.component.html",
    styleUrls: ["./omdb-suggestions.component.scss"]
})
export class OmdbSuggestionsComponent implements OnInit {

    @Output()
    public fieldClick: EventEmitter<FieldClickEvent> = new EventEmitter();

    @Input()
    public name: string = "";

    @Input()
    public type: "movie" | "series" = "movie";

    public results: OmdbSearchResult[] = [];

    private _selectedSearchResult: OmdbSearchResult;
    public get selectedSearchResult(): OmdbSearchResult {
        return this._selectedSearchResult;
    }
    public set selectedSearchResult(value: OmdbSearchResult) {
        this._selectedSearchResult = value;
        this.retrieveRecord();
    }

    public resultDetails: OmdbResult;

    constructor(private http: HttpClient, private settingsService: SettingsService) { }

    ngOnInit() {
        this.searchRecords();
    }

    public searchRecords() {
        if (this.name) {
            this.http.get<OmdbSearchResults>(`http://www.omdbapi.com/?apikey=${this.settingsService.settings.omdbApiKey}`, {
                params: {
                    s: this.name,
                    type: this.type
                }
            }).subscribe(response => {
                if (response.Error) {
                    console.error(`${response.Error} Trying to retrieve single record.`);
                    this.retrieveRecordByName();
                } else {
                    this.results = response.Search ? response.Search : [];
                    this.selectedSearchResult = this.results.length > 0 ? this.results[0] : null;
                }
            }, error => {
                console.error(error);
            });
        }
    }

    public retrieveRecord() {
        if (this.selectedSearchResult && this.selectedSearchResult.imdbID) {
            this.http.get<OmdbResult>(`http://www.omdbapi.com/?apikey=${this.settingsService.settings.omdbApiKey}`, {
                params: {
                    i: this.selectedSearchResult.imdbID,
                    plot: "short"
                }
            }).subscribe(response => {
                this.resultDetails = response;
            }, error => {
                console.error(error);
            });
        }
    }

    private retrieveRecordByName() {
        if (this.name) {
            this.http.get<OmdbResult>(`http://www.omdbapi.com/?apikey=${this.settingsService.settings.omdbApiKey}`, {
                params: {
                    t: this.name,
                    plot: "short"
                }
            }).subscribe(response => {
                this.resultDetails = response;
            }, error => {
                console.error(error);
            });
        }
    }

    public fieldClicked(field: FieldName, value: string) {
        this.fieldClick.emit({ field: field, value: value });
    }

}

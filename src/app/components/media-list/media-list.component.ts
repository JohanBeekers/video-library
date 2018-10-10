import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MediaEntity } from "../../models/media-entity";
import { MediaGroup } from "../../models/media-group";
import { Movie } from "../../models/movie";
import { MediaService } from "../../providers/media.service";
import { Series } from "../../models/series";

export type ViewMode = "list" | "grid";
export interface SortOrder {
    fields: ("name" | "year")[];
    orders: ("asc" | "desc")[];
}

@Component({
    selector: "app-media-list",
    templateUrl: "./media-list.component.html",
    styleUrls: ["./media-list.component.scss"]
})
export class MediaListComponent {
    @Output()
    selectedMediaChange: EventEmitter<MediaEntity> = new EventEmitter();

    @Input()
    public get selectedMedia(): MediaEntity {
        return this._selectedMedia;
    }
    public set selectedMedia(value: MediaEntity) {
        this._selectedMedia = value;
        this.selectedMediaChange.emit(value);
    }
    private _selectedMedia: MediaEntity;

    @Input()
    viewMode: ViewMode = "grid";

    @Input()
    public get media(): MediaEntity[] {
        return this._media;
    }
    public set media(value: MediaEntity[]) {
        this._media = value;
        this.sortMedia();
    }
    private _media: MediaEntity[];

    @Input()
    public get scale(): number {
        return this._scale;
    }
    public set scale(value: number) {
        this._scale = value;
        this.negateScale = 1 / value;
    }
    private _scale: number = 1;

    @Input()
    public get sortOrder(): SortOrder {
        return this._sort;
    }
    public set sortOrder(value: SortOrder) {
        this._sort = value;
    }
    private _sort: SortOrder = {
        fields: ["name", "year"],
        orders: ["asc", "asc"]
    };

    public sortedMedia: MediaEntity[];

    public negateScale: number = 1;

    public openedGroup: MediaGroup;

    /**
     * Click handler for media entities.
     * @param media - The media that has been clicked on.
     */
    public mediaClick(media: MediaEntity, force: boolean): void {
        if (!force && media instanceof MediaGroup) {
            this.openedGroup = this.openedGroup === media ? null : media;
        } else {
            this.selectedMedia = this.selectedMedia === media ? null : media;
        }
    }

    /**
     * Returns true if the {@link MediaEntity} is a {@link Movie}.
     * @param media - The MediaEntity to check.
     */
    public isMovie(media: MediaEntity): boolean {
        return media instanceof Movie;
    }

    /**
     * Returns true if the {@link MediaEntity} is a {@link Series}.
     * @param media - The MediaEntity to check.
     */
    public isSeries(media: MediaEntity): boolean {
        return media instanceof Series;
    }

    /**
     * Returns true if the {@link MediaEntity} is a {@link MediaGroup}.
     * @param media - The {@link MediaEntity} to check.
     */
    public isGroup(media: MediaEntity): boolean {
        return media instanceof MediaGroup;
    }

    /**
     * Sorts the provided media using the provided sorting order.
     */
    private sortMedia() {
        if (!this.media) {
            this.sortedMedia = [];
            return;
        }

        if (this.sortOrder) {
            this.sortedMedia = [...this.media].sort((a, b) => {
                let sortDirection: number;
                for (let i = 0; i < this.sortOrder.fields.length; i++) {
                    const fieldName = this.sortOrder.fields[i];
                    switch (fieldName) {
                        case "name":
                            const nameA = a.name.toLowerCase().startsWith("the ") ? a.name.toLowerCase().slice(4) : a.name.toLowerCase();
                            const nameB = b.name.toLowerCase().startsWith("the ") ? b.name.toLowerCase().slice(4) : b.name.toLowerCase();
                            sortDirection = nameA.localeCompare(nameB);
                            break;
                        case "year":
                            const yearA = parseInt(a.saveData["year"], 10);
                            const yearB = parseInt(b.saveData["year"], 10);
                            if (yearA === yearB || (isNaN(yearA) && isNaN(yearB))) {
                                sortDirection = 0;
                            } else if (isNaN(yearB) || yearA < yearB) {
                                sortDirection = -1;
                            } else if (isNaN(yearA) || yearA > yearB) {
                                sortDirection = 1;
                            }
                            break;
                        default:
                            continue;
                    }

                    if (sortDirection) {
                        return this.sortOrder.orders[i] === "desc" ? -sortDirection : sortDirection;
                    } else {
                        continue;
                    }
                }
                return 0;
            });
        }
    }
}

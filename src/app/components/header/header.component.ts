import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { ViewMode } from "../media-list/media-list.component";
import { ElectronService } from "../../providers/electron.service";
import { MediaType } from "../home/home.component";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {

    private static VIEW_MODE_STORAGE_KEY = "viewMode";
    private static VIEW_MODE_DEFAULT_VALUE: ViewMode = "grid";
    private static SHOW_GROUPS_STORAGE_KEY = "showGroups";
    private static SHOW_GROUPS_DEFAULT_VALUE: boolean = true;
    private static GRID_SCALE_STORAGE_KEY = "gridScale";
    private static GRID_SCALE_DEFAULT_VALUE: number = 1;
    private static LIST_SCALE_STORAGE_KEY = "listScale";
    private static LIST_SCALE_DEFAULT_VALUE: number = 1;
    private static SYNC_SCALE_STORAGE_KEY = "syncScale";
    private static SYNC_SCALE_DEFAULT_VALUE: boolean = false;

    @Output()
    public openSettingsClick: EventEmitter<void> = new EventEmitter();

    @Output()
    public scaleChange: EventEmitter<number> = new EventEmitter();

    @Output()
    public triggerSearch: EventEmitter<string> = new EventEmitter();

    public get scale(): number {
        return this._scale;
    }
    public set scale(value: number) {
        this._scale = value;
        this.storeScaleValue();
        this.scaleChange.emit(value);
    }
    private _scale: number;

    @Output()
    public viewModeChange: EventEmitter<ViewMode> = new EventEmitter();

    public get viewMode(): ViewMode {
        return this._viewMode;
    }
    public set viewMode(value: ViewMode) {
        this._viewMode = value;
        localStorage.setItem(HeaderComponent.VIEW_MODE_STORAGE_KEY, value);
        this.updateScaleValue();
        this.viewModeChange.emit(value);
    }
    private _viewMode: ViewMode;

    public get syncScale(): boolean {
        return this._syncScale;
    }
    public set syncScale(value: boolean) {
        this._syncScale = value;
        localStorage.setItem(HeaderComponent.SYNC_SCALE_STORAGE_KEY, value.toString());
        this.storeScaleValue();
    }
    private _syncScale: boolean;

    @Output()
    public activeTabChange: EventEmitter<MediaType> = new EventEmitter();

    private _activeTab: MediaType;
    public get activeTab(): MediaType {
        return this._activeTab;
    }
    public set activeTab(value: MediaType) {
        this._activeTab = value;
        this.activeTabChange.emit(value);
    }

    @Output()
    public showGroupsChange: EventEmitter<boolean> = new EventEmitter();

    public get showGroups(): boolean {
        return this._showGroups;
    }
    public set showGroups(value: boolean) {
        this._showGroups = value;
        localStorage.setItem(HeaderComponent.SHOW_GROUPS_STORAGE_KEY, value.toString());
        if (value === true) {
            this.searchText = "";
        }
        this.showGroupsChange.emit(value);
    }
    private _showGroups: boolean;

    public searchText: string;

    constructor(private electronService: ElectronService) { }

    ngOnInit(): void {
        const viewMode: ViewMode = <ViewMode>localStorage.getItem(HeaderComponent.VIEW_MODE_STORAGE_KEY);
        const syncScale: string = localStorage.getItem(HeaderComponent.SYNC_SCALE_STORAGE_KEY);
        const showGroups: string = localStorage.getItem(HeaderComponent.SHOW_GROUPS_STORAGE_KEY);

        this.activeTab = "movies";
        this.viewMode = viewMode ? viewMode : HeaderComponent.VIEW_MODE_DEFAULT_VALUE;
        this.syncScale = syncScale ? syncScale === "true" : HeaderComponent.SYNC_SCALE_DEFAULT_VALUE;
        this.showGroups = showGroups ? showGroups === "true" : HeaderComponent.SHOW_GROUPS_DEFAULT_VALUE;
    }

    /**
     * Stores the current value of the scale for the current viewMode in local storage.
     */
    private storeScaleValue() {
        if (this.syncScale) {
            localStorage.setItem(HeaderComponent.GRID_SCALE_STORAGE_KEY, this.scale.toString());
            localStorage.setItem(HeaderComponent.LIST_SCALE_STORAGE_KEY, this.scale.toString());
        } else {
            switch (this.viewMode) {
                case "grid":
                    localStorage.setItem(HeaderComponent.GRID_SCALE_STORAGE_KEY, this.scale.toString());
                    break;
                case "list":
                    localStorage.setItem(HeaderComponent.LIST_SCALE_STORAGE_KEY, this.scale.toString());
                    break;
            }
        }
    }

    /**
     * Updates the scale value to the value stored in local storage.
     * Used after changing between view modes.
     */
    private updateScaleValue() {
        switch (this.viewMode) {
            case "grid":
                const gridScale: string = localStorage.getItem(HeaderComponent.GRID_SCALE_STORAGE_KEY);
                this.scale = gridScale ? parseFloat(gridScale) : HeaderComponent.GRID_SCALE_DEFAULT_VALUE;
                break;
            case "list":
                const listScale: string = localStorage.getItem(HeaderComponent.LIST_SCALE_STORAGE_KEY);
                this.scale = listScale ? parseFloat(listScale) : HeaderComponent.LIST_SCALE_DEFAULT_VALUE;
                break;
        }
    }

    public search() {
        if (this.searchText) {
            this.showGroups = false;
        }
        this.triggerSearch.emit(this.searchText);
    }

    public minimize() {
        if (this.electronService.remote.BrowserWindow.getFocusedWindow()) {
            this.electronService.remote.BrowserWindow.getFocusedWindow().minimize();
        }
    }

    public isMaximized(): boolean {
        if (this.electronService.remote.BrowserWindow.getFocusedWindow()) {
            return this.electronService.remote.BrowserWindow.getFocusedWindow().isMaximized();
        } else {
            return false;
        }
    }

    public maximize() {
        if (this.electronService.remote.BrowserWindow.getFocusedWindow()) {
            if (this.isMaximized()) {
                this.electronService.remote.BrowserWindow.getFocusedWindow().unmaximize();
            } else {
                this.electronService.remote.BrowserWindow.getFocusedWindow().maximize();
            }
        }
    }

    public close() {
        if (this.electronService.remote.BrowserWindow.getFocusedWindow()) {
            this.electronService.remote.BrowserWindow.getFocusedWindow().close();
        }
    }

    public reload() {
        if (this.electronService.remote.BrowserWindow.getFocusedWindow()) {
            this.electronService.remote.BrowserWindow.getFocusedWindow().reload();
        }
    }

    public openDevTools() {
        if (this.electronService.remote.BrowserWindow.getFocusedWindow()) {
            this.electronService.remote.BrowserWindow.getFocusedWindow().webContents.openDevTools();
        }
    }

}

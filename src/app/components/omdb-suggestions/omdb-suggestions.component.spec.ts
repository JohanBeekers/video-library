import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { OmdbSuggestionsComponent } from "./omdb-suggestions.component";

describe("OmdbSuggestionsComponent", () => {
    let component: OmdbSuggestionsComponent;
    let fixture: ComponentFixture<OmdbSuggestionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OmdbSuggestionsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OmdbSuggestionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});

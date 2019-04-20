import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CalcNeededComponent} from './calc-needed.component';

describe('CalcNeededComponent', () => {
    let component: CalcNeededComponent;
    let fixture: ComponentFixture<CalcNeededComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CalcNeededComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CalcNeededComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

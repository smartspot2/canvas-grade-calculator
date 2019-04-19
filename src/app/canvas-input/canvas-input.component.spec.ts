import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CanvasInputComponent} from './canvas-input.component';

describe('CanvasInputComponent', () => {
    let component: CanvasInputComponent;
    let fixture: ComponentFixture<CanvasInputComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CanvasInputComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CanvasInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

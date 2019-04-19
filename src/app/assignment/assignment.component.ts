import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Assignment} from '../classes/assignmentClass';

@Component({
    selector: 'app-assignment',
    templateUrl: './assignment.component.html',
    styleUrls: ['./assignment.component.css']
})
export class AssignmentComponent implements AfterViewInit {
    @Input() assignment: Assignment;
    @Output() edited = new EventEmitter<Assignment>();
    @ViewChild('gottenPointsInput') gottenInputElement: ElementRef;
    @ViewChild('possiblePointsInput') possibleInputElement: ElementRef;

    ngAfterViewInit(): void {
        this.gottenInputElement.nativeElement.value = String(this.assignment.score[0]);
        this.possibleInputElement.nativeElement.value = String(this.assignment.score[1]);
    }

    public updateGottenPoints(valStr: string) {
        let valueNum = Number.parseFloat(valStr);
        console.log({valueNum});
        this.assignment.score[0] = Number.isNaN(valueNum) ? null : valueNum;
        this.edited.emit(this.assignment);
    }

    public updatePossiblePoints(valStr: string) {
        let valueNum = Number.parseFloat(valStr);
        this.assignment.score[1] = Number.isNaN(valueNum) ? null : valueNum;
        this.edited.emit(this.assignment);
    }

}

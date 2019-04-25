import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild,} from '@angular/core';
import {Category} from '../classes/categoryClass';
import {Assignment} from "../classes/assignmentClass";

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements AfterViewInit {
    @Input() category: Category;
    @Output('edited') edited = new EventEmitter();

    @ViewChild('categoryHeader', {read: ElementRef}) catHeader: ElementRef;

    public overflowState: string;

    ngAfterViewInit(): void {
        this.catHeader.nativeElement.getElementsByClassName('mat-content')[0].style.overflow = 'visible';
    }

    public addAssignment() {
        let newAsgnmt = new Assignment('New Assignment');
        newAsgnmt.editableName = true;
        this.category.addAssignment(newAsgnmt);
        this.category.updateGrades();
    }

    public removeAssignment(asgnmt: Assignment) {
        this.category.removeAssignment(asgnmt);
        this.category.updateGrades();
    }

    updateGrades() {
        this.category.updateGrades();
        this.edited.emit();
    }
}

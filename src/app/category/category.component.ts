import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild,} from '@angular/core';
import {Category} from '../classes/categoryClass';
import {Assignment} from "../classes/assignmentClass";
import {MatSnackBar} from "@angular/material";

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
    private lastRemoved;

    constructor(private snackbar: MatSnackBar) {
    }

    ngAfterViewInit(): void {
        this.catHeader.nativeElement.getElementsByClassName('mat-content')[0].style.overflow = 'visible';
    }

    public addAssignment(asgnmt?, index?) {
        let newAsgnmt: Assignment;
        if (asgnmt == undefined) {
            newAsgnmt = new Assignment('New Assignment');
            newAsgnmt.editableName = true;
        } else {
            newAsgnmt = asgnmt;
        }
        this.category.addAssignment(newAsgnmt, index);
        this.category.updateGrades();
    }

    public removeAssignment(asgnmt: Assignment) {
        this.lastRemoved = this.category.removeAssignment(asgnmt);
        this.openSnackBar(`Assignment removed: "${this.lastRemoved.assignment.name}"`, 'Undo', () => {
            this.addAssignment(this.lastRemoved.assignment, this.lastRemoved.index);
        });
        this.category.updateGrades();
    }

    updateGrades() {
        this.category.updateGrades();
        this.edited.emit();
    }

    openSnackBar(msg: string, action: string, callback) {
        let snackbarRef = this.snackbar.open(msg, action, {
            duration: 5000
        });

        snackbarRef.onAction().subscribe(callback);
    }
}

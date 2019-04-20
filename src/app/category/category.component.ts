import {AfterViewChecked, Component, EventEmitter, Input, Output,} from '@angular/core';
import {Category} from '../classes/categoryClass';
import {Assignment} from "../classes/assignmentClass";

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.css']
})
export class CategoryComponent implements AfterViewChecked {
    @Input() category: Category;
    @Output('edited') edited = new EventEmitter();

    ngAfterViewChecked(): void {
        this.updateMaxHeight();
    }

    public collapse(catID: string) {
        let catHeaderDiv = document.getElementById('hed' + catID);
        let btn = catHeaderDiv.children[0];

        let catContentDiv = document.getElementById('ctt' + catID);
        if (catContentDiv.className === "categoryContent") {
            if (catContentDiv.style.maxHeight) {
                catContentDiv.style.maxHeight = null;
                btn.innerHTML = "&#9658";
            } else {
                catContentDiv.style.maxHeight = catContentDiv.scrollHeight + "px";
                btn.innerHTML = "&#9660";
            }
        }
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

    private updateMaxHeight() {
        let catContentDiv = document.getElementById('ctt' + this.category.id);
        if (catContentDiv != null && catContentDiv.style.maxHeight) {
            catContentDiv.style.maxHeight = catContentDiv.scrollHeight + "px";
        }
    }

    updateGrades() {
        this.category.updateGrades();
        this.edited.emit();
    }
}

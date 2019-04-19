import {Component, OnInit} from '@angular/core';
import {Category} from './classes/categoryClass';
import {Assignment} from "./classes/assignmentClass";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    categories: Category[];

    ngOnInit(): void {
        this.categories = [];
        let newCat = new Category('Assignments', 0.2);
        newCat.addAssignment(new Assignment('Assignment 1', [5, 5]));
        newCat.addAssignment(new Assignment('Assignment 2', [4.5, 5]));
        this.categories.push(newCat);

        newCat = new Category('Tests', 0.8);
        newCat.addAssignment(new Assignment('Test 1', [99, 100]));
        newCat.addAssignment(new Assignment('Test 2', [100, 100]));
        this.categories.push(newCat);

        console.log(this.categories);
    }

    swapSteps() {

    }
}

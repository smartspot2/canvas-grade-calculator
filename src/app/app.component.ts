import {AfterContentInit, Component, OnInit, ViewChild} from '@angular/core';
import {Category} from './classes/categoryClass';
import {MatExpansionPanel} from "@angular/material";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterContentInit {
    public categories: Category[] = [];
    public grade: string;
    public curStep: number = 1;
    public step1Overflow: string = 'hidden';
    public step2Overflow: string = 'hidden';

    @ViewChild('step1Div') step1Div: MatExpansionPanel;
    @ViewChild('step2Div') step2Div: MatExpansionPanel;

    ngOnInit(): void {
        this.curStep = 1;
        this.calculateGrades();
    }

    ngAfterContentInit(): void {
    }

    public setCategories(categories) {
        this.categories = categories;

        // Calculate grades
        this.categories.forEach(cat => {
            cat.updateGrades();
        });

        this.calculateGrades();
    }

    goToStep(n: number) {
        this.curStep = n;
    }

    public calculateGrades() {
        let gradeVal = 0;
        let totalWeights = 0;
        this.categories.forEach(cat => {
            if (!Number.isNaN(cat.grade)) {
                gradeVal += cat.weight * (cat.grade);
                totalWeights += cat.weight;
            }
        });
        gradeVal /= totalWeights;

        this.grade = String(Number.parseFloat((gradeVal * 100).toFixed(2)));
    }
}

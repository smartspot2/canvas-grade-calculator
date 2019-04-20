import {AfterContentInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Category} from './classes/categoryClass';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterContentInit {
    public categories: Category[];
    public grade: string;

    @ViewChild('step1Div') step1Div: ElementRef;
    @ViewChild('step2Div') step2Div: ElementRef;

    ngOnInit(): void {
        this.categories = [];
        this.calculateGrades();
    }

    ngAfterContentInit(): void {
        this.step2Div.nativeElement.style.display = 'none';
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
        switch (n) {
            case 1:
                // Reset categories and go to beginning
                this.categories = [];
                this.step1Div.nativeElement.style.display = 'initial';
                this.step2Div.nativeElement.style.display = 'none';
                break;
            case 2:
                this.step1Div.nativeElement.style.display = 'none';
                this.step2Div.nativeElement.style.display = 'initial';
                break;
        }
    }

    private calculateGrades() {
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

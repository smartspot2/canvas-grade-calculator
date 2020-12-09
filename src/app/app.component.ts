import {AfterContentInit, Component, OnInit, ViewChild} from '@angular/core';
import {Category} from './classes/categoryClass';
import {MatDialog} from "@angular/material/dialog";
import {MatExpansionPanel} from "@angular/material/expansion";
import {MatSnackBar} from "@angular/material/snack-bar";
import {GradeTrendDialog} from "./dialog/gradetrenddialog.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterContentInit {
    public categories: Category[] = [];
    public grade: string;
    public curStep: number = 1;
    public step1Overflow: string = 'hidden';
    public step2Overflow: string = 'hidden';
    public totalWeightPercentageStr: string;
    public gradeInfoIconColor;

    private lastRemoved;

    @ViewChild('step1Div') step1Div: MatExpansionPanel;
    @ViewChild('step2Div') step2Div: MatExpansionPanel;

    constructor(private dialog: MatDialog, private snackbar: MatSnackBar) {
    }

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
        let allWeightsTotal = 0;
        this.categories.forEach(cat => {
            if (!Number.isNaN(cat.grade)) {
                gradeVal += cat.weight * (cat.grade);
                totalWeights += cat.weight;
            }
            allWeightsTotal += cat.weight;
        });
        if (totalWeights == 0) {
            gradeVal = 0;
            let totalPoints = 0;
            let totalReceived = 0;
            this.categories.forEach(cat => {
                totalPoints += cat.totalPoints;
                totalReceived += cat.receivedPoints;
            });
            gradeVal = totalReceived / totalPoints;
        } else {
            gradeVal /= totalWeights;
        }

        this.totalWeightPercentageStr = String(Number.parseFloat((allWeightsTotal * 100).toFixed(2)));

        this.grade = String(Number.parseFloat((gradeVal * 100).toFixed(2)));
    }

    public addCategory(cat?: Category, index?: number) {
        if (cat == undefined) {
            this.categories.push(new Category("New Category", 0));
        } else {
            this.categories.splice(index, 0, cat);
        }
        this.calculateGrades();
    }

    public removeCategory(cat: Category) {
        let removeIndex = this.categories.findIndex(c => c.id == cat.id);
        this.lastRemoved = {
            assignment: this.categories.splice(removeIndex, 1)[0],
            index: removeIndex
        };
        this.openSnackBar(`Category removed: ${this.lastRemoved.assignment.name}`, "Undo", () => {
            this.addCategory(this.lastRemoved.assignment, this.lastRemoved.index);
        });
        this.calculateGrades();
    }

    public showGradeTrend(event: Event) {
        event.stopPropagation();
        this.dialog.open(GradeTrendDialog,
            {
                width: "80%", height: "80%", data: {
                    categories: this.categories
                }
            });
    }

    openSnackBar(msg: string, action: string, callback) {
        let snackbarRef = this.snackbar.open(msg, action, {
            duration: 5000
        });

        snackbarRef.onAction().subscribe(callback);
    }
}

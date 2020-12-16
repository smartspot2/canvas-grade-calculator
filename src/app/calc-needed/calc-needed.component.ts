import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Category} from "../classes/categoryClass";
import {MatDialog} from "@angular/material/dialog";
import {AlertDialog} from "../classes/AlertDialog";

@Component({
    selector: 'app-calc-needed',
    templateUrl: './calc-needed.component.html',
    styleUrls: ['./calc-needed.component.scss']
})
export class CalcNeededComponent implements AfterViewInit {
    @Input() categories: Category[];
    @ViewChild('resultPoints') resultPointsOutput: ElementRef;
    @ViewChild('resultPercent') resultPercentOutput: ElementRef;

    public asgnmtCategory: string;
    public targetPercentageStr: string;
    public totalPointsStr: string;

    constructor(public dialog: MatDialog) {
    }

    ngAfterViewInit() {
    }

    public parseNeededPercentageInput() {
        if (this.totalPointsStr === "" || this.asgnmtCategory === "" || this.targetPercentageStr === "") {
            // Invalid input, alert
            this.openDialog("Invalid or empty calculation input. Please try again.");
            return;
        }

        let totalPoints = Number.parseFloat(this.totalPointsStr);
        let targetPercentage = Number.parseFloat(this.targetPercentageStr);

        let pointsNeeded = this.calculateNeededPoints(totalPoints, targetPercentage, this.asgnmtCategory);

        if (pointsNeeded == null) return;

        // Create HTML span element to display needed points, rounded to 4 places

        let pointsText = this.resultPointsOutput.nativeElement;
        pointsText.innerText = (Math.round(pointsNeeded * 10000) / 10000).toString();
        let pointsPercentText = this.resultPercentOutput.nativeElement;
        pointsPercentText.innerText = (Math.round(10000 * pointsNeeded / totalPoints) / 100).toString();
    }

    private calculateNeededPoints(totalPoints: number, targetPercentage: number, targetCategory: string): number {
        // TODO: add validation for input fields
        let totalCatWeights = this.categories.reduce((s, cat) => s + cat.weight, 0);
        if (totalCatWeights == 0) {
            // just add points up
            let catTotalReceived = 0;
            let catTotalPoints = 0;
            this.categories.forEach(cat => {
                catTotalReceived += cat.receivedPoints;
                catTotalPoints += cat.totalPoints;
            });
            // targetPercentage / 100 = (catTotalReceived + x) / (catTotalPoints + totalPoints)
            return (targetPercentage / 100) * (catTotalPoints + totalPoints) - catTotalReceived;
        } else {
            let targetCatGottenSum: number = null;
            let targetCatTotalSum: number = null;
            let targetCatWeight: number = null;
            let curGrade = 0;

            this.categories.forEach(cat => {
                if (cat.id === targetCategory) {
                    targetCatGottenSum = cat.receivedPoints;
                    targetCatTotalSum = cat.totalPoints;
                    targetCatWeight = cat.weight;
                    return;
                }

                if (cat.totalPoints === 0) {
                    totalCatWeights -= cat.weight;
                } else {
                    curGrade += cat.weight * cat.receivedPoints / cat.totalPoints;
                }
            });

            if (targetCatTotalSum == null || targetCatGottenSum == null || targetCatWeight == null) {
                this.openDialog("Invalid category. Please try again.");
                return null;
            } else if (targetCatWeight == 0) {
                this.openDialog("Selected category has no weight; " +
                    "adjust weights or categories and try again.");
                return null;
            }

            // Derived from
            // (curGrade + targetCatWeight * (targetCatGottenSum + x) / (targetCatTotalSum + totalPoints)) / totalCatWeights = targetPercentage/100;

            return (targetCatTotalSum + totalPoints) * (targetPercentage / 100 * totalCatWeights - curGrade) / targetCatWeight - targetCatGottenSum;
        }
    }

    private openDialog(displayText: string) {
        this.dialog.open(AlertDialog,
            {width: '500px', data: {text: displayText}})
    }
}

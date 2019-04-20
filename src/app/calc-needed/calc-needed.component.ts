import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Category} from "../classes/categoryClass";

@Component({
    selector: 'app-calc-needed',
    templateUrl: './calc-needed.component.html',
    styleUrls: ['./calc-needed.component.css']
})
export class CalcNeededComponent implements AfterViewInit {
    @Input() categories: Category[];
    @ViewChild('totalPointsElem') totalPointsInput: ElementRef;
    @ViewChild('targetPercentElem') targetPointsInput: ElementRef;
    @ViewChild('categorySelectionElem') categoryNameInput: ElementRef;
    @ViewChild('resultPoints') resultPointsOutput: ElementRef;
    @ViewChild('resultPercent') resultPercentOutput: ElementRef;

    ngAfterViewInit() {
    }

    public parseNeededPercentageInput() {
        let totalPointsInput = <HTMLInputElement>document.getElementById("calcNeeded-totalPoints");
        let asgnmtCategoryInput = <HTMLInputElement>document.getElementById("calcNeeded-category");
        let targetPercentageInput = <HTMLInputElement>document.getElementById("calcNeeded-targetPercent");

        if (totalPointsInput.value === "" || asgnmtCategoryInput.value === "" || targetPercentageInput.value === "") {
            // Invalid input, alert
            alert("Invalid or empty calculation input. Please try again.");
            return;
        }
        let totalPoints = Number.parseFloat(totalPointsInput.value);
        let targetPercentage = Number.parseFloat(targetPercentageInput.value);
        let asgnmtCategory: string = asgnmtCategoryInput.value;
        let pointsNeeded = this.calculateNeededPercentage(totalPoints, targetPercentage, asgnmtCategory);

        if (pointsNeeded == null) return;

        // Create HTML span element to display needed points, rounded to 4 places

        let pointsText = this.resultPointsOutput.nativeElement;
        pointsText.innerText = (Math.round(pointsNeeded * 10000) / 10000).toString();
        let pointsPercentText = this.resultPercentOutput.nativeElement;
        pointsPercentText.innerText = (Math.round(10000 * pointsNeeded / totalPoints) / 100).toString();
    }

    private calculateNeededPercentage(totalPoints: number, targetPercentage: number, targetCategory: string): number {
        let targetCatGottenSum: number = null;
        let targetCatTotalSum: number = null;
        let targetCatWeight: number = null;
        let totalCatWeights = 0;
        let curGrade = 0;

        this.categories.forEach(cat => {
            if (cat.name === targetCategory) {
                targetCatGottenSum = cat.receivedPoints;
                targetCatTotalSum = cat.totalPoints;
                targetCatWeight = cat.weight;
                totalCatWeights += cat.weight;
                return;
            }

            if (cat.totalPoints === 0) return;

            totalCatWeights += cat.weight;
            curGrade += cat.weight * cat.receivedPoints / cat.totalPoints;
        });

        if (targetCatTotalSum == null || targetCatGottenSum == null || targetCatWeight == null) {
            alert("Invalid category. Please try again.");
            return null;
        }

        // Derived from
        // (curGrade + targetCatWeight * (targetCatGottenSum + x) / (targetCatTotalSum + totalPoints)) / totalCatWeights = targetPercentage/100;

        return (targetCatTotalSum + totalPoints) * (targetPercentage / 100 * totalCatWeights - curGrade) / targetCatWeight - targetCatGottenSum;
    }

}

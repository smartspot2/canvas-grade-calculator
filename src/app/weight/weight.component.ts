import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Category} from "../classes/categoryClass";

@Component({
    selector: 'app-weight',
    templateUrl: './weight.component.html',
    styleUrls: ['./weight.component.css']
})
export class WeightComponent implements AfterViewInit {
    @Input() category: Category;
    @Output('weightsChanged') weightsChanged = new EventEmitter();
    @ViewChild('weightInput') weightElement: ElementRef;

    ngAfterViewInit(): void {
        this.weightElement.nativeElement.value = String(
            Number.parseFloat((this.category.weight * 100).toFixed(2))
        );
    }

    public updateWeights() {
        let weightVal = Number.parseFloat(this.weightElement.nativeElement.value);
        if (!Number.isNaN(weightVal)) {
            this.category.weight = weightVal / 100;
        }
        this.weightsChanged.emit();
    }


}

import {AfterViewInit, Component, Input} from '@angular/core';
import {Category} from '../classes/categoryClass';

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.css']
})
export class CategoryComponent implements AfterViewInit {
    @Input() category: Category;

    ngAfterViewInit(): void {
        // debugger;
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

}

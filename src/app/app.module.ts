import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {CategoryComponent} from './category/category.component';
import {AssignmentComponent} from './assignment/assignment.component';
import {CanvasInputComponent} from "./canvas-input/canvas-input.component";


@NgModule({
    declarations: [
        AppComponent,
        CategoryComponent,
        AssignmentComponent,
        CanvasInputComponent
    ],
    imports: [
        BrowserModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}

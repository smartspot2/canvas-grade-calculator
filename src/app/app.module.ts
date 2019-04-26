import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {CategoryComponent} from './category/category.component';
import {AssignmentComponent} from './assignment/assignment.component';
import {CanvasInputComponent} from "./canvas-input/canvas-input.component";
import {WeightComponent} from './weight/weight.component';
import {CalcNeededComponent} from './calc-needed/calc-needed.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule
} from "@angular/material";
import {FormsModule} from "@angular/forms";
import {AlertDialog} from "./classes/AlertDialog";

@NgModule({
    declarations: [
        AppComponent,
        CategoryComponent,
        AssignmentComponent,
        CanvasInputComponent,
        WeightComponent,
        CalcNeededComponent,
        AlertDialog
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        FormsModule,
        MatDialogModule,
        MatExpansionModule,
        MatTooltipModule,
        MatSnackBarModule
    ],
    providers: [],
    entryComponents: [AlertDialog,],
    bootstrap: [AppComponent]
})
export class AppModule {
}


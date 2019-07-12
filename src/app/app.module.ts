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
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule
} from "@angular/material";
import {FormsModule} from "@angular/forms";
import {AlertDialog} from "./classes/AlertDialog";
import {StatisticsDialog} from "./dialog/category.statisticsdialog.component";
import {GradeTrendDialog} from "./dialog/gradetrenddialog.component";

@NgModule({
    declarations: [
        AppComponent,
        CategoryComponent,
        AssignmentComponent,
        CanvasInputComponent,
        WeightComponent,
        CalcNeededComponent,
        AlertDialog,
        StatisticsDialog,
        GradeTrendDialog
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
        MatSnackBarModule,
        MatIconModule,
        MatSlideToggleModule
    ],
    providers: [],
    entryComponents: [AlertDialog, StatisticsDialog, GradeTrendDialog],
    bootstrap: [AppComponent]
})
export class AppModule {
}


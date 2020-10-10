import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {CategoryComponent} from './category/category.component';
import {AssignmentComponent} from './assignment/assignment.component';
import {CanvasInputComponent} from "./canvas-input/canvas-input.component";
import {WeightComponent} from './weight/weight.component';
import {CalcNeededComponent} from './calc-needed/calc-needed.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatButtonModule} from "@angular/material/button";
import {MatDialogModule} from "@angular/material/dialog";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatTooltipModule} from "@angular/material/tooltip";
import {FormsModule} from "@angular/forms";
import {AlertDialog} from "./classes/AlertDialog";
import {StatisticsDialog} from "./dialog/category.statisticsdialog.component";
import {GradeTrendDialog} from "./dialog/gradetrenddialog.component";
import {PersistenceModule} from "angular-persistence";

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
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatExpansionModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatIconModule,
        MatSlideToggleModule,
        PersistenceModule
    ],
    providers: [],
    entryComponents: [AlertDialog, StatisticsDialog, GradeTrendDialog],
    bootstrap: [AppComponent]
})
export class AppModule {
}


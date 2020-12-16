import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {Assignment} from "../classes/assignmentClass";
import {Category} from "../classes/categoryClass";
import {AssignmentParser} from "../parser/assignment-parser";
import {GradeParser} from "../parser/grade-parser";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AlertDialog} from "../classes/AlertDialog";
import {PersistenceService, StorageType} from "angular-persistence";

@Component({
    selector: 'app-assignment-input',
    templateUrl: './canvas-input.component.html',
    styleUrls: ['./canvas-input.component.scss']
})
export class CanvasInputComponent {
    @Output('parsed') public parsed = new EventEmitter<Category[]>();
    @ViewChild('copyPasteFieldAssignments') assignmentsTextArea: ElementRef;
    @ViewChild('copyPasteFieldGrades') gradesTextArea: ElementRef;

    public categories: Category[];
    public assignments: Assignment[];
    private persistedRaw: { assignments: string, grades: string };

    constructor(public dialog: MatDialog, public snackbar: MatSnackBar,
                private persistService: PersistenceService) {
    }

    public ngAfterViewInit() {
        // Get data stored in memory (if at all)
        this.persistedRaw = this.persistService.get('raw', StorageType.LOCAL);

        if (this.persistedRaw) {
            console.log('Updating text areas...')
            this.assignmentsTextArea.nativeElement.value = this.persistedRaw.assignments;
            this.gradesTextArea.nativeElement.value = this.persistedRaw.grades;
        }
    }

    public parseText() {
        this.categories = [];
        this.assignments = [];

        let parseSuccessful = this.parseAssignmentsText();
        if (parseSuccessful) {
            parseSuccessful = this.parseGradesText();
            if (!parseSuccessful) {
                console.log("didn't finish grades");
            }
        }

        if (parseSuccessful) {
            // Check if data is different from persisted data
            let assignmentsText = this.assignmentsTextArea.nativeElement.value;
            let gradesText = this.gradesTextArea.nativeElement.value;
            if (this.persistedRaw == undefined || this.persistedRaw.assignments != assignmentsText
                || this.persistedRaw.grades != gradesText) {
                // Persist data
                let persistSuccessful = this.persistService.set('raw',
                    {assignments: assignmentsText, grades: gradesText},
                    {
                        type: StorageType.LOCAL,
                        timeout: 86400000   // One day
                    }
                );
                if (!persistSuccessful) {
                    console.error('Persist unsuccessful!');
                }
            }

            this.parsed.emit(this.categories);
        }

    }

    private parseAssignmentsText(): boolean {
        let assignmentsText: string = this.assignmentsTextArea.nativeElement.value;

        // Split every line
        let textSplitAssignments: string[] = assignmentsText.split('\n').map(s => s.trim());

        // Check for miscopied text; alert and don't proceed if incorrect copy-paste

        if (textSplitAssignments.includes("Name	Due	Status	Score	Out of	Details	Submission Progress Status")) {
            this.openDialog("Assignments: You have copied the wrong page; please copy-paste the 'Assignments' page in Canvas.");
            return false;
        } else if (textSplitAssignments.includes("Undated Assignments") || textSplitAssignments.includes("Past Assignments")) {
            this.openDialog("Assignments: You have copied the assignments sorted by date. Please click on 'SHOW BY TYPE' in the top-right corner of the assignments page and try again.");
            return false;
        } else if (textSplitAssignments.length === 1 && textSplitAssignments[0] === '') {
            this.openDialog("Assignments: Please paste something in the text area.");
            return false;
        }

        // Remove everything before assignments
        if (textSplitAssignments.some(l => {
            return l.includes("SHOW BY TYPE")
        })) {
            textSplitAssignments.splice(0, 1 + textSplitAssignments.findIndex(l => {
                return l.includes("SHOW BY TYPE")
            }));
        } else if (textSplitAssignments.includes("Show By")) {
            textSplitAssignments.splice(0, 1 + textSplitAssignments.indexOf("Show By"));
        } else {
            this.openDialog("Assignments: Invalid text pasted. Please try again and make sure you are copy-pasting everything on the 'Assignments' page in Canvas.");
            return false;
        }

        // Create assignments

        // TODO: add ability to paste in modules page in case assignments page is not enabled

        let parser = new AssignmentParser(textSplitAssignments);
        parser.parse();
        this.categories = parser.categories;
        this.assignments = parser.assignments;

        return true;
    }

    private parseGradesText(): boolean {
        let gradesText: string = this.gradesTextArea.nativeElement.value;

        // Split every line
        let textSplitGrades: string[] = gradesText.split('\n').map(s => s.trim());

        // Check for miscopied text; alert and don't proceed if incorrect copy-paste

        if (textSplitGrades.length === 1 && textSplitGrades[0] === '') {
            this.openSnackBar("Skipped parsing grades.");
            return true;
        } else if (!textSplitGrades.includes("Name\tDue\tStatus\tScore\tOut of\tDetails\tSubmission Progress Status")) {
            this.openSnackBar("Skipped parsing grades: Invalid text or wrong page pasted; please copy-paste the 'Grades' page in Canvas.");
            return true;
        } else if (!textSplitGrades.includes("assignment details expanded")) {
            // this.openSnackBar("Skipped parsing grades: Please make sure that all details are expanded; click the 'Show All Details' button under the total grade.");
            // return true;
        }

        // Remove everything before grades
        if (textSplitGrades.includes("Name\tDue\tStatus\tScore\tOut of\tDetails\tSubmission Progress Status")) {
            textSplitGrades.splice(0, 1 + textSplitGrades.indexOf("Name\tDue\tStatus\tScore\tOut of\tDetails\tSubmission Progress Status"));
        } else {
            this.openDialog("Skipped parsing grades: Invalid text pasted. Please try again and make sure you are copy-pasting everything on the 'Grades' page in Canvas.");
            return false;
        }

        // Update assignments

        let parser = new GradeParser(textSplitGrades, this.assignments);
        parser.parse();

        if (!parser.hasStatistics) {
            this.openSnackBar("No grade statistics found for any assignment.")
        }

        // Successful parse
        return true;

    }

    private openDialog(displayText: string) {
        this.dialog.open(AlertDialog,
            {width: '500px', data: {text: displayText}})
    }

    private openSnackBar(msg: string) {
        this.snackbar.open(msg, null, {
            duration: 5000
        });
    }
}


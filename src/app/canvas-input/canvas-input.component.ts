import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {Assignment} from "../classes/assignmentClass";
import {Category} from "../classes/categoryClass";
import {MatDialog} from "@angular/material";
import {AlertDialog} from "../classes/AlertDialog";

@Component({
    selector: 'app-assignment-input',
    templateUrl: './canvas-input.component.html',
    styleUrls: ['./canvas-input.component.css']
})
export class CanvasInputComponent {
    @Output('parsed') parsed = new EventEmitter<Category[]>();
    @ViewChild('copypastefield') textArea: ElementRef;

    public categories: Category[];
    public assignments: Assignment[];

    constructor(public dialog: MatDialog) {
    }

    public parseText() {
        this.categories = [];
        this.assignments = [];

        let text: string = this.textArea.nativeElement.value;

        // Split every line
        let textSplit: string[] = text.split('\n');
        textSplit = textSplit.map(s => s.trim());

        // Check for miscopied text; alert and don't proceed if incorrect copy-paste

        if (textSplit.includes("Name	Due	Status	Score	Out of	Details	Submission Progress Status")) {
            this.openDialog("You have copied the wrong page; please copy-paste the 'Assignments' page in Canvas.");
            return;
        } else if (textSplit.includes("Undated Assignments") || textSplit.includes("Past Assignments")) {
            this.openDialog("You have copied the assignments sorted by date. Please click on 'SHOW BY TYPE' in the top-right corner of the assignments page and try again.");
            return;
        } else if (textSplit.length === 1 && textSplit[0] === '') {
            this.openDialog("Please paste something in the text area.");
            return;
        }

        // Remove everything before assignments
        if (textSplit.some(l => {
            return l.includes("SHOW BY TYPE")
        })) {
            textSplit.splice(0, 1 + textSplit.findIndex(l => {
                return l.includes("SHOW BY TYPE")
            }));
        } else if (textSplit.includes("Show By")) {
            textSplit.splice(0, 3 + textSplit.indexOf("Show By"));
        } else {
            this.openDialog("Invalid text pasted. Please try again and make sure you are copy-pasting everything on the 'Assignments' page in Canvas.");
            return;
        }

        // Create assignments

        let lastAssignment: string = null;
        let lastCategory: Category = null;
        textSplit.forEach(line => {
            if (lastCategory == null || line.includes("% of Total")) {
                // Should only occur at the beginning of the loop
                let category = this.parseCategory(line);
                let catObj = new Category(category.name, category.weight);
                this.categories.push(catObj);
                lastCategory = catObj;
            } else if (line.includes('Due') && line.split(' ').length == 9 &&
                line.split(' ')[3] == 'at' && line.split(' ')[7] == 'at') {  // Due Date
                // Should always be in the form "Due [mo] [day] at [time] [mo] [day] at [time]
                let curAsgnmt = this.assignments.find(a => {
                    return a.id == lastAssignment
                });
                if (line.includes('pts')) { // Due date and points on same line
                    let lineSplit = line.split(" ");
                    let ptsIndex = lineSplit.indexOf("pts");

                    let dueStr = lineSplit.slice(0, ptsIndex - 1).join(' ');
                    let scoreStr = lineSplit.slice(ptsIndex - 1).join(' ');

                    curAsgnmt.score = this.parseScore(scoreStr);
                    line = dueStr;
                }
                curAsgnmt.due = line;
            } else if (line.includes('pts')) {  // Score
                // TODO: see if there's a way to add a tag on items that aren't counted toward the final grade.
                this.assignments.find(a => {
                    return a.id == lastAssignment
                }).score = this.parseScore(line);
            } else if (this.isAssignmentTag(line)) { // Tag
                this.assignments.find(a => {
                    return a.id == lastAssignment
                }).tag = line;
            } else if (line.includes("This assignment will not be assigned a grade.")) {
                this.assignments.find(a => a.id == lastAssignment).noGrade = true;
            } else {                            // Assignment Name
                let curAssignment = new Assignment(line);
                this.assignments.push(curAssignment);
                curAssignment.category = lastCategory.name;
                lastCategory.addAssignment(curAssignment);
                lastAssignment = curAssignment.id;
            }
        });

        this.parsed.emit(this.categories);

        // Display assignments as HTML elements
        // this.makeHTMLAssignments();
        // this.makeHTMLWeights();

        // Calculate grade
        // this.calculateGrade();

        // Uncollapse step 2 and collapse step 1
        // $("#step1").hide();
        // $("#step2").show();

        // @ts-ignore
        // Stretchy.resize(document.getElementById("calcNeeded-category"));
    }

    private parseScore(line): number[] {
        let strSplit = line.split(" ");
        let frac = strSplit[0].split('/');

        let outOf = parseFloat(frac[1]);

        let points;
        if (frac[0] === '-') {
            points = null;
        } else {
            points = parseFloat(frac[0]);
        }

        return [points, outOf];
    }

    private parseCategory(line: string) {
        let splitStr = line.split(' ');
        let percentIndex = splitStr.findIndex(s => s.includes("%"));
        let nameStr = splitStr.slice(0, percentIndex).join(" ");
        let percentStr = splitStr[percentIndex];
        // Get only number
        let percent = parseFloat(percentStr.substr(0, percentStr.length - 1)) * 0.01;
        return {name: nameStr, weight: percent};
    }

    private isAssignmentTag(line: string) {
        return line === 'Closed';
    }

    private openDialog(displayText: string) {
        this.dialog.open(AlertDialog,
            {width: '500px', data: {text: displayText}})
    }
}


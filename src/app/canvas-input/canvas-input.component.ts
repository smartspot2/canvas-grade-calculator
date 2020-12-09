import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {Assignment} from "../classes/assignmentClass";
import {Category} from "../classes/categoryClass";
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

    private static parseScore(line): number[] {
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

    private static parseCategory(line: string, nextLine: string) {
        let nameStr;
        let percentStr = '';
        let skip = false;
        if (line.includes('%')) {  // weight on current line
            let lineSplit = line.split(' ');
            let percentIndex = lineSplit.findIndex(s => s.includes("%"));
            nameStr = lineSplit.slice(0, percentIndex).join(" ").trim();
            percentStr = lineSplit[percentIndex];
        } else if (nextLine.includes('%')) {  // weight on next line
            let lineSplit = nextLine.split(' ');
            let percentIndex = lineSplit.findIndex(s => s.includes("%"));
            nameStr = line.trim();
            percentStr = lineSplit[percentIndex];
            skip = true;
        } else {  // no weight
            nameStr = line.trim();
        }

        if (!nameStr) {
            nameStr = 'Unnamed Category';
        }

        // Get only number
        let percent = 0;
        if (percentStr) {
            percent = parseFloat(percentStr.substr(0, percentStr.length - 1)) * 0.01;
        }
        return {skip: skip, cat: {name: nameStr, weight: percent}};
    }

    private static isAssignmentTag(line: string) {
        return line == 'Closed' || line == 'LATE' || line == 'MISSING';
    }

    private static isAssignmentType(line: string) {
        return line == 'Assignment' || line == 'Quiz' || line == 'Discussion Topic';
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

        let lastAssignment: Assignment = null;
        let lastCategory: Category = null;
        let curAssignmentType = '';
        let parseState = 'category';
        for (let lineIdx = 0; lineIdx < textSplitAssignments.length; lineIdx++) {
            let line = textSplitAssignments[lineIdx];
            let nextLine = (lineIdx < textSplitAssignments.length - 1) ? textSplitAssignments[lineIdx + 1] : '';

            if (!line.trim()) {
                // empty line
            } else if (parseState == 'category') {
                let parseResult = CanvasInputComponent.parseCategory(line, nextLine);
                let category = parseResult.cat;
                if (parseResult.skip) {  // used next line, so skip it
                    lineIdx++;
                }
                let catObj = new Category(category.name, category.weight);
                this.categories.push(catObj);
                lastCategory = catObj;
                parseState = 'assignment type';
            } else if (parseState == 'assignment type') {
                // Assignment type
                if (CanvasInputComponent.isAssignmentType(line)) {
                    curAssignmentType = line;
                    parseState = 'assignment name';
                } else {  // not an assignment; go back to category
                    lineIdx--;
                    parseState = 'category';
                }
            } else if (parseState == 'assignment name') {
                // Assignment Name
                let curAssignment = new Assignment(line);
                this.assignments.push(curAssignment);
                curAssignment.category = lastCategory.name;
                curAssignment.type = curAssignmentType;
                lastCategory.addAssignment(curAssignment);
                lastAssignment = curAssignment;
                parseState = 'assignment tag';
            } else if (parseState == 'assignment tag') {
                // Tag
                if (CanvasInputComponent.isAssignmentTag(line)) {
                    lastAssignment.tags.push(line.trim());
                } else {
                    lineIdx--;
                }
                parseState = 'availability';
            } else if (parseState == 'availability') {
                if (line.toLowerCase().includes('available until') || line.toLowerCase().includes('closed')) {
                    lastAssignment.setAvailability(line);
                } else {
                    lineIdx--;
                }
                parseState = 'due date';
            } else if (parseState == 'due date') {
                // Due Date
                // Should always be in the form "Due [mo] [day] at [time] [mo] [day] at [time]"
                //  or "Due [mo] [day], [year] at [time] [mo] [day], [year] at [time]"
                if (line.includes('Due') && line.length >= 9
                    && (line.split(' ')[3] == 'at' || line.split(' ')[4] == 'at')) {
                    if (line.includes('pts')) {
                        // Due date and points on same line
                        let match = line.match(/([0-9\-]+)\/([0-9\-]+) pts/)
                        let dueStr = line.slice(0, match.index);
                        let scoreStr = match[0];

                        lastAssignment.score = CanvasInputComponent.parseScore(scoreStr);
                        lastAssignment.due = dueStr;

                        parseState = 'assignment type';
                        continue;
                    } else if (line.includes("This assignment will not be assigned a grade.")) {
                        // Due dates and "no grade" on same line
                        lastAssignment.noGrade = true;
                        parseState = 'assignment type';
                        continue;
                    }
                    lastAssignment.due = line;
                } else {  // not a date
                    lineIdx--;
                }
                parseState = 'score';
            } else if (parseState == 'score') {
                // Score
                if (line.includes("This assignment will not be assigned a grade.")) {
                    lastAssignment.noGrade = true;
                } else {
                    lastAssignment.score = CanvasInputComponent.parseScore(line);
                }
                parseState = 'assignment type'
            }
        }

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

        // TODO: parsing grade statistics is broken for some classes

        let lastAssignment: Assignment = undefined;
        let isComment = false;
        let hasStatistics = false;
        textSplitGrades.forEach(line => {
            if (line == '') {
                // Skip empty lines
            } else if (line == "Score Details\tClose" || line.includes("Click to test a different score")) {
                // Titles/scores; skip
                // If assignment undefined, keep looking until there is a defined assignment
            } else if (lastAssignment == undefined) {
                // Keep loooking for new assignment if last is not found
                lastAssignment = this.assignments.find(asgnmt => asgnmt.name == line);
            } else if (isComment) {
                // Currently in comment
                let curComment = lastAssignment.comments[lastAssignment.comments.length - 1];
                let lineSplit = line.split(' ');
                if (line.includes(',') && lineSplit[lineSplit.length - 2] == 'at' && (line.endsWith('am') || line.endsWith('pm'))) {
                    // End of comment
                    curComment.text = curComment.text.trim();
                    curComment.author = line.split(', ')[0];
                    curComment.date = line.split(', ')[1];
                    isComment = false;
                } else {
                    // Add to end of comment
                    curComment.text += line + '\n';
                }
            } else if (line.split(' ').length == 4 && line.split(' ')[2] == 'by') {
                // Due Date
                lastAssignment.due = line;
            } else if (line.includes("Mean:") && line.includes("High:") && line.includes("Low:")) {
                // Statistics
                hasStatistics = true;
                let statSplit = line.split('\t');
                lastAssignment.statistics = {
                    mean: Number.parseFloat(statSplit[0].split(' ')[1]),
                    max: Number.parseFloat(statSplit[1].split(' ')[1]),
                    min: Number.parseFloat(statSplit[2].split(' ')[1])
                }
            } else if (line == "Comments\tClose") {
                // Comment start
                lastAssignment.comments.push({
                    date: undefined,
                    text: undefined,
                    author: undefined
                });
                isComment = true;
            } else if (CanvasInputComponent.isAssignmentTag(line)) {
                lastAssignment.tags.push(line.trim());
            } else {
                // Assignment name
                lastAssignment = this.assignments.find(asgnmt => asgnmt.name == line);
                if (lastAssignment == undefined) {
                    // console.log("[assignment not found]\t" + line);
                }
            }
        });

        if (!hasStatistics) {
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


import {Assignment} from './assignmentClass';
import * as hash from 'string-hash';

export class Category {
    public id: string;
    public receivedPoints: number;
    public totalPoints: number;
    public grade: number;
    public gradeStr: string;

    constructor(public name: string, public weight: number,
                public assignments?: Assignment[]) {
        if (this.assignments != undefined) {
            this.assignments.forEach(asgmt => {
                asgmt.category = this.name;
            });
        } else {
            this.assignments = [];
        }

        this.updateGrades();

        this.id = String(hash(this.name)).replace(/-/g, '');
    }

    public addAssignment(newAssignment: Assignment) {
        this.assignments.push(newAssignment);
        newAssignment.category = this.name;
        this.updateGrades();
    }

    public updateGrades() {
        this.receivedPoints = 0;
        this.totalPoints = 0;
        this.assignments.forEach(asgnmt => {
            if (asgnmt.score[0] != null && asgnmt.score[1] != null) {
                this.receivedPoints += asgnmt.score[0];
                this.totalPoints += asgnmt.score[1];
            }
        });
        this.grade = (this.receivedPoints / this.totalPoints);
        this.gradeStr = String(Number.parseFloat((this.grade * 100).toFixed(4)));
    }
}

import {Assignment} from './assignmentClass';
import * as hash from 'string-hash';

export class Category {
    public id: string;
    public receivedPoints: number;
    public totalPoints: number;
    public grade: number;
    public gradeStr: string;
    public fracStr: string;

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

    public removeAssignment(asgnmt: Assignment) {
        this.assignments.splice(
            this.assignments.findIndex(a => a.id == asgnmt.id), 1
        );
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
        if (!Number.isNaN(this.grade)) {
            this.gradeStr = String(Number.parseFloat((this.grade * 100).toFixed(4))) + '%';
            this.fracStr = '(' +
                Number.parseFloat(this.receivedPoints.toFixed(4)) + '/' +
                Number.parseFloat(this.totalPoints.toFixed(4)) + ')';
        } else {
            this.gradeStr = 'No grade';
            this.fracStr = '';
        }
    }
}

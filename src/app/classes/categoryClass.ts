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

    public addAssignment(newAssignment: Assignment, index?: number) {
        if (index == undefined) {
            this.assignments.push(newAssignment);
        } else {
            this.assignments.splice(index, 0, newAssignment);
        }
        newAssignment.category = this.name;
        this.updateGrades();
    }

    public removeAssignment(asgnmt: Assignment) {
        let removedAsgnmt = {
            index: this.assignments.findIndex(a => a.id == asgnmt.id),
            assignment: undefined
        };
        removedAsgnmt.assignment = this.assignments.splice(removedAsgnmt.index, 1)[0];
        return removedAsgnmt;
    }

    public updateGrades() {
        this.receivedPoints = 0;
        this.totalPoints = 0;
        this.assignments.forEach(asgnmt => {
            if (asgnmt.score[0] != null && asgnmt.score[1] != null) {
                this.receivedPoints += asgnmt.getRecievedPoints();
                this.totalPoints += asgnmt.getTotalPoints();
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

import * as hash from 'string-hash';
import * as _moment from 'moment';
import {Moment} from 'moment';

const moment = _moment;

export class Assignment {
    public statistics?: AssignmentStatistics;
    public comments?: Comment[] = [];
    public id?: string;
    public tags?: string[] = [];
    public type?: string;
    public editableName?: boolean = false;
    public noGrade?: boolean = false;
    public availability?: { start: Date, end: Date };

    constructor(name?: string, public score?: number[],
                public category?: string) {
        this.name = name;  // use setter
        if (score == undefined) {
            this.score = [null, null];
        }
    }

    private _due?: Moment;

    public get due() {
        return this._due.toString();
    }

    /**
     * Parses and sets the assignment due date using momentjs.
     */
    public set due(newVal: string) {
        let finalVal = newVal;
        let splitVal = newVal.split(' ');
        let parsedVal;
        if (splitVal.length >= 9 && splitVal[0] == 'Due') {
            if (splitVal[3] == 'at') {  // no year
                finalVal = splitVal.slice(1, 5).join(' ').replace(' at ', ' ');
                parsedVal = moment(finalVal, 'MMM DD hh:mma');
            } else if (splitVal[4] == 'at') { // has year
                finalVal = splitVal.slice(1, 6).join(' ').replace(' at ', ' ');
                parsedVal = moment(finalVal, 'MMM DD, YYYY hh:mma');
            }
        } else {
            finalVal = finalVal.replace(' by ', ' ');
            parsedVal = moment(finalVal, 'MMM DD hh:mma');
        }

        if (parsedVal._isValid && (!this._due || !this._due.isSame(parsedVal))) {
            this._due = parsedVal;
        }
    }

    private _name?: string;

    public get name() {
        return this._name;
    }

    /**
     * Sets the assignment name and updates the id.
     */
    public set name(newVal: string) {
        if (newVal) {  // only set if non-null
            this._name = newVal;
            this.id = String(hash(this.name)) + String(Math.random() * 10);
            this.id = this.id.replace(/[-.]/g, '');
        }
    }

    public getRecievedPoints() {
        return this.noGrade ? null : this.score[0];
    }

    public getTotalPoints() {
        return this.noGrade ? null : this.score[1];
    }

    public setAvailability(line: string) {
        if (line.includes('Not available until')) {
            let date = line.split(' ').slice(3, 7);
            this.availability = {start: new Date(date.join('')), end: null};
        } else {
            let date = line.split(' ').slice(2, 6);
            this.availability = {start: new Date(date.join('')), end: null};
        }
    }
}

class AssignmentStatistics {
    public mean: number;
    public min: number;
    public max: number;
}

class Comment {
    public author: string;
    public date: string;
    public text: string;
}

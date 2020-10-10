import * as hash from 'string-hash';

export class Assignment {
    public due?: string;
    public id?: string;
    public tag?: string;
    public type?: string;
    public editableName?: boolean = false;
    public noGrade?: boolean = false;
    public statistics: AssignmentStatistics;
    public comments: Comment[] = [];
    public availability?: { start: Date, end: Date };

    constructor(public name: string, public score?: number[],
                public category?: string) {
        if (score == undefined) {
            this.score = [null, null];
        }
        this.id = String(hash(this.name)) + String(Math.random() * 10);
        this.id = this.id.replace(/[-.]/g, '');
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

import * as hash from 'string-hash';

export class Assignment {
    public due?: string;
    public id?: string;
    public tag?: string;
    public editableName?: boolean = false;
    public noGrade?: boolean = false;
    public statistics: AssignmentStatistics;
    public comments: Comment[] = [];

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

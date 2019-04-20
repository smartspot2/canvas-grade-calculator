import * as hash from 'string-hash';

export class Assignment {
    public due?: string;
    public id?: string;
    public tag?: string;
    public editableName?: boolean = false;

    constructor(public name: string, public score?: number[],
                public category?: string) {
        if (score == undefined) {
            this.score = [null, null];
        }
        this.id = String(hash(this.name)) + String(Math.random() * 10);
        this.id = this.id.replace(/[-.]/g, '');
    }
}


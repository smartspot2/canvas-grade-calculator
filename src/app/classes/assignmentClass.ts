import * as hash from 'string-hash';

export class Assignment {
    public due?: string;
    public id?: string;

    constructor(public name: string, public score: number[],
                public category?: string) {
        this.id = String(hash(this.name)) + String(Math.random() * 10);
        this.id = this.id.replace(/[-.]/g, '');
    }
}


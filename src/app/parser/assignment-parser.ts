import {Category} from "../classes/categoryClass";
import {Assignment} from "../classes/assignmentClass";

export class AssignmentParser {
    public categories: Category[] = [];
    public assignments: Assignment[] = [];
    private readonly text: string[];
    private DEBUG: boolean = false;

    /**
     * Creates a new assignment parser object.
     * @param text - list of lines to parse
     */
    public constructor(text: string[]) {
        // remove lines that we'd want to skip, preprocess each line
        this.text = text.filter(line => !AssignmentParser.skip(line))
            .map(line => line.trim());
        // bind parse functions to current object
        this.parseCategory = this.parseCategory.bind(this);
        this.parseAssignmentType = this.parseAssignmentType.bind(this);
        this.parseAssignmentName = this.parseAssignmentName.bind(this);
        this.parseAssignmentTag = this.parseAssignmentTag.bind(this);
        this.parseAvailability = this.parseAvailability.bind(this);
        this.parseDueDate = this.parseDueDate.bind(this);
        this.parseScore = this.parseScore.bind(this);
    }

    /**
     * Determines whether the line should be skipped.
     * @private
     */
    private static skip(line: string): boolean {
        return !line.trim();
    }

    /**
     * Determines whether the line specifies an assignment type.
     * @private
     */
    private static isAssignmentType(line: string): boolean {
        line = line.toLowerCase();  // ignore case
        return line == 'assignment' || line == 'quiz' || line == 'discussion topic';
    }

    /**
     * Determines whether the line specifies an assignment tag.
     *
     * Currently only 'closed', 'late', or 'missing' are accepted.
     * @private
     */
    private static isAssignmentTag(line: string): boolean {
        line = line.toLowerCase();  // ignore case
        return line == 'closed' || line == 'late' || line == 'missing';
    }

    /**
     * Parses a score string into an array.
     * @returns an array of the form [recieved points, total points]
     * @private
     */
    private static parseScoreString(line): number[] {
        let strSplit = line.split(" ");
        let frac = strSplit[0].split('/');
        let points = frac[0] == '-' ? null : parseFloat(frac[0]);
        let outOf = parseFloat(frac[1]);
        return [points, outOf];
    }

    /**
     * Main parse function, continually applies parse functions returned
     * from previous states until the buffer is used up.
     * @param initialState - initial parse function
     */
    public parse(initialState?: Function) {
        if (!initialState) {
            initialState = this.parseCategory;
        }
        let [next, cat, asgnmt] = [initialState, null, null];
        while (this.hasNext()) {
            [next, cat, asgnmt] = next(cat, asgnmt);
        }
    }

    /**
     * Parses a new category.
     * @param cat - current category (overwritten)
     * @param asgnmt - current assignment (ignored)
     * @private
     */
    private parseCategory(cat: Category, asgnmt: Assignment): [Function, Category, Assignment] {
        this.debug('category');
        let nameStr;
        let percentStr = '';
        let line = this.popNext();
        let nextLine = this.getNext();

        if (line.includes('%')) {  // weight on current line
            let lineSplit = line.split(' ');
            let percentIndex = lineSplit.findIndex(s => s.includes("%"));
            nameStr = lineSplit.slice(0, percentIndex).join(" ").trim();
            percentStr = lineSplit[percentIndex];
        } else if (nextLine && nextLine.includes('%')) {  // weight on next line
            let lineSplit = nextLine.split(' ');
            let percentIndex = lineSplit.findIndex(s => s.includes("%"));
            nameStr = line.trim();
            percentStr = lineSplit[percentIndex];
            this.popNext();  // also pop next line as it's used
        } else {  // no weight
            nameStr = line.trim();
        }

        if (!nameStr) {  // default category name
            nameStr = 'Unnamed Category';
        }

        // Get only number
        let percent = 0;
        if (percentStr) {
            percent = parseFloat(percentStr.substr(0, percentStr.length - 1)) * 0.01;
        }

        cat = new Category(nameStr, percent);
        this.categories.push(cat);

        return [this.parseAssignmentType, cat, asgnmt];
    }

    /**
     * Parses the current assignment type.
     * This is always the first thing to be parsed for assignments, so a new assignment will be created.
     * @param cat - current category (used to set assignment category)
     * @param asgnmt - current assignment (ignored)
     * @private
     */
    private parseAssignmentType(cat: Category, asgnmt: Assignment): [Function, Category, Assignment] {
        this.debug('asgnmt type');
        if (AssignmentParser.isAssignmentType(this.getNext())) {
            asgnmt = this.createAssignment(cat);
            asgnmt.type = this.popNext();
            return [this.parseAssignmentName, cat, asgnmt];
        } else {  // not an assignment; go back to category
            return [this.parseCategory, cat, asgnmt];
        }
    }

    /**
     * Parses the assignment name.
     * @param cat - current category (used to set assignment category)
     * @param asgnmt - current assignment (assigned the name)
     * @private
     */
    private parseAssignmentName(cat: Category, asgnmt: Assignment): [Function, Category, Assignment] {
        this.debug('asgnmt name');
        asgnmt.name = this.popNext();
        return [this.parseAssignmentTag, cat, asgnmt];
    }

    /**
     * Parses the assignment tag.
     * @param cat - current category (ignored)
     * @param asgnmt - current assignment (assigned the tag)
     * @private
     */
    private parseAssignmentTag(cat: Category, asgnmt: Assignment): [Function, Category, Assignment] {
        this.debug('asgnmt tag');
        if (AssignmentParser.isAssignmentTag(this.getNext())) {
            asgnmt.tags.push(this.popNext());
        }
        return [this.parseAvailability, cat, asgnmt];
    }

    /**
     * Parses the availability of the assignment (closed/close date)
     * @param cat - current category (ignored)
     * @param asgnmt - current assignment (assigned the availability)
     * @private
     */
    private parseAvailability(cat: Category, asgnmt: Assignment): [Function, Category, Assignment] {
        this.debug('availability');
        let line = this.getNext().toLowerCase();  // ignore case
        if (line.includes('available until') || line.includes('closed')) {
            asgnmt.setAvailability(this.popNext());
        }
        return [this.parseDueDate, cat, asgnmt];
    }

    /**
     * Parses the due date of the assignment.
     *
     * Should always be in the form "Due [mo] [day] at [time] [mo] [day] at [time]"
     *  or "Due [mo] [day], [year] at [time] [mo] [day], [year] at [time]"
     * @param cat - current category (ignored)
     * @param asgnmt - current assignment (assigned the due date)
     * @private
     */
    private parseDueDate(cat: Category, asgnmt: Assignment): [Function, Category, Assignment] {
        this.debug('due date');
        let line = this.getNext().toLowerCase();  // ignore case
        let lineSplit = line.split(' ');
        if (line.includes('due') && lineSplit.length >= 9 && (lineSplit[3] == 'at' || lineSplit[4] == 'at')) {
            this.popNext();
            if (line.includes('pts')) {
                // Due date and points on same line
                let match = line.match(/([0-9\-]+)\/([0-9\-]+) pts/)
                let dueStr = line.slice(0, match.index);
                let scoreStr = match[0];
                asgnmt.score = AssignmentParser.parseScoreString(scoreStr);
                asgnmt.due = dueStr;
                return [this.parseAssignmentType, cat, null];  // new assignment
            } else if (line.includes("this assignment will not be assigned a grade")) {
                // Due dates and "no grade" on same line
                asgnmt.noGrade = true;
                return [this.parseAssignmentType, cat, null];  // new assignment
            }
            asgnmt.due = line;
        }
        return [this.parseScore, cat, asgnmt];
    }

    /**
     * Parses the assignment score, if graded.
     * @param cat - current category (ignored)
     * @param asgnmt - current assignment (assigned the score)
     * @private
     */
    private parseScore(cat: Category, asgnmt: Assignment): [Function, Category, Assignment] {
        this.debug('score');
        let line = this.popNext().toLowerCase();  // ignore case
        if (line.includes("this assignment will not be assigned a grade")) {
            asgnmt.noGrade = true;
        } else {
            asgnmt.score = AssignmentParser.parseScoreString(line);
        }
        return [this.parseAssignmentType, cat, null];  // new assignment
    }

    /**
     * Creates a new assignment and adds it to the `assignments` field
     * and adds it to the current category.
     * @param cat - category to add the new assignment to
     * @returns the new assignment
     * @private
     */
    private createAssignment(cat: Category): Assignment {
        let asgnmt = new Assignment();
        asgnmt.category = cat.name;
        this.assignments.push(asgnmt);
        cat.addAssignment(asgnmt);
        return asgnmt;
    }

    /**
     * Whether there are any lines left in the buffer.
     * @private
     */
    private hasNext(): boolean {
        return this.text.length > 0;
    }

    /**
     * Retrieves the next line in the buffer, but does not pop it.
     * @param idx - index of line to retrieve
     * @private
     */
    private getNext(idx: number = 0): string {
        return this.text[idx];
    }

    /**
     * Retrieves and pops the next line in the buffer.
     * @private
     */
    private popNext(): string {
        return this.text.shift();
    }

    /**
     * Debug function to log parse states.
     * @param funcName - name of the parse state
     * @private
     */
    private debug(funcName: string): void {
        if (this.DEBUG) {
            console.log(`${funcName}\t| ${this.getNext()}`);
        }
    }
}

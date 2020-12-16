import {Category} from "../classes/categoryClass";
import {Assignment} from "../classes/assignmentClass";

export class GradeParser {
    public categories: Category[] = [];
    public hasStatistics: boolean = false;
    private readonly text: string[];
    private DEBUG: boolean = false;

    /**
     * Creates a new grade parser object.
     * @param text - list of lines to parse
     * @param assignments - list of existing parsed assignments
     * @see AssignmentParser
     */
    public constructor(text: string[], public assignments: Assignment[]) {
        // remove lines that we'd want to skip, preprocess each line
        this.text = text.filter(line => !GradeParser.skip(line))
            .map(line => line.trim());
        // bind parse functions to current object
        this.parseAssignmentName = this.parseAssignmentName.bind(this);
        this.parseDueDate = this.parseDueDate.bind(this);
        this.parseAssignmentTag = this.parseAssignmentTag.bind(this);
        this.parseGradeInfo = this.parseGradeInfo.bind(this);
        this.parseGradeStatistics = this.parseGradeStatistics.bind(this);
        this.parseComment = this.parseComment.bind(this);
        this.parseRubric = this.parseRubric.bind(this);
    }

    /**
     * Determines whether the line should be skipped.
     * @private
     */
    private static skip(line: string): boolean {
        return !line.trim() || line.includes('test a different score');
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
     * Main parse function, continually applies parse functions returned
     * from previous states until the buffer is used up.
     * @param initialState - initial parse function
     */
    public parse(initialState?: Function) {
        if (!initialState) {
            initialState = this.parseAssignmentName;
        }
        let [next, asgnmt] = [initialState, null];
        while (this.hasNext()) {
            [next, asgnmt] = next(asgnmt);
        }
    }

    /**
     * Parses the assignment name.
     *
     * Continues to consume lines if no existing assignment matches.
     * @param asgnmt - current assignment (overwritten)
     * @private
     */
    private parseAssignmentName(asgnmt: Assignment): [Function, Assignment] {
        this.debug('assignment name');
        let line = this.popNext();
        asgnmt = this.assignments.find(asgnmt => asgnmt.name == line);
        if (asgnmt) {  // only proceed if we've found an existing assignment
            return [this.parseDueDate, asgnmt];
        }
        return [this.parseAssignmentName, asgnmt];
    }

    /**
     * Parses the assignment due date.
     * @param asgnmt - current assignment (assigned the due date)
     * @private
     */
    private parseDueDate(asgnmt: Assignment): [Function, Assignment] {
        this.debug('due date');
        let line = this.getNext();
        if ((line.split(' ').length == 4 && line.split(' ')[2] == 'by')
            || (line.split(' ').length == 5 && line.split(' ')[3] == 'by')) {
            asgnmt.due = this.popNext();
        }
        return [this.parseAssignmentTag, asgnmt];
    }

    /**
     * Parses the assignment tag.
     * @param asgnmt - current assignment (assigned the tag)
     * @private
     */
    private parseAssignmentTag(asgnmt: Assignment): [Function, Assignment] {
        this.debug('assignment tag');
        if (GradeParser.isAssignmentTag(this.getNext())) {
            asgnmt.tags.push(this.popNext());
        }
        return [this.parseGradeInfo, asgnmt];
    }

    /**
     * Parses the assignment grade info.
     *
     * Currently only handles assignments that don't count toward the final grade.
     * @param asgnmt - current assignment (assigned the grade info tag)
     * @private
     */
    private parseGradeInfo(asgnmt: Assignment): [Function, Assignment] {
        this.debug('grade info')
        if (this.getNext().toLowerCase().includes('final grade info')) {
            this.popNext();
            if (this.hasNext() && this.getNext().includes('does not count toward the final grade')) {
                asgnmt.noGrade = true;
                this.popNext();  // skip next line
            }
        }
        return [this.parseGradeStatistics, asgnmt];
    }

    /**
     * Parses the grade statistics for the assignment.
     * @param asgnmt - current assignment (assigned the statistics)
     * @private
     */
    private parseGradeStatistics(asgnmt: Assignment): [Function, Assignment] {
        this.debug('grade statistics')
        let nextLine = this.getNext(1).toLowerCase();
        if (this.getNext().toLowerCase().includes('score details')
            && nextLine.includes("mean:") && nextLine.includes("high:") && nextLine.includes("low:")) {
            // Statistics
            this.hasStatistics = true;
            let statSplit = nextLine.split('\t');
            asgnmt.statistics = {
                mean: Number.parseFloat(statSplit[0].split(' ')[1]),
                max: Number.parseFloat(statSplit[1].split(' ')[1]),
                min: Number.parseFloat(statSplit[2].split(' ')[1])
            };
            this.popNext();  // pop current and next line
            this.popNext();
        }
        return [this.parseComment, asgnmt];
    }

    /**
     * Parses assignment comments.
     *
     * Continues to consume lines until all comments are parsed.
     * @param asgnmt - current assignment (assigned the comments)
     * @private
     */
    private parseComment(asgnmt: Assignment): [Function, Assignment] {
        this.debug('comment');
        let line = this.getNext();
        if (line.toLowerCase().includes("comments\tclose")) {
            // Comment start
            asgnmt.comments.push({date: '', text: '', author: ''});
        } else {  // no comment
            return [this.parseRubric, asgnmt];
        }

        // Parse rest of comment
        while (this.hasNext()) {
            line = this.popNext();
            let curComment = asgnmt.comments[asgnmt.comments.length - 1];
            let lineSplit = line.split(' ');
            if (line.includes(',') && lineSplit[lineSplit.length - 2] == 'at' && (line.endsWith('am') || line.endsWith('pm'))) {
                // End of comment
                curComment.text = curComment.text.trim();
                curComment.author = line.split(', ')[0];
                curComment.date = line.split(', ')[1];
                if (this.getNext(1)) {
                    let twoAfter = this.getNext(1).split(' ');
                    if (twoAfter[twoAfter.length - 2] == 'by' && (twoAfter.length == 4 || twoAfter.length == 5)) {
                        return [this.parseAssignmentName, asgnmt];
                    } else {
                        // new comment starts
                        asgnmt.comments.push({date: '', text: '', author: ''});
                    }
                }
            } else {
                // Add to end of comment
                curComment.text += line + '\n';
            }
        }
        return [this.parseAssignmentName, asgnmt];
    }

    /**
     * Parses the rubric for an assignment.
     *
     * Currently does nothing except consume lines.
     * @param asgnmt - current assignment (assigned the rubric)
     * @private
     */
    private parseRubric(asgnmt: Assignment): [Function, Assignment] {
        this.debug('rubric');
        // Rubric
        let line = this.getNext();
        let nextLine = this.getNext(1);
        if (line.toLowerCase().includes('assessment by') || nextLine.toLowerCase().includes('close rubric')) {
            // continue on
        } else {
            return [this.parseAssignmentName, asgnmt];
        }

        // At this point rubrics are not supported; skip until the "total points" line
        while (this.hasNext()) {
            line = this.popNext();
            if (line.toLowerCase().includes('total points')) {
                return [this.parseAssignmentName, asgnmt];
            }
        }
        return [this.parseAssignmentName, asgnmt];
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
     * If there is no next line, returns an empty string.
     * @param idx - index of line to retrieve
     * @private
     */
    private getNext(idx: number = 0): string {
        return 0 <= idx && idx < this.text.length ? this.text[idx] : '';
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
            console.log(`[${funcName}] ${this.getNext()}`);
        }
    }

}

import {Assignment, AssignmentList, Category, CategoryList, WeightList} from "./assignmentObjects";
import * as $ from 'jquery';

export default class CanvasCalculator {

    public assignments: AssignmentList;
    public categories: CategoryList;
    public weights: WeightList;

    constructor() {
        this.assignments = new AssignmentList();
        this.categories = new CategoryList();
        this.weights = new WeightList();
    }

    public static collapseCategory(catID) {
        let cat = <HTMLDivElement>document.getElementById(catID.slice(3));
        let btn = <HTMLButtonElement>cat.children[0].children[0];

        for (let i = 0; i < cat.children.length; i++) {
            let element = <HTMLElement>cat.children[i];
            if (element.className === "categoryContent") {
                if (element.style.maxHeight) {
                    element.style.maxHeight = null;
                    btn.innerHTML = "&#9658";
                } else {
                    element.style.maxHeight = element.scrollHeight + "px";
                    btn.innerHTML = "&#9660";
                }
            }
        }
    }

    public parseText() {
        debugger;
        let text: string = (<HTMLTextAreaElement>document.getElementById("copypastefield")).value;

        // Split every line
        let textSplit: string[] = text.split('\n');
        textSplit = textSplit.map(s => s.trim());

        // Check for miscopied text; alert and don't proceed if incorrect copy-paste

        if (textSplit.includes("Name	Due	Status	Score	Out of	Details	Submission Progress Status")) {
            alert("You have copied the wrong page; please copy-paste the 'Assignments' page in Canvas.");
            return;
        } else if (textSplit.includes("Undated Assignments") || textSplit.includes("Past Assignments")) {
            alert("You have copied the assignments sorted by date. Please click on 'SHOW BY TYPE' in the top-right corner of the assignments page and try again.");
            return;
        } else if (textSplit.length === 1 && textSplit[0] === '') {
            alert("Please paste something in the text area.");
            return;
        }

        // Remove everything before assignments
        if (textSplit.some(l => {
            return l.includes("SHOW BY TYPE")
        })) {
            textSplit.splice(0, 1 + textSplit.findIndex(l => {
                return l.includes("SHOW BY TYPE")
            }));
        } else if (textSplit.includes("Show By")) {
            textSplit.splice(0, 3 + textSplit.indexOf("Show By"));
        } else {
            alert("Invalid text pasted. Please try again and make sure you are copy-pasting everything on the 'Assignments' page in Canvas.");
            return;
        }

        // Create assignments

        let lastAssignment: Assignment = null;
        let lastCategory: Category = null;
        textSplit.forEach(line => {
            if (lastCategory == null || line.includes("% of Total")) {
                // Should only occur at the beginning of the loop
                let category = this.parseCategory(line);
                let catObj = new Category(category.name, category.weight);
                this.categories.add(catObj);
                lastCategory = catObj;
            } else if (line.includes('Due')) {  // Due Date
                let curAsgnmt = this.assignments.find(lastAssignment);
                if (line.includes('pts')) { // Due date and points on same line
                    let lineSplit = line.split(" ");
                    let ptsIndex = lineSplit.indexOf("pts");

                    let dueStr = lineSplit.slice(0, ptsIndex - 1).join(' ');
                    let scoreStr = lineSplit.slice(ptsIndex - 1).join(' ');

                    curAsgnmt.score = this.parseScore(scoreStr);
                    line = dueStr;
                }
                curAsgnmt.due = line;
            } else if (line.includes('pts')) {  // Score
                // TODO: see if there's a way to add a tag on items that aren't counted toward the final grade.
                this.assignments.find(lastAssignment).score = this.parseScore(line);
            } else if (this.isAssignmentTag(line)) { // Tag
                this.assignments.find(lastAssignment).tag = line;
            } else {                            // Assignment Name
                let curAssignment = new Assignment(line);
                this.assignments.add(curAssignment);
                curAssignment.category = lastCategory.name;
                lastCategory.add(curAssignment);
                console.log(line);
                lastAssignment = null;// line;
            }
        });

        // Make weight list object
        this.weights = new WeightList();

        this.categories.arr.forEach(cat => {
            this.weights.dict[cat.name] = cat.weight;
        });

        // Display assignments as HTML elements
        this.makeHTMLAssignments();
        this.makeHTMLWeights();

        // Calculate grade
        this.calculateGrade();

        // Uncollapse step 2 and collapse step 1
        $("#step1").hide();
        $("#step2").show();

        // @ts-ignore
        Stretchy.resize(document.getElementById("calcNeeded-category"));
    }

    public parseNeededPercentageInput() {
        let totalPointsInput = <HTMLInputElement>document.getElementById("calcNeeded-totalPoints");
        let asgnmtCategoryInput = <HTMLInputElement>document.getElementById("calcNeeded-category");
        let targetPercentageInput = <HTMLInputElement>document.getElementById("calcNeeded-targetPercent");

        if (totalPointsInput.value === "" || asgnmtCategoryInput.value === "" || targetPercentageInput.value === "") {
            // Invalid input, alert
            alert("Invalid or empty calculation input. Please try again.");
            return;
        }
        let totalPoints = Number.parseFloat(totalPointsInput.value);
        let targetPercentage = Number.parseFloat(targetPercentageInput.value);
        let asgnmtCategory: string = asgnmtCategoryInput.value;
        let pointsNeeded = this.calculateNeededPercentage(totalPoints, targetPercentage, asgnmtCategory);

        if (pointsNeeded == null) return;

        // Create HTML span element to display needed points, rounded to 4 places

        let pointsText = <HTMLSpanElement>document.getElementById("calcNeeded-result");
        pointsText.innerText = (Math.round(pointsNeeded * 10000) / 10000).toString();
        let pointsPercentText = <HTMLSpanElement>document.getElementById("calcNeeded-resultPercent");
        pointsPercentText.innerText = (Math.round(10000 * pointsNeeded / totalPoints) / 100).toString();
    }

    public updateAssignments(inputElement) {
        let inputID_split = inputElement.id.split('-');
        let inputType = inputID_split[0];
        let inputID = inputID_split[1];

        let asgnmt = this.assignments.arr.find(cur => {
            return cur.id === inputID
        });

        // Update assignment score
        let newScore = parseFloat(inputElement.value);
        if (isNaN(newScore)) {
            newScore = null;
        }

        if (inputType === 'gotten') {
            asgnmt.score[0] = newScore;
        } else {
            asgnmt.score[1] = newScore;
        }

        // Recalculate the grade
        this.calculateGrade();
    }

    /*     HTML ELEMENT CREATION     */

    public updateWeights(inputElement) {
        let inputID = inputElement.id;

        // Get matching category
        let curCat = this.categories.arr.find(cat => {
            return cat.id === inputID
        });

        // Update weight
        let newWeight = parseFloat(inputElement.value) * 0.01;
        this.weights[curCat.name] = newWeight;
        curCat.weight = newWeight;

        // Update weight percentage in cat header
        let curCatHeader = document.getElementById("hed" + curCat.id);
        let curCatName = curCatHeader.getElementsByTagName("h3")[0];
        let curCatPercentage = curCatName.getElementsByTagName("span")[0];
        curCatPercentage.innerText = "(" + newWeight * 100 + "%)";

        // Recalculate the grade
        this.calculateGrade();
    }

    public updateAssignmentName(inputElement) {
        let parentAsgnmtDiv = inputElement.parentElement;
        let inputID = parentAsgnmtDiv.id;

        // Get matching assignment
        let curAsgnmt = this.assignments.arr.find(asgnmt => {
            return asgnmt.id === inputID
        });
        curAsgnmt.name = inputElement.value;
    }

    private parseScore(line): number[] {
        let strSplit = line.split(" ");
        let frac = strSplit[0].split('/');

        let outOf = parseFloat(frac[1]);

        let points;
        if (frac[0] === '-') {
            points = null;
        } else {
            points = parseFloat(frac[0]);
        }

        return [points, outOf];
    }

    private parseCategory(line: string) {
        let splitStr = line.split(' ');
        let percentIndex = splitStr.findIndex(s => s.includes("%"));
        let nameStr = splitStr.slice(0, percentIndex).join(" ");
        let percentStr = splitStr[percentIndex];
        // Get only number
        let percent = parseFloat(percentStr.substr(0, percentStr.length - 1)) * 0.01;
        return {name: nameStr, weight: percent};
    }

    private isAssignmentTag(line: string) {
        return line === 'Closed';
    }

    private makeHTMLAssignments() {
        let assignmentDiv = document.getElementById("assignmentList");

        this.categories.arr.forEach(cat => {
            let curCategory: HTMLDivElement = this.createCategory(cat);
            let catContent = document.createElement("div");
            catContent.className = "categoryContent";

            cat.assignments.forEach(asgnmt => {
                let curAssignment = this.createAssignment(asgnmt);
                catContent.appendChild(curAssignment);
            });

            // Add assignment button
            catContent.appendChild(this.createNewAssignmentBtn());

            curCategory.appendChild(catContent);
            assignmentDiv.appendChild(curCategory);

            // Insert select dropdown option for each tag for calcNeeded
            let newOptionElement = document.createElement("option");
            newOptionElement.innerText = cat.name;
            document.getElementById("calcNeeded-category").appendChild(newOptionElement);
        });

        // Track changes in form
        $("input[type='text'].assignmentScoreGotten").trackChanges();
        $("input[type='text'].assignmentScorePossible").trackChanges();
    }

    private makeHTMLWeights() {
        let weightsDiv = document.getElementById("weightList");

        this.categories.arr.forEach(cat => {
            let name = cat.name;
            let percentage = this.weights[cat.name];

            let curWeight = document.createElement("p");
            curWeight.innerHTML = ["<span class='weightName'>", name,
                "</span><span class='weightPercent'><input form='WEIGHTFORM' type='text' class='weightPercentInput' ",
                "id='", cat.id,
                "' value='",
                Math.round(percentage * 10000) / 100,
                "'>%</span>"].join('');
            curWeight.className = "weightItem";
            weightsDiv.appendChild(curWeight);
        });

        // Track changes in form
        $("input[type='text'].weightPercentInput").trackChanges();
    }

    private createCategory(cat) {
        let curCategory = document.createElement("div");
        curCategory.className = "category";
        curCategory.id = cat.id;

        let catHeader = document.createElement("div");
        catHeader.className = "categoryHeader";
        catHeader.id = "hed" + cat.id;
        catHeader.addEventListener("click", function () {
                CanvasCalculator.collapseCategory(this.id);
            }
        );

        let catCollapse = document.createElement("div");
        catCollapse.className = "categoryCollapse";
        catCollapse.id = "btn" + cat.id;
        catCollapse.innerHTML = "&#9658";
        catHeader.appendChild(catCollapse);

        let catName = document.createElement("h3");
        catName.className = "categoryName";
        catName.innerHTML = cat.name + " <span class='categoryPercentage'>(" + cat.weight * 100 + "%)</span>";
        catHeader.appendChild(catName);

        let catGrade = document.createElement("p");
        catGrade.className = "categoryGrade";
        catGrade.innerText = "placeholder";
        catHeader.appendChild(catGrade);

        curCategory.appendChild(catHeader);

        return curCategory
    }

    /*     GRADE CALCULATION     */

    private createAssignment(asgnmt) {
        let curAssignment = document.createElement("div");
        curAssignment.className = "assignment";
        curAssignment.id = asgnmt.id;

        // Name of assignment
        let asgnmtName = document.createElement("h4");
        asgnmtName.className = "assignmentName";
        asgnmtName.innerText = asgnmt.name;
        curAssignment.appendChild(asgnmtName);

        // Scores
        let asgnmtScore = document.createElement("div");
        asgnmtScore.className = "assignmentScore";

        let scoreTextContainer = document.createElement("div");

        // Create HTML inputs
        scoreTextContainer.innerHTML = ["Score: <input form='SCOREFORM' type='text' class='assignmentScoreGotten' ",
            "id='gotten-", asgnmt.id,
            "' value='", asgnmt.score[0],
            "'> / <input form='SCOREFORM' type='text' class='assignmentScorePossible' ",
            "id='possible-", asgnmt.id,
            "' value='", asgnmt.score[1],
            "'>"].join('');
        asgnmtScore.appendChild(scoreTextContainer);
        curAssignment.appendChild(asgnmtScore);

        // Create option to remove assignment
        let removeAsgnmtBtn = document.createElement("div");
        removeAsgnmtBtn.className = "removeAssignment";
        removeAsgnmtBtn.innerHTML = "&#215";
        removeAsgnmtBtn.addEventListener("click", (evt) => {
            this.removeAssignment(evt);
        });

        curAssignment.appendChild(removeAsgnmtBtn);

        return curAssignment;
    }

    private createBlankAssignment(cat) {
        let asgnmtObj = new Assignment("New Assignment");
        asgnmtObj.category = cat.name;
        this.assignments.arr.push(asgnmtObj);
        cat.assignments.push(asgnmtObj);

        let curAssignment = document.createElement("div");
        curAssignment.className = "assignment";
        curAssignment.id = asgnmtObj.id;

        // Name of assignment
        let asgnmtName = document.createElement("input");
        // asgnmtName.form = "ASGNMTNAMEFORM";
        asgnmtName.type = "text";
        asgnmtName.className = "assignmentName";
        asgnmtName.value = "New Assignment";
        asgnmtName.id = `name-${asgnmtObj.id}`;

        curAssignment.appendChild(asgnmtName);
        $(asgnmtName).trackChanges();

        // Scores
        let asgnmtScore = document.createElement("div");
        asgnmtScore.className = "assignmentScore";

        let scoreTextContainer = document.createElement("div");

        // Create HTML inputs
        scoreTextContainer.innerHTML = ["Score: <input form='SCOREFORM' type='text' class='assignmentScoreGotten' ",
            "id='gotten-", asgnmtObj.id,
            "' value='", null,
            "'> / <input form='SCOREFORM' type='text' class='assignmentScorePossible' ",
            "id='possible-", asgnmtObj.id,
            "' value='", null,
            "'>"].join('');
        $(scoreTextContainer.children).trackChanges();
        asgnmtScore.appendChild(scoreTextContainer);
        curAssignment.appendChild(asgnmtScore);

        // Create option to remove assignment
        let removeAsgnmtBtn = document.createElement("div");
        removeAsgnmtBtn.className = "removeAssignment";
        removeAsgnmtBtn.innerHTML = "&#215";
        removeAsgnmtBtn.addEventListener("click", (evt) => {
            this.removeAssignment(evt);
        });

        curAssignment.appendChild(removeAsgnmtBtn);

        return curAssignment;
    }

    private createNewAssignmentBtn() {
        let curAssignment = document.createElement("div");
        curAssignment.className = "createAssignment";

        let asgnmtName = document.createElement("span");
        asgnmtName.className = "addAssignmentBtn";
        asgnmtName.innerHTML = "Add new assignment";
        asgnmtName.addEventListener("click", (evt) => {
            this.addAssignment(evt);
        });

        curAssignment.appendChild(asgnmtName);
        return curAssignment;
    }

    /*     COLLAPSE CATEGORY     */

    private addAssignment(evt: MouseEvent) {
        let inputElement = <HTMLElement>evt.relatedTarget;
        let curElement = inputElement.parentElement;
        let catID = curElement.parentElement.parentElement.id;

        let curCat = this.categories.arr.find(cat => {
            return cat.id === catID
        });

        let catContentHTML = curElement.parentElement;

        let newAssignment = this.createBlankAssignment(curCat);

        catContentHTML.insertBefore(newAssignment, curElement);

        catContentHTML.style.maxHeight = catContentHTML.scrollHeight + "px";
    }

    /*     CALCULATION OF NEEDED POINTS     */

    private removeAssignment(evt: MouseEvent) {
        let curElement = <HTMLElement>evt.relatedTarget;
        let parentAsgnmt = curElement.parentElement;

        let asgnmtObj = this.assignments.arr.find(asgnmt => {
            return asgnmt.id === parentAsgnmt.id
        });

        let asgnmtIndex = this.assignments.arr.findIndex(asgnmt => {
            return asgnmt.id === parentAsgnmt.id
        });
        let curCat = this.categories.arr.find(cat => {
            return cat.name === asgnmtObj.category
        });
        let catIndex = curCat.assignments.findIndex(asgnmt => {
            return asgnmt.id === parentAsgnmt.id
        });

        this.assignments.arr.splice(asgnmtIndex, 1);
        curCat.assignments.splice(catIndex, 1);
        $(parentAsgnmt).remove();

        this.calculateGrade();
    }

    private calculateGrade() {
        // Loop through all categories
        //      For each category, loop through all assignments
        //          Keep tally of total points possible
        //          Keep tally of total points gotten
        //      Multiply fraction by weight
        //      Set category score value to DOM element next to category name and percentage
        // Add all fractions together to get total grade
        let grade = this.getGradeValue();

        let totalGradeHTML = document.getElementById("totalGrade");
        totalGradeHTML.innerText = Math.round(grade * 10000) / 100 + "%"
    }

    /*     UPDATE ASSIGNMENTS     */

    // When user clicks away from a assignmentScoreGotten DOM element or assignmentScorePossible DOM element,
    // update assignment object and recalculate grade.

    // If updated assignment possible points is blank, then exclude that assignment from the calculation.

    private getGradeValue() {
        let curGrade = 0;
        let totalWeights = 0;

        this.categories.arr.forEach(cat => {
            let curWeight = cat.weight;
            let curTotalGotten = 0;
            let curTotalPossible = 0;
            cat.assignments.forEach(asgnmt => {
                if (asgnmt.score[0] != null && asgnmt.score[1] != null) {
                    curTotalGotten += asgnmt.score[0];
                    curTotalPossible += asgnmt.score[1];
                }
            });

            if (curTotalPossible !== 0) {
                let catGrade = (curTotalGotten / curTotalPossible);
                this.updateCatGrade(cat, catGrade, curTotalGotten, curTotalPossible);
                curGrade += catGrade * curWeight;
                totalWeights += curWeight;
            } else {
                this.updateCatGrade(cat, null);
            }
        });

        curGrade /= totalWeights;
        return curGrade;
    }

    private updateCatGrade(cat: Category, grade?: number, pointsGotten?: number, pointsPossible?: number) {
        let curCatHTML = document.getElementById(cat.id);
        let curCatGrade = <HTMLParagraphElement>curCatHTML.getElementsByClassName("categoryGrade")[0];

        if (grade == undefined) {
            curCatGrade.innerText = "No grade";
        } else {
            curCatGrade.innerHTML = Math.round(grade * 10000) / 100 + "%" + "<br><span class='categoryPercentage'>(" + pointsGotten + "/" + pointsPossible + ")</span>";
        }

    }

    private calculateNeededPercentage(totalPoints: number, targetPercentage: number, targetCategory: string): number {
        let targetCatGottenSum: number = null;
        let targetCatTotalSum: number = null;
        let targetCatWeight: number = null;
        let totalCatWeights = 0;
        let curGrade = 0;

        this.categories.arr.forEach(cat => {
            let curGotten = 0;
            let curTotal = 0;
            cat.assignments.forEach(asgnmt => {
                if (asgnmt.score[0] != null && asgnmt.score[1] != null) {
                    curGotten += asgnmt.score[0];
                    curTotal += asgnmt.score[1];
                }
            });

            if (cat.name === targetCategory) {
                targetCatGottenSum = curGotten;
                targetCatTotalSum = curTotal;
                targetCatWeight = cat.weight;
                totalCatWeights += cat.weight;
                return;
            }

            if (curTotal === 0) return;

            totalCatWeights += cat.weight;
            curGrade += cat.weight * curGotten / curTotal;
        });

        if (targetCatTotalSum == null || targetCatGottenSum == null || targetCatWeight == null) {
            alert("Invalid category. Please try again.");
            return null;
        }

        // Derived from
        // (curGrade + targetCatWeight * (targetCatGottenSum + x) / (targetCatTotalSum + totalPoints)) / totalCatWeights = targetPercentage/100;

        return (targetCatTotalSum + totalPoints) * (targetPercentage / 100 * totalCatWeights - curGrade) / targetCatWeight - targetCatGottenSum;
    }
}

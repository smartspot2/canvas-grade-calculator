// When user clicks away from a assignmentScoreGotten DOM element or assignmentScorePossible DOM element,
// update assignment object and recalculate grade.

// If updated assignment possible points is blank, then exclude that assignment from the calculation.

function updateAssignments(inputElement) {
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
    calculateGrade();
}

function updateWeights(inputElement) {
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
    calculateGrade();
}

function updateAssignmentName(inputElement) {
    let parentAsgnmtDiv = inputElement.parentElement;
    let inputID = parentAsgnmtDiv.id;

    // Get matching assignment
    let curAsgnmt = this.assignments.arr.find(asgnmt => {
        return asgnmt.id === inputID
    });
    curAsgnmt.name = inputElement.value;
}
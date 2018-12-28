// When user clicks away from a assignmentScoreGotten DOM element or assignmentScorePossible DOM element,
// update assignment object and recalculate grade.

// If updated assignment possible points is blank, then exclude that assignment from the calculation.

function updateAssignments(inputElement) {
    let inputID_split = inputElement.id.split('-');
    let inputType = inputID_split[0];
    let inputID = inputID_split[1];

    let asgnmt = assignments.arr.find(cur => {return cur.id == inputID});

    // Update assignment score
    let newScore = parseFloat(inputElement.value);
    if (inputType == 'gotten') {
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
    let curCat = categories.arr.find(cat => {return cat.id == inputID});

    // Update weight
    let newWeight = parseFloat(inputElement.value)*0.01;
    weights[curCat.name] = newWeight;
    curCat.weight = newWeight;

    console.log({weights, categories, curCat, inputElement});

    // Recalculate the grade
    calculateGrade();
}
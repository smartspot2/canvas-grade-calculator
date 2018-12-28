// When user clicks away from a assignmentScoreGotten DOM element or assignmentScorePossible DOM element,
// update assignment object and recalculate grade.

// If updated assignment possible points is blank, then exclude that assignment from the calculation.

function updateAssignments(inputElement) {
    console.log(inputElement);

    let inputID_split = inputElement.id.split('-');
    let inputType = inputID_split[0];
    let inputID = inputID_split[1];

    let asgnmt = assignments.arr.find(cur => {return cur.id == inputID});

    // Update assignment score
    if (inputType == 'gotten') {
        asgnmt.score[0] = parseFloat(inputElement.value);
    } else {
        asgnmt.score[1] = parseFloat(inputElement.value);
    }

    // Recalculate the grade
    calculateGrade();
}
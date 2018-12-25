// Loop through all categories
//      For each category, loop through all assignments
//          Keep tally of total points possible
//          Keep tally of total points gotten
//      Multiply fraction by weight
//      Set category score value to DOM element next to category name and percentage
// Add all fractions together to get total grade

function calculateGrade() {
    var curGrade = 0;
    var totalWeights = 0;

    this.categories.arr.forEach(cat => {
        let curWeight = cat.weight;
        var curTotalGotten = 0;
        var curTotalPossible = 0;
        cat.assignments.forEach(asgnmt => {
            if (asgnmt.score[0] != null) {
                curTotalGotten += asgnmt.score[0];
                curTotalPossible += asgnmt.score[1];
            }
        });

        if (curTotalPossible != 0) {
            var catGrade = (curTotalGotten/curTotalPossible);
            updateCatGrade(cat, catGrade, curTotalGotten, curTotalPossible);
            curGrade += catGrade * curWeight;
            totalWeights += curWeight;
        } else {
            updateCatGrade(cat, null);
        }
    });

    curGrade /= totalWeights;

    var totalGradeHTML = document.getElementById("totalGrade");
    totalGradeHTML.innerText = Math.round(curGrade*10000)/100 + "%"
}


function updateCatGrade(cat, grade, pointsGotten, pointsPossible) {
    var curCatHTML = document.getElementById(cat.id);
    var curCatGrade = curCatHTML.getElementsByClassName("categoryGrade")[0];

    if (grade === null) {
        curCatGrade.innerText = "No grade";
    } else {
        curCatGrade.innerHTML = Math.round(grade*10000)/100 + "%" + "<br><span class='categoryPercentage'>(" + pointsGotten + "/" + pointsPossible + ")</span>";
    }

}
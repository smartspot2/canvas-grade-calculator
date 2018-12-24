function makeHTMLAssignments() {
    var assignmentDiv = document.getElementById("assignmentList");

    categories.arr.forEach(cat => {
        var curCategory = createCategory(cat);
        cat.assignments.forEach(asgnmt => {
            var curAssignment = createAssignment(asgnmt);
            curCategory.appendChild(curAssignment);
        });
        assignmentDiv.appendChild(curCategory);
    });
}

function createCategory(cat) {
    var curCategory = document.createElement("div");
    curCategory.className = "category";
    
    var catName = document.createElement("h3");
    catName.innerHTML = cat.name + " <span class='categoryPercentage'>(" + cat.weight*100 + "%)</span>";
    curCategory.appendChild(catName);

    return curCategory
}

function createAssignment(asgnmt) {
    var curAssignment = document.createElement("div");
    curAssignment.className = "assignment";

    // Name of assignment
    var asgnmtName = document.createElement("h4");
    asgnmtName.innerText = asgnmt.name;
    curAssignment.appendChild(asgnmtName);

    var asgnmtScore = document.createElement("form")
    asgnmtScore.innerHTML = ["Score: <input class='assignmentScoreGotten' value='",
                              asgnmt.score[0],
                              "'> / <input class='assignmentScorePossible' value='",
                              asgnmt.score[1],
                              "'>"].join('');
    curAssignment.appendChild(asgnmtScore);

    return curAssignment;
}


function printObject() {
    console.log(this.assignments);
}
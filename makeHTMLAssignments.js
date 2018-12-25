function makeHTMLAssignments() {
    var assignmentDiv = document.getElementById("assignmentList");

    categories.arr.forEach(cat => {
        var curCategory = createCategory(cat);
        var catContent = document.createElement("div");
        catContent.className = "categoryContent";

        cat.assignments.forEach(asgnmt => {
            var curAssignment = createAssignment(asgnmt);
            catContent.appendChild(curAssignment);
        });
        
        curCategory.appendChild(catContent);
        assignmentDiv.appendChild(curCategory);
    });
}

function makeHTMLWeights() {
    var weightsDiv = document.getElementById("weightList");

    this.categories.arr.forEach(cat => {
        var name = cat.name;
        var percentage = weights[cat.name];

        var curWeight = document.createElement("p");
        curWeight.innerHTML = ["<span class='weightName'>", name,
                               "</span><span class='weightPercent'><input type='text' class='weightPercentInput' value='",
                                Math.round(percentage*10000)/100,
                                "'>%</span>"].join('');
        curWeight.className = "weightItem";
        weightsDiv.appendChild(curWeight);
    });
}

function createCategory(cat) {
    var curCategory = document.createElement("div");
    curCategory.className = "category";
    curCategory.id = cat.id;

    var catHeader = document.createElement("div");
    catHeader.className = "categoryHeader";
    catHeader.id = "bn2" + cat.id;
    catHeader.addEventListener("click", function(event) {
        collapseCategory(this.id);
    })
    
    var catCollapse = document.createElement("div");
    catCollapse.className = "categoryCollapse";
    catCollapse.id = "btn" + cat.id;
    catCollapse.innerHTML = "&#9658";
    catHeader.appendChild(catCollapse);

    var catName = document.createElement("h3");
    catName.className = "categoryName";
    catName.innerHTML = cat.name + " <span class='categoryPercentage'>(" + cat.weight*100 + "%)</span>";
    catHeader.appendChild(catName);

    var catGrade = document.createElement("p");
    catGrade.className = "categoryGrade";
    catGrade.innerText = "placeholder";
    catHeader.appendChild(catGrade);

    curCategory.appendChild(catHeader);

    return curCategory
}

function createAssignment(asgnmt) {
    var curAssignment = document.createElement("div");
    curAssignment.className = "assignment";

    // Name of assignment
    var asgnmtName = document.createElement("h4");
    asgnmtName.className = "assignmentName";
    asgnmtName.innerText = asgnmt.name;
    curAssignment.appendChild(asgnmtName);

    var asgnmtScore = document.createElement("form");
    asgnmtScore.className = "assignmentScore";
    var scoreTextContainer = document.createElement("div");
    scoreTextContainer.innerHTML = ["Score: <input type='text' class='assignmentScoreGotten' value='",
                              asgnmt.score[0],
                              "'> / <input type='text' class='assignmentScorePossible' value='",
                              asgnmt.score[1],
                              "'>"].join('');
    asgnmtScore.appendChild(scoreTextContainer);
    curAssignment.appendChild(asgnmtScore);

    return curAssignment;
}

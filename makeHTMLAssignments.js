function makeHTMLAssignments() {
    let assignmentDiv = document.getElementById("assignmentList");

    // Reset calcNeeded dropdown category options
    document.getElementById("calcNeeded-category").innerHTML = "";

    this.categories.arr.forEach(cat => {
        let curCategory = createCategory(cat);
        let catContent = document.createElement("div");
        catContent.className = "categoryContent";

        cat.assignments.forEach(asgnmt => {
            let curAssignment = createAssignment(asgnmt);
            catContent.appendChild(curAssignment);
        });

        // Add assignment button
        catContent.appendChild(createNewAssignmentBtn(cat));

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

function makeHTMLWeights() {
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

function createCategory(cat) {
    let curCategory = document.createElement("div");
    curCategory.className = "category";
    curCategory.id = cat.id;

    let catHeader = document.createElement("div");
    catHeader.className = "categoryHeader";
    catHeader.id = "hed" + cat.id;
    catHeader.addEventListener("click", function () {
        collapseCategory(this.id);
    });

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

function createAssignment(asgnmt) {
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
    removeAsgnmtBtn.addEventListener("click", function () {
        removeAssignment(this);
    });
    curAssignment.appendChild(removeAsgnmtBtn);

    return curAssignment;
}

function createNewAssignmentBtn() {
    let curAssignment = document.createElement("div");
    curAssignment.className = "createAssignment";

    let asgnmtName = document.createElement("span");
    asgnmtName.className = "addAssignmentBtn";
    asgnmtName.innerHTML = "Add new assignment";
    asgnmtName.addEventListener("click", function () {
        addAssignment(this);
    });

    curAssignment.appendChild(asgnmtName);
    return curAssignment;
}

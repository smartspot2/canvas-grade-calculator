function addAssignment(inputElement) {
    let curElement = inputElement.parentElement;
    let catID = curElement.parentElement.parentElement.id;

    let curCat = this.categories.arr.find(cat => {
        return cat.id === catID
    });

    let catContentHTML = curElement.parentElement;

    let newAssignment = createBlankAssignment(curCat);

    catContentHTML.insertBefore(newAssignment, curElement);

    catContentHTML.style.maxHeight = catContentHTML.scrollHeight + "px";
}

function removeAssignment(curElement) {
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

    calculateGrade();
}

function createBlankAssignment(cat) {
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
    removeAsgnmtBtn.addEventListener("click", function () {
        removeAssignment(this);
    });
    curAssignment.appendChild(removeAsgnmtBtn);

    return curAssignment;
}
function parseText() {
    var text = document.getElementById("copypastefield").value;

    // Split every line
    var textSplit = text.split('\n');
    textSplit = textSplit.map(s => s.trim());

    // Remove everything before assignments
    if (textSplit.some(l => {l.includes("SHOW BY TYPE")})) {
        textSplit.splice(0, textSplit.findIndex(l => {l.contains("SHOW BY TYPE")}));
    } else {
        textSplit.splice(0, 3 + textSplit.indexOf("Show By"));
    }

    // Create assignments
    this.assignments = new AssignmentList();
    this.categories = new CategoryList();

    var lastAssignment = "";
    var lastCategory = "";
    textSplit.forEach(line => {
        if (lastCategory == "" || line.includes("% of Total")) {
            // Should only occur at the beginning of the loop
            var category = parseCategory(line);
            var catObj = new Category(category.name, category.weight);
            categories.add(catObj);
            lastCategory = catObj;
        } else if (line.includes('Due')) {  // Due Date
            curAsgnmt = assignments.find(lastAssignment);
            if (line.includes('pts')) { // Due date and points on same line
                var lineSplit = line.split(" ");
                let ptsIndex = lineSplit.indexOf("pts");
                
                dueStr = lineSplit.slice(0, ptsIndex-1).join(' ');
                scoreStr = lineSplit.slice(ptsIndex-1).join(' ');

                curAsgnmt.score = parseScore(scoreStr);
                line = dueStr;
            }
            curAsgnmt.due = line;
        } else if (line.includes('pts')) {  // Score
            assignments.find(lastAssignment).score = parseScore(line);
        } else if (isAssignmentTag(line)) { // Tag
            assignments.find(lastAssignment).tag = line;
        } else {                            // Assignment Name
            var curAssignment = new Assignment(line);
            assignments.add(curAssignment);
            curAssignment.category = lastCategory.name;
            lastCategory.add(curAssignment);
            lastAssignment = line;
        }
    });

    // Make weight list object
    this.weights = new WeightList();

    categories.arr.forEach(cat => {
        weights[cat.name] = cat.weight;
    });

    // Display assignments as HTML elements
    makeHTMLAssignments();

    // Calculate grade
    calculateGrade();

    // Uncollapse step 2 and collapse step 1
    $("#step1").hide();
    $("#step2").show();
}

function parseScore(line) {
    strSplit = line.split(" ");
    frac = strSplit[0].split('/');

    outOf = parseFloat(frac[1]);

    if (frac[0] == '-') {
        points = null;
    } else {
        points = parseFloat(frac[0]);
    }

    return [points, outOf];
}

function parseCategory(line) {
    var splitStr = line.split(' ');
    var percentIndex = splitStr.findIndex(s => s.includes("%"));
    var nameStr = splitStr.slice(0, percentIndex).join(" ");
    var percent = splitStr[percentIndex];
    // Get only number
    percent = parseFloat(percent.substr(0, percent.length-1))*0.01;
    return {name: nameStr, weight: percent};
}

function isAssignmentTag(line) {
    if (line == 'Closed') {
        return true;
    }
    return false;
}
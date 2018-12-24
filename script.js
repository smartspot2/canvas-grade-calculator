function parseText() {
    var text = document.getElementById("copypastefield").value;

    // Split every line
    var textSplit = text.split('\n');
    textSplit = textSplit.map(s => s.trim());

    // Remove everything before assignments
    textSplit.splice(0, 1 + textSplit.indexOf("Name	Due	Status	Score	Out of	Details	Submission Progress Status"));

    // Get weights and remove from textSplit
    let endIndex = textSplit.findIndex(line => line.includes("of Final")) - 1;
    weights = textSplit.slice(textSplit.indexOf("Group  Weight"));

    console.log(weights);
    textSplit.splice(endIndex);


    // Create assignments
    var assignments = new AssignmentList();

    var lastAssignment = "";
    textSplit.forEach(line => {
        if (lastAssignment == "" && line != "") {
            assignments.add(new Assignment(line));
            lastAssignment = line;
        } else if (line.includes('by')) {
            assignments.find(lastAssignment).due = line;
        } else if (line.includes('Click to test a different score') ||
                   /^-{0,1}\d+$/.test(line)) {
            assignments.find(lastAssignment).score = parseScore(line);
        } else if (isAssignmentTag(line)) {
            assignments.find(lastAssignment).tag = line;
        } else if (line == "") {
            lastAssignment = "";
        } else {
            assignments.add(new Assignment(line));
            lastAssignment = line;
        }
    });

    console.log(assignments);

    // Parse Weights
    console.log(weights);
}

function parseScore(line) {
    if (/^-{0,1}\d+$/.test(line)) {
        // Is a singular number; this would be the assignment's point value
        return [null, parseFloat(line)];
    }

    var newLine = line.replace("Click to test a different score", '').trim();
    var score = newLine.split(/\s/);
    if (score.some(s => s.includes("%"))) {
        let outOf = parseFloat(score[1]);
        let percent = parseFloat(score[1].substring(0, score[1].length-1));
        score = [percent*0.01*outOf, outOf];
    } else if (score[0] == '-') {
        score = [null, parseFloat(score[1])];
    } else {
        score = score.map(n => parseFloat(n));
    }
    return score;
}

function isAssignmentTag(line) {
    if (line == 'LATE' || line == 'MISSING') {
        return true;
    }
    return false;
}

class Assignment {
    constructor(name) {
        this.name = name;
        this.due = "";
        this.score = [];
        this.tag = "";
    }
}

class AssignmentList {
    constructor() {
        this.assignments = [];
    }

    add(asgnmt) {
        this.assignments.push(asgnmt);
    }

    find(name) {
        return this.assignments.find(asgnmt => asgnmt.name == name);
    }
}
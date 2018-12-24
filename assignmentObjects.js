class Assignment {
    constructor(name) {
        this.name = name;
        this.due = "";
        this.score = [];
        this.category = "";
    }
}

class Category {
    constructor(name, weight) {
        this.assignments = [];
        this.name = name;
        this.weight = weight;
        this.id = String(this.name.hashCode()).replace(/-/g, '') + String(this.weight).replace(/./g, '');
    }

    add(asgnmt) {
        this.assignments.push(asgnmt);
    }

    find(name) {
        return this.assignments.find(asgnmt => asgnmt.name == name);
    }
}

class AssignmentList {
    constructor() {
        this.arr = [];
    }

    add(asgnmt) {
        this.arr.push(asgnmt);
    }

    find(name) {
        return this.arr.find(asgnmt => asgnmt.name == name);
    }
}

class CategoryList {
    constructor() {
        this.arr = [];
    }

    add(cat) {
        this.arr.push(cat)
    }

    find(name) {
        return this.arr.find(cat => cat.name == name);
    }
}

class WeightList {}
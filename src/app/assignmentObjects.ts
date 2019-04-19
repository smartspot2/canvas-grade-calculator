// export class Assignment {
//     public name: string;
//     public score: number[];
//     public category: string;
//     public id: string;
//     public tag: string;
//     public due: string;
//
//     constructor(name) {
//         this.name = name;
//         // this.due = "";
//         this.score = [null, null];
//         this.category = "";
//         this.id = String(this.name.hashCode()) + String(Math.random() * 10);
//         this.id = this.id.replace(/[-.]/g, '');
//     }
// }
//
// export class Category {
//     public assignments: Assignment[];
//     public name: string;
//     public weight: number;
//     public id: string;
//
//     constructor(name, weight) {
//         this.assignments = [];
//         this.name = name;
//         this.weight = weight;
//         this.id = String(this.name.hashCode()).replace(/-/g, '');
//     }
//
//     add(asgnmt) {
//         this.assignments.push(asgnmt);
//     }
//
//     // find(name) {
//     //     return this.assignments.find(asgnmt => asgnmt.name === name);
//     // }
// }
//
// export class AssignmentList {
//     public arr: Assignment[];
//
//     constructor() {
//         this.arr = [];
//     }
//
//     add(asgnmt) {
//         this.arr.push(asgnmt);
//     }
//
//     find(name) {
//         return this.arr.find(asgnmt => asgnmt.name === name);
//     }
// }
//
// export class CategoryList {
//     public arr: Category[];
//
//     constructor() {
//         this.arr = [];
//     }
//
//     add(cat) {
//         this.arr.push(cat)
//     }
//
//     // find(name) {
//     //     return this.arr.find(cat => cat.name === name);
//     // }
// }
//
// export class WeightList {
//     public dict;
//
//     constructor() {
//         this.dict = {};
//     }
// }

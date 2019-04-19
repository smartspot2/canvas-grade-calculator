import CanvasCalculator from "./CanvasCalculator";


console.log("test");
debugger;

$.fn.extend({
    trackChanges: function () {
        this.each(function () {
            $(this).on('change', function (e) {
                let el = e.target;
                if (el.className === "assignmentScoreGotten" || el.className === "assignmentScorePossible") {
                    cc.updateAssignments(el);
                } else if (el.className === "weightPercentInput") {
                    cc.updateWeights(el);
                } else if (el.className === "assignmentName") {
                    cc.updateAssignmentName(el);
                }
            })
        });
    }
});

function resetPage() {
    $("#step1").show();
    $("#step2").hide();
    $("#assignmentList").empty();
    $("#weightList").empty();
}

/*     INITIALIZE VARIABLES AND SET BUTTON HANDLERS     */

let cc = new CanvasCalculator();
document.getElementById("calcNeeded-submit").addEventListener("click", e => {
    cc.parseNeededPercentageInput();
});

document.getElementById("resetCalculator").addEventListener("click", e => {
    resetPage();
});

document.getElementById("submitbutton").addEventListener("click", e => {
    cc.parseText();
});

debugger;


// $("step2").hide();

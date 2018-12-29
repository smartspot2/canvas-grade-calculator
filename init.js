String.prototype.hashCode = function () {
    let hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

$.fn.extend({
    trackChanges: function () {
        this.each(function() {
            $(this).on('change', function (e) {
                let el = e.target;
                if (el.className == "assignmentScoreGotten" || el.className == "assignmentScorePossible") {
                    updateAssignments(el);
                } else if (el.className == "weightPercentInput") {
                    updateWeights(el);
                } else if (el.className == "assignmentName") {
                    updateAssignmentName(el);
                }
            })
        });
    }
});

$("step2").hide();
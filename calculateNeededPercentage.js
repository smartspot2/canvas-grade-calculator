function parseNeededPercentageInput() {
    let totalPoints = document.getElementById("calcNeeded-totalPoints").value;
    let asgnmtCategory = document.getElementById("calcNeeded-category").value;
    let targetPercentage = document.getElementById("calcNeeded-targetPercent").value;

    if (totalPoints === "" || asgnmtCategory === "" || targetPercentage === "") {
        // Invalid input, alert
        alert("Invalid or empty calculation input. Please try again.");
        return;
    }
    totalPoints = Number.parseFloat(totalPoints);
    targetPercentage = Number.parseFloat(targetPercentage);
    let pointsNeeded = calculateNeededPercentage(totalPoints, targetPercentage, asgnmtCategory);

    if (pointsNeeded == null) return;

    // Create HTML span element to display needed points, rounded to 4 places

    let pointsText = document.getElementById("calcNeeded-result");
    pointsText.innerText = (Math.round(pointsNeeded * 10000) / 10000).toString();
    let pointsPercentText = document.getElementById("calcNeeded-resultPercent");
    pointsPercentText.innerText = (Math.round(10000 * pointsNeeded / totalPoints) / 100).toString();
}

function calculateNeededPercentage(totalPoints, targetPercentage, targetCategory) {
    let targetCatGottenSum = null;
    let targetCatTotalSum = null;
    let targetCatWeight = null;
    let totalCatWeights = 0;
    let curGrade = 0;

    this.categories.arr.forEach(cat => {
        console.log("in foreach");
        let curGotten = 0;
        let curTotal = 0;
        cat.assignments.forEach(asgnmt => {
            if (asgnmt.score[0] != null && asgnmt.score[1] != null) {
                curGotten += asgnmt.score[0];
                curTotal += asgnmt.score[1];
            }
        });

        console.log([cat.name, targetCategory]);

        if (cat.name === targetCategory) {
            targetCatGottenSum = curGotten;
            targetCatTotalSum = curTotal;
            targetCatWeight = cat.weight;
            totalCatWeights += cat.weight;
            return;
        }

        if (curTotal === 0) return;

        totalCatWeights += cat.weight;
        curGrade += cat.weight * curGotten / curTotal;
    });

    if (targetCatTotalSum == null || targetCatGottenSum == null || targetCatWeight == null) {
        alert("Invalid category. Please try again.");
        return null;
    }

    // Derived from
    // (curGrade + targetCatWeight * (targetCatGottenSum + x) / (targetCatTotalSum + totalPoints)) / totalCatWeights = targetPercentage/100;

    return (targetCatTotalSum + totalPoints) * (targetPercentage / 100 * totalCatWeights - curGrade) / targetCatWeight - targetCatGottenSum;
}
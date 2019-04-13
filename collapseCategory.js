function collapseCategory(catID) {
    let cat = document.getElementById(catID.slice(3));
    let btn = cat.children[0].children[0];

    for (let i = 0; i < cat.children.length; i++) {
        let element = cat.children[i];
        if (element.className === "categoryContent") {
            if (element.style.maxHeight) {
                element.style.maxHeight = null;
                btn.innerHTML = "&#9658";
            } else {
                element.style.maxHeight = element.scrollHeight + "px";
                btn.innerHTML = "&#9660";
            }
        }
    }
}

function resetPage() {
    $("#step1").show();
    $("#step2").hide();
    $("#assignmentList").empty();
    $("#weightList").empty();
}
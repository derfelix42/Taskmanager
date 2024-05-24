window.addEventListener('beforeunload', function (event) {
    // console.log(event)
    event.stopImmediatePropagation();
});


let categoryColors = {}
fetch("api/getCategoryColors.php")
    .then(response => response.json())
    .then(json => categoryColors = json);

function updateDurationSumOfDay(day, sum) {
    //console.log("Update Date's Duration Sum of",day,"to",sum)
    let prev_sum = document.getElementById(day)
    //console.log(prev_sum)
    if (prev_sum)
        prev_sum.innerText = sum
}

function updateSpentTimeOfDay(day, sum) {
    // console.log("Udpating", day, "to", sum)
    let prev_sum = document.getElementById(day)
    if (prev_sum)
        prev_sum.innerText = sum
}

Number.prototype.pad = function (size) {
    let s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

function closePrint() {
    document.body.removeChild(this.__container__)
}

function setPrint() {
    this.contentWindow.__container__ = this;
    this.contentWindow.onbeforeunload = closePrint;
    this.contentWindow.onafterprint = closePrint;
    this.contentWindow.focus(); // Required for IE
    this.contentWindow.print();
}

function printPDF(pdf) {
    let iframe = document.createElement("iframe");
    iframe.onload = setPrint;
    iframe.style.display = "none";
    iframe.src = pdf;
    document.body.appendChild(iframe);
}


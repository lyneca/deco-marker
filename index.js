/* eslint-disable no-undef */
const iframe = document.getElementById('iframe');
const container = document.getElementById('iframe-container');
const code = document.getElementById('code');
const sketch = document.getElementById('iframe-container');
const markingDialog = document.getElementById('markingDialog');
const buttonPrev = document.getElementById('btn-prev');
const buttonPlay = document.getElementById('btn-play');
const buttonStop = document.getElementById('btn-stop');
const buttonMark = document.getElementById('btn-mark');
const buttonFull = document.getElementById('btn-full');
const buttonNext = document.getElementById('btn-next');

const gradeA = document.getElementById('gradeA');
const gradeB = document.getElementById('gradeB');
const gradeC = document.getElementById('gradeC');

const commentA = document.getElementById('commentA');
const commentB = document.getElementById('commentB');
const commentC = document.getElementById('commentC');

const daysLate = document.getElementById('mark-late');
const override = document.getElementById('override');
const finalMark = document.getElementById('mark-final');

const commentPreview = document.getElementById('commentPreview');

const gradeThresholds = {
    HD: 85,
    DI: 75,
    CR: 65,
    PS: 50,
    FA: 0
}

const templates = {
    A: {
        HD: "Criteria A HD Comment Template",
        DI: "Criteria A DI Comment Template",
        CR: "Criteria A CR Comment Template",
        PS: "Criteria A PS Comment Template",
        FA: "Criteria A FA Comment Template"
    },
    B: {
        HD: "Criteria B HD Comment Template",
        DI: "Criteria B DI Comment Template",
        CR: "Criteria B CR Comment Template",
        PS: "Criteria B PS Comment Template",
        FA: "Criteria B FA Comment Template"
    },
    C: {
        HD: "Criteria C HD Comment Template",
        DI: "Criteria C DI Comment Template",
        CR: "Criteria C CR Comment Template",
        PS: "Criteria C PS Comment Template",
        FA: "Criteria C FA Comment Template"
    }
}

let markingDialogShown = false;

// Refresh the display and code window
function updateDisplay() {
    iframe.width = container.width - 20;
    iframe.height = container.height - 20;

    // This just works
    iframe.contentWindow.location.href = 'extracted'
    
    // Set style of iframe stuff (to remove scrollbars)
    iframe.contentDocument.body.style.margin = 0;
    iframe.contentDocument.body.style.display = 'flex';
    iframe.contentDocument.body.style.justifyContent = 'center';
    iframe.contentDocument.body.style.alignItems = 'center';

    // Get the code from the server
    const xhttp = new XMLHttpRequest();

    xhttp.open('GET', 'extracted/mySketch.js?t=' + Math.random(), true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            code.innerHTML = this.responseText;
            // Re-style the code
            code.classList.remove('prettyprinted');
            PR.prettyPrint(code);
        }
    }
}

function prev() { }

function play() {
    updateDisplay();
}

function stop() {
    iframe.srcdoc = '<style>body {background-color: #eeeeee;}</style><body></body>';
}

function mark() {
    if (markingDialogShown) {
        markingDialogShown = false;
        markingDialog.style.opacity = 0;
        setTimeout(() => markingDialog.style.visibility = "hidden", 100);
    } else {
        markingDialogShown = true;
        markingDialog.style.visibility = "visible";
        markingDialog.style.opacity = 1;
    }
}

function full() {
    iframe.requestFullscreen();
}

function next() { }

function updatePreview() {
    console.log([commentA.value, commentB.value, commentC.value]);
    console.log([commentA.value, commentB.value, commentC.value].filter(x => x.trim() !== "").join('\n\n'));
    commentPreview.value = [commentA.value, commentB.value, commentC.value].filter(x => x.trim() !== "").join('\n\n');
}

function calculateMarks() {
    let num = Math.round((parseInt(markA.value, 10) + parseInt(markB.value, 10) + parseInt(markC.value, 10)) / 3) - (override.checked ? 0 : 5 * daysLate.value)

    if (num < 0) num = 0;
    if (num > 100) num = 100;
    return num;
}

function updateMarks() {
    const num = calculateMarks();
    if (!isNaN(num)) finalMark.innerHTML = num;
}

window.onLoad = () => {
    sketch.onmouseup = () => updateDisplay();
    iframe.onfullscreenchange = () => iframe.contentWindow.location.reload();

    // What a hack lmao
    [gradeA, gradeB, gradeC].forEach(e => {
        e.onchange = function() {
            const type = this.id[this.id.length - 1];
            this.style.backgroundColor = getComputedStyle(this.children[this.selectedIndex]).backgroundColor;
            document.getElementById('mark' + type).value = gradeThresholds[this.value];
            document.getElementById('comment' + type).value = templates[type][this.value];
            updatePreview();
            updateMarks();
        }
    });

    [commentA, commentB, commentC].forEach(e => {
        e.oninput = updatePreview;
    });

    [markA, markB, markC, daysLate, override].forEach(e => {
        e.oninput = updateMarks;
    });

    buttonPrev.onclick = prev;
    buttonPlay.onclick = play;
    buttonStop.onclick = stop;
    buttonMark.onclick = mark;
    buttonFull.onclick = full;
    buttonNext.onclick = next;
    updateDisplay();
}

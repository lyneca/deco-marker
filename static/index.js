/* eslint-disable no-undef */

function getElement(id) { return document.getElementById(id); }

const iframe = getElement('iframe');
const container = getElement('iframe-container');
const code = getElement('code');
const sketch = getElement('iframe-container');
const markingDialog = getElement('markingDialog');
// const buttonPrev = getElement('btn-prev');
const buttonPlay = getElement('btn-play');
const buttonStop = getElement('btn-stop');
const buttonMark = getElement('btn-mark');
const buttonFull = getElement('btn-full');
const buttonHome = getElement('btn-home');

const sid = parseInt(getElement('sid').innerHTML)

console.log(sid)

const markA = getElement('markA');
const markB = getElement('markB');
const markC = getElement('markC');

const gradeA = getElement('gradeA');
const gradeB = getElement('gradeB');
const gradeC = getElement('gradeC');

const commentA = getElement('commentA');
const commentB = getElement('commentB');
const commentC = getElement('commentC');

const daysLate = getElement('mark-late');
const override = getElement('override');
const finalMark = getElement('mark-final');

const submit = getElement('submit');

const commentPreview = getElement('commentPreview');

const gradeThresholds = {
    HD: 85,
    DI: 75,
    CR: 65,
    PS: 50,
    FA: 0
}

// EDIT ME!
// =============

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

// =============

function htmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}


let markingDialogShown = false;

// Refresh the display and code window
function updateDisplay() {
    iframe.width = container.width - 20;
    iframe.height = container.height - 20;

    // This just works
    iframe.contentWindow.location.href = '/index.html'
    
    // Set style of iframe stuff (to remove scrollbars)
    iframe.contentDocument.body.style.margin = 0;
    iframe.contentDocument.body.style.display = 'flex';
    iframe.contentDocument.body.style.justifyContent = 'center';
    iframe.contentDocument.body.style.alignItems = 'center';

    // Get the code from the server
    const xhttp = new XMLHttpRequest();

    xhttp.open('GET', '/mySketch.js', true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            code.innerHTML = htmlEscape(this.responseText);
            // Re-style the code
            code.classList.remove('prettyprinted');
            PR.prettyPrint(code);
        }
    }
}

function home() {
    window.location.href = '/';
}

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

function updatePreview() {
    commentPreview.value = [commentA.value, commentB.value, commentC.value].filter(x => x.trim() !== "").join('\n\n');
}

function calculateMarks() {
    let num = Math.round(parseInt(markA.value, 10) + parseInt(markB.value, 10) + parseInt(markC.value, 10))
    if (daysLate && override) num -= override.checked ? 0 : 5 * daysLate.value;

    if (num < 0) num = 0;
    if (num > 300) num = 300;
    return num;
}

function updateMarks() {
    const num = calculateMarks();
    if (!isNaN(num)) finalMark.innerHTML = num;
}

function sendToServer(sid, rubric, comment, grade) {
    const xhttp = new XMLHttpRequest();

    xhttp.open("POST", "/grade", true)
    xhttp.setRequestHeader("Content-Type", `application/json`);
    xhttp.send(JSON.stringify({
        sid: sid,
        rubric: rubric,
        comment: comment,
        mark: grade
    }));
    console.log("sent");
}

// Alex: 450157028

// Daisuke
function sendMarkToCanvas() {
    console.log("sending...");
    console.log(markA.value)
    console.log(markB.value)
    console.log(markC.value)
    sendToServer(
        sid,
        {
            A: parseInt(markA.value),
            B: parseInt(markB.value),
            C: parseInt(markC.value)
        },
        commentPreview.value,
        finalMark.innerHTML
    );
}


window.onLoad = () => {
    sketch.onmouseup = () => updateDisplay();
    iframe.onfullscreenchange = () => iframe.contentWindow.location.reload();

    // What a hack lmao
    [gradeA, gradeB, gradeC].forEach(e => {
        e.onchange = function() {
            const type = this.id[this.id.length - 1];
            this.style.backgroundColor = getComputedStyle(this.children[this.selectedIndex]).backgroundColor;
            getElement('mark' + type).value = gradeThresholds[this.value];
            getElement('comment' + type).value = templates[type][this.value];
            updatePreview();
            updateMarks();
        }
    });

    [commentA, commentB, commentC].forEach(e => {
        e.oninput = updatePreview;
    });

    [markA, markB, markC, ].forEach(e => {
        e.oninput = updateMarks;
    });
    [daysLate, override].forEach(e => {
        if (e) e.oninput = updateMarks;
    });

    // buttonPrev.onclick = prev;
    buttonPlay.onclick = play;
    buttonStop.onclick = stop;
    buttonMark.onclick = mark;
    buttonFull.onclick = full;
    buttonHome.onclick = home;
    // buttonNext.onclick = next;
    submit.onclick = sendMarkToCanvas;
    updateDisplay();
}

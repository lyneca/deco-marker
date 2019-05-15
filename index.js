const HTML_HEAD = `
<head>
    <script src='https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/p5.min.js'></script>
    <script src='https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/addons/p5.dom.min.js'></script>
    <script src='https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/addons/p5.sound.min.js'></script>
    <style>
        body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    </style>
</head>
`

function updateDisplay(text) {
    const iframe = document.getElementById('iframe');
    const container = document.getElementById('iframe-container');

    iframe.width = container.width - 20;
    iframe.height = container.height - 20;

    iframe.srcdoc = `
    <html>
    ${HTML_HEAD}
    <body>
    <script>
        ${text}
    </script>
    </body>
    </html>
    `
    iframe.contentWindow.location.reload()
}

window.onLoad = () => {
    const sketch = document.getElementById('iframe-container');
    const text = 'function setup() {createCanvas(windowWidth, windowHeight);} function draw() {ellipse(width/2, height/2, 50, 50);}';

    console.log(sketch)
    sketch.onmouseup = () => updateDisplay(text);
    updateDisplay(text);
}

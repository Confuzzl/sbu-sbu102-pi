let sides = 3;
let radius = 300;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distance(that) {
        const a = this.x - that.x;
        const b = this.y - that.y;
        return Math.sqrt(a * a + b * b);
    }
}

function angleStep() {
    return (2 * Math.PI) / sides;
}

function sideLength() {
    const a = radius - radius * Math.cos(angleStep());
    const b = radius * Math.sin(angleStep());
    return Math.sqrt(a * a + b * b);
}

function apothemLength() {
    const { a, midpoint } = slice();
    return a.distance(midpoint);
}

function drawNgon() {
    const step = angleStep();
    ctx.fillStyle = "lightskyblue";
    const path = new Path2D();
    path.moveTo(radius, 0);
    for (let i = 1; i <= sides; i++) {
        path.lineTo(radius * Math.cos(step * i), radius * Math.sin(step * i));
    }
    ctx.fill(path);
}

function slice() {
    const step = angleStep();
    const a = new Point(0, 0);
    const b = new Point(radius, 0);
    const c = new Point(radius * Math.cos(step), -radius * Math.sin(step));
    const midpoint = new Point(
        (radius * Math.cos(step) + radius) / 2,
        (-radius * Math.sin(step)) / 2
    );
    return { a: a, b: b, c: c, midpoint: midpoint };
}

function drawSlice() {
    const { a, b, c, midpoint } = slice();

    {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "dodgerblue";
        const path = new Path2D();
        path.moveTo(a.x, a.y);
        path.lineTo(b.x, b.y);
        path.lineTo(c.x, c.y);
        path.lineTo(a.x, a.y);
        ctx.stroke(path);
    }
    {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "forestgreen";
        const path = new Path2D();
        path.moveTo(b.x, b.y);
        path.lineTo(c.x, c.y);
        ctx.stroke(path);

        text(
            "s",
            midpoint.x + radius / 10,
            midpoint.y - radius / 10,
            `italic ${radius / 3}px Computer Modern Serif`,
            "forestgreen"
        );
    }
    {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "navy";
        const path = new Path2D();
        path.moveTo(0, 0);
        path.lineTo(midpoint.x, midpoint.y);
        ctx.stroke(path);

        text(
            "h",
            midpoint.x / 2,
            midpoint.y / 2,
            `italic ${radius / 3}px Computer Modern Serif`,
            "navy"
        );
    }
}

function drawRadius() {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
    const path = new Path2D();
    path.moveTo(0, 0);
    path.lineTo(radius, 0);
    ctx.stroke(path);

    text(
        "r",
        radius / 2,
        radius / 5,
        `italic ${radius / 3}px Computer Modern Serif`,
        "red"
    );
}

function text(str, x, y, font, color = "black", outline = "white") {
    ctx.font = font;
    const textSize = ctx.measureText(str);
    ctx.strokeStyle = outline;
    ctx.lineWidth = 5;

    ctx.strokeText(str, x - textSize.width / 2, y);
    ctx.fillStyle = color;
    ctx.fillText(str, x - textSize.width / 2, y);
}

function update() {
    updateSideLength();
    updateApothemLength();
    updateAreaPi();
    updatePerimeterPi();
    render();
}

function updateSides(val) {
    sideOutput.innerHTML = `<i>n</i> = ${val}`;
    sides = parseInt(val);
    update();
}
const sideSlider = document.getElementById("side_slide");
sideSlider.oninput = (event) => {
    updateSides(sideSlider.value);
};
const sideOutput = document.getElementById("side_output");

function updateRadius(val) {
    radiusOutput.innerHTML = `<i>r</i> = ${val}`;
    radius = parseInt(val);
    update();
}
const radiusOutput = document.getElementById("radius_output");
const radiusSlider = document.getElementById("radius_slide");
radiusSlider.oninput = (event) => {
    updateRadius(radiusSlider.value);
};

function updateSideLength() {
    sideLengthOutput.innerHTML = `Side length <i>s</i> = ${
        Math.round(sideLength() * 10000) / 10000
    }`;
}
const sideLengthOutput = document.getElementById("side_length_output");
function updateApothemLength() {
    const { a, midpoint } = slice();
    apothemLengthOutput.innerHTML = `Apothem length <i>h</i> = ${
        Math.round(a.distance(midpoint) * 10000) / 10000
    }`;
}
const apothemLengthOutput = document.getElementById("apothem_output");

function updateAreaPi() {
    const pi = (sides * sideLength() * apothemLength()) / (2 * radius * radius);
    areaPiOutput.children[0].innerText = `\\(\\pi\\approx${pi}\\)`;
    areaPiOutput.children[1].innerText = `${Math.abs(
        ((pi - Math.PI) / Math.PI) * 100
    )}% error`;
}
const perimeterPiOutput = document.getElementById("perimeter_pi");
function updatePerimeterPi() {
    const pi = (sides * sideLength()) / (2 * radius);
    perimeterPiOutput.children[0].innerText = `\\(\\pi\\approx${pi}\\)`;
    perimeterPiOutput.children[1].innerText = `${Math.abs(
        ((pi - Math.PI) / Math.PI) * 100
    )}% error`;
}
const areaPiOutput = document.getElementById("area_pi");

const canvasWrapper = document.getElementById("canvas-wrapper");
const w = canvasWrapper.offsetWidth * 0.9;
const h = canvasWrapper.offsetHeight * 0.9;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function axes() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";

    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(0, h / 2);
    ctx.stroke();
}

function init() {
    canvas.width = w;
    canvas.height = h;
}

function render() {
    ctx.clearRect(-w / 2, -h / 2, w, h);
    ctx.setTransform(1, 0, 0, 1, w / 2, h / 2);
    ctx.fillStyle = "white";
    ctx.fillRect(-w / 2, -h / 2, w, h);
    axes();

    circle(0, 0, radius, 5, "black");
    drawNgon();
    drawSlice();
    drawRadius();

    MathJax.typeset();
}

function main() {
    init();

    updateSides(3);
    updateRadius(100);
}

function circle(x, y, r, w, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.lineWidth = w;
    ctx.strokeStyle = color;
    ctx.stroke();
}
function tri(x1, y1, x2, y2, x3, y3, color) {
    ctx.fillStyle = color;
    const path = new Path2D();
    path.moveTo(x1, -y1);
    path.lineTo(x2, -y2);
    path.lineTo(x3, -y3);
    ctx.fill(path);
}
function rect(x1, y1, x2, y2, color) {
    ctx.fillStyle = color;
    const w = x2 - x1;
    const h = y2 - y1;
    ctx.fillRect(x1, -y2, w, h);
}

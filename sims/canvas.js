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

class Canvas {
    constructor(id = "canvas", render) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext("2d");
        this.render = render;

        const canvasWrapper = document.getElementById("canvas-wrapper");
        const w = canvasWrapper.offsetWidth * 0.9;
        const h = canvasWrapper.offsetHeight * 0.9;
        this.canvas.width = w;
        this.canvas.height = h;
        this.maxX = w / 2;
        this.maxY = h / 2;
        this.ctx.setTransform(1, 0, 0, 1, w / 2, h / 2);
    }

    clear() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(-w / 2, -h / 2, w, h);
    }

    line(a, b, w, color) {
        this.ctx.lineWidth = w;
        this.ctx.strokeStyle = color;
        const path = new Path2D();
        path.moveTo(a.x, a.y);
        path.lineTo(b.x, b.y);
        this.ctx.stroke(path);
    }
    circle(c, r, w, color) {
        this.ctx.lineWidth = w;
        this.ctx.strokeStyle = color;
        const path = new Path2D();
        path.arc(c.x, c.y, r, 0, 2 * Math.PI);
        this.ctx.stroke(path);
    }
    tri(p1, p2, p3, color) {
        this.ctx.fillStyle = color;
        const path = new Path2D();
        path.moveTo(p1.x, -p1.y);
        path.lineTo(p2.x, -p2.y);
        path.lineTo(p3.x, -p3.y);
        this.ctx.fill(path);
    }
    rect(p1, p2, color) {
        this.ctx.fillStyle = color;
        const w = p2.x - p1.x;
        const h = p2.y - p2.x;
        this.ctx.fillRect(p1.x, -p1.y, w, h);
    }
}

class Latex {
    static elements = [];

    update() {
        MathJax.typeset(elements);
    }
}

class Output {
    static text(out, str) {
        out.element.innerText = str;
    }
    static html(out, str) {
        out.element.innerHTML = str;
    }
    static latex(out, str) {
        out.element.innerText = `\\(${str}\\)`;
        MathJax.typeset([out.element]);
        // Latex.elements.push(out.element);
    }

    constructor(id, setType, strFunc) {
        this.element = document.getElementById(id);
        this.update = (str) => {
            setType(this, strFunc(str));
        };
    }
}
class Field {
    constructor(min, max, value, step) {
        this.min = min;
        this.max = max;
        this.value = value;
        this.step = step;
    }
}
class Slider {
    constructor(id, field, pre, outputs, post) {
        this.element = document.getElementById(id);

        this.updateOutputs = () => {
            for (const output of outputs) output.update(this.value());
        };
        this.update = () => {
            pre(this);
            this.updateOutputs();
            post(this);
        };
        this.element.oninput = this.update;

        this.output = outputs;

        this.useField(field);
    }

    useField(field) {
        this.field = field;
        this.element.min = field.min;
        this.element.max = field.max;
        this.element.value = field.value;
        this.element.step = field.step;
    }

    value() {
        return parseFloat(this.element.value);
    }

    enable() {
        this.element.removeAttribute("disabled");
    }
    disable() {
        this.element.setAttribute("disabled", "");
    }
}

class Button {
    constructor(id, onclick) {
        this.element = document.getElementById(id);
        this.element.onclick = onclick;
    }

    enable() {
        this.element.removeAttribute("disabled");
    }
    disable() {
        this.element.setAttribute("disabled", "");
    }
}

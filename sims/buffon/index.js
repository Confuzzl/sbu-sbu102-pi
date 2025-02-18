class Needle {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }

    crossesLine() {
        const ax = this.a.x;
        const bx = this.b.x;
        const left = ax < bx ? ax : bx;
        const right = ax > bx ? ax : bx;
        const leftLine = Math.floor(left / sim.spacing) * sim.spacing;
        const rightLine = Math.ceil(right / sim.spacing) * sim.spacing;
        return rightLine - leftLine >= 2 * sim.spacing;
    }
}
class Simulation {
    needles = 0;
    needlesTouching = 0;
    spacing = 100;
    needleRatio = 0.5;
    needleLength;
    running = false;
    needlesPerTick = 1;
    loop;

    constructor() {}

    init() {
        spacing.update(spacing);
        needle.update();
        needleLength.update();

        needleCount.update();
        needleTouchingCount.update();

        this.changeGroup(1);
        approx.update();
        error.update();
        MathJax.typeset();
    }

    newNeedle() {
        const random = (max) => (Math.random() - 0.5) * 2 * max;
        const angle = () => Math.random() * Math.PI;

        const pos = new Point(random(canvas.maxX), random(canvas.maxY));
        const ang = angle();
        const extent = new Point(
            (this.needleLength * Math.cos(ang)) / 2,
            (this.needleLength * Math.sin(ang)) / 2
        );
        const a = new Point(pos.x - extent.x, pos.y - extent.y);
        const b = new Point(pos.x + extent.x, pos.y + extent.y);
        const needle = new Needle(a, b);
        this.needles++;
        if (needle.crossesLine()) {
            this.needlesTouching++;
            canvas.line(a, b, 2, "red");
        } else {
            canvas.line(a, b, 1, "black");
        }
    }
    randomDistance() {
        return (Math.random() * this.spacing) / 2;
    }
    static randomAngle() {
        return (Math.random() * Math.PI) / 2;
    }
    static randomY() {
        return (Math.random() - 0.5) * 2 * canvas.maxY;
    }
    newNeedle2() {
        const xOffset =
            Math.floor(
                ((Math.random() - 0.5) * 2 * canvas.maxX) / this.spacing
            ) * this.spacing;
        const yOffset = Simulation.randomY();
        const dist = this.randomDistance();
        const ang = Simulation.randomAngle();
        const touching =
            dist <= (this.needleLength / 2) * Math.sin(Math.PI / 2 + ang);
        const dist2 = (Math.random() > 0.5 ? 1 : -1) * dist;
        canvas.line(
            new Point(
                xOffset + dist2 - (this.needleLength * Math.cos(ang)) / 2,
                yOffset - (this.needleLength * Math.sin(ang)) / 2
            ),
            new Point(
                xOffset + dist2 + (this.needleLength * Math.cos(ang)) / 2,
                yOffset + (this.needleLength * Math.sin(ang)) / 2
            ),
            touching ? 3 : 1,
            touching ? "red" : "black"
        );
        if (touching) this.needlesTouching++;
        this.needles++;
    }

    drawLines() {
        canvas.clear();
        const numLines = Math.floor(canvas.maxX / this.spacing);
        canvas.line(
            new Point(0, -canvas.maxY),
            new Point(0, +canvas.maxY),
            1,
            "black"
        );
        for (let i = 1; i <= numLines; i++) {
            canvas.line(
                new Point(-i * this.spacing, -canvas.maxY),
                new Point(-i * this.spacing, +canvas.maxY),
                1,
                "black"
            );
            canvas.line(
                new Point(+i * this.spacing, -canvas.maxY),
                new Point(+i * this.spacing, +canvas.maxY),
                1,
                "black"
            );
        }
    }

    toggle() {
        if (this.running) {
            this.pause();
        } else {
            this.play();
        }
    }
    play() {
        this.running = true;
        play.element.innerText = "pause";
        spacing.element.setAttribute("disabled", "");
        needle.element.setAttribute("disabled", "");

        this.newNeedle2();

        this.loop = setInterval(() => {
            for (let i = 0; i < this.needlesPerTick; i++) {
                this.newNeedle2();
            }
            needleCount.update();
            needleTouchingCount.update();
            approx.update();
            error.update();
            MathJax.typeset();
        }, 100);
    }
    pause() {
        this.running = false;
        play.element.innerText = "play";

        clearInterval(this.loop);
    }
    reset() {
        this.pause();
        canvas.clear();
        spacing.element.removeAttribute("disabled");
        needle.element.removeAttribute("disabled");
        this.drawLines();
        this.needles = 0;
        this.needlesTouching = 0;
        needleCount.update();
        needleTouchingCount.update();
        approx.update();
        error.update();
        MathJax.typeset();
    }

    changeGroup(factor) {
        const n = this.needlesPerTick * factor;
        if (n == 1) {
            groupDec.element.setAttribute("disabled", "");
        } else {
            groupDec.element.removeAttribute("disabled");
        }
        this.needlesPerTick = n;
        groupOutput.update(this.needlesPerTick);
    }
}
const sim = new Simulation();

const canvas = new Canvas("canvas", () => {});
const needleLength = new Output("needle_length_output", Output.html, () => {
    sim.needleLength = sim.spacing * sim.needleRatio;
    return `Needle length <i>l</i> = ${
        Math.round(sim.needleLength * 100) / 100
    }`;
});
const spacing = new Slider(
    "spacing_slide",
    new Field(10, 200, 100, 10),
    (self) => {},
    [
        new Output("spacing_output", Output.html, (val) => {
            sim.spacing = val;
            return `<i>t</i> = ${val}`;
        }),
        needleLength,
    ],
    (self) => {
        sim.drawLines();
    }
);
const needle = new Slider(
    "needle_slide",
    new Field(0.01, 0.99, 0.5, 0.01),
    (self) => {},
    [
        new Output("needle_output", Output.html, (val) => {
            sim.needleRatio = val;
            return `<i>r</i> = ${val}`;
        }),
        needleLength,
    ],
    (self) => {}
);
const stop = new Button("stop", () => {
    sim.reset();
});
const play = new Button("play", () => {
    sim.toggle();
});
const groupOutput = new Output("group_output", Output.text, (val) => `${val}x`);
const groupInc = new Button("group_increase", () => {
    sim.changeGroup(2);
});
const groupDec = new Button("group_decrease", () => {
    sim.changeGroup(0.5);
});
const needleCount = new Output(
    "needle_count",
    Output.html,
    () => `Needles: ${sim.needles}`
);
const needleTouchingCount = new Output(
    "needle_touching_count",
    Output.html,
    () => `Touching needles: ${sim.needlesTouching}`
);
const approx = new Output("approx", Output.latex, () => {
    const pi =
        (2 * sim.needleLength * sim.needles) /
        (sim.spacing * sim.needlesTouching);
    return `\\pi\\approx${isFinite(pi) ? pi : 0}`;
});
const error = new Output("error", Output.text, () => {
    const val =
        (2 * sim.needleLength * sim.needles) /
        (sim.spacing * sim.needlesTouching);
    const pi = isFinite(val) ? val : Math.PI;
    return `${Math.abs(((pi - Math.PI) / Math.PI) * 100)}% error`;
});

function main() {
    sim.init();
}

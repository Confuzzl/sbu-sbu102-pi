class DiceProb {
    constructor(i) {
        this.index = i;
        const e = document.createElement("div");
        e.classList.add("prob");
        const odd = document.createElement("output");
        odd.id = `odd_${i}`;
        odd.innerText = 0;
        const slider = document.createElement("input");
        slider.type = "range";
        slider.id = `slider_${i}`;
        const prob = document.createElement("output");
        prob.id = `prob_${i}`;
        prob.innerText = 0;
        e.appendChild(odd);
        e.appendChild(slider);
        e.appendChild(prob);
        probabilities.appendChild(e);
        this.element = e;
        this.odd = odd;
        this.slider = slider;
        this.prob = prob;

        this.slider = new Slider(
            slider.id,
            new Field(0, 8, 4, 1),
            (self) => {},
            [
                new Output(odd.id, Output.text, (val) => val),
                new Output(
                    prob.id,
                    Output.text,
                    (val) => Math.round((val / sim.oddSum) * 100) / 100
                ),
            ],
            (self) => {
                sim.updateOdds();
            }
        );
        this.slider.updateOutputs();
    }
    getOdds() {
        return parseInt(this.odd.innerText);
    }
}
class Simulation {
    sumSize = 2;
    probObjs = [];
    probs = [];
    intervals = [];
    oddSum = 0;
    frequency = { n: 0, max_freq: 0, max: 0 };
    data = { mean: { value: 0, sum: 0 }, variance: { value: 0, sum: 0 } };
    rollSize = 1;
    running = false;

    loop;

    init() {
        sumSize.update();
        this.probObjs = [...Array(6)].map((_, i) => new DiceProb(i));
        this.updateOdds();
        this.changeRollSize(this.rollSize);
    }
    toggle() {
        if (this.running) {
            this.pause();
        } else {
            this.play();
        }
    }
    play() {
        play.element.innerText = "pause";
        this.running = true;
        sumSize.disable();
        for (const p of this.probObjs) p.slider.disable();

        this.loop = setInterval(() => {
            this.roll(this.rollSize);
        }, 100);
    }
    pause() {
        play.element.innerText = "play";
        this.off();
    }
    reset() {
        this.off();
        this.resetFrequency();
        this.updateBars();
        this.resetData();

        nOutput.update(this.frequency.n);
        mOutput.update(this.data.mean.value);
        sOutput.update(this.data.variance.value);

        approx.update(0);
        measuring_value.update();
    }
    off() {
        this.running = false;
        sumSize.enable();
        for (const p of this.probObjs) p.slider.enable();

        clearInterval(this.loop);
    }

    changeRollSize(n) {
        this.rollSize = n;
        rollOutput.update(n);
        if (n === 1) {
            dec.disable();
        } else {
            dec.enable();
        }
    }

    updateBars() {
        barPlot.innerHTML = "";
        barPlot.style.setProperty(
            "grid-template-columns",
            `repeat(${this.sumSize * 5 + 1}, 1fr)`
        );
        for (let i = this.sumSize; i <= this.sumSize * 6; i++) {
            const bar = document.createElement("div");
            const percent = (this.frequency[i] / this.frequency.max_freq) * 100;

            bar.classList.add("bar");
            if (this.sumSize <= 10) bar.innerText = this.frequency[i];
            bar.style.setProperty(
                "background",
                `linear-gradient(1turn, color-mix(in oklab, dodgerblue ${
                    ((i - this.sumSize) / (this.sumSize * 5)) * 100
                }%, turquoise) ${percent}%, transparent ${percent}%)`
            );
            barPlot.appendChild(bar);
        }
        if (this.sumSize <= 10)
            for (let i = this.sumSize; i <= this.sumSize * 6; i++) {
                const num = document.createElement("p");
                num.classList.add("bar_num");
                num.innerText = i;
                barPlot.appendChild(num);
            }
    }
    updateSumSize(val) {
        this.sumSize = val;
        // rollIcons.innerHTML = "";
        // for (let i = 0; i < this.sumSize; i++) {
        //     rollIcons.innerHTML += diceIcon("");
        // }
        measuring_value.useField(
            new Field(val, val * 6, Math.floor((7 * val) / 2), 1)
        );

        this.reset();
    }
    updateOdds() {
        this.oddSum = this.probObjs.reduce((acc, n) => acc + n.getOdds(), 0);
        this.probObjs.forEach((p) => p.slider.updateOutputs());
        this.probs = this.probObjs.map((p) => p.getOdds() / this.oddSum);
        const cutoffs = [0];
        {
            let cutoff = 0;
            for (const p of this.probs) {
                cutoff += p;
                cutoffs.push(cutoff);
            }
        }
        this.intervals = [...Array(6)].map((_, i) => [
            cutoffs[i],
            cutoffs[i + 1],
        ]);
    }
    resetFrequency() {
        this.frequency = { n: 0, max_freq: 0, max: 0 };
        for (let i = this.sumSize; i <= this.sumSize * 6; i++) {
            this.frequency[i] = 0;
        }
    }
    resetData() {
        this.data = {
            mean: { value: 0, sum: 0 },
            variance: { value: 0, sum: 0 },
        };
    }

    rollSingle() {
        const rand = Math.random();
        for (let i = 0; i < 6; i++) {
            if (this.intervals[i][0] <= rand && rand < this.intervals[i][1])
                return i + 1;
        }
        return 0;
    }
    roll(n = 1) {
        // rollIcons.innerHTML = "";
        for (let m = 0; m < n; m++) {
            let sum = 0;
            for (let i = 0; i < this.sumSize; i++) {
                const roll = this.rollSingle();
                sum += roll;
                // if (m === n - 1) {
                //     rollIcons.innerHTML += diceIcon(roll);
                // }
            }
            this.data.mean.sum += sum;
            this.data.variance.sum += sum * sum;
            const f = ++this.frequency[sum];
            if (f > this.frequency.max_freq) {
                this.frequency.max_freq = f;
                this.frequency.max = sum;
            }
        }
        this.frequency.n += n;
        nOutput.update(this.frequency.n);

        this.data.mean.value = this.data.mean.sum / this.frequency.n;
        mOutput.update(this.data.mean.value);

        this.data.variance.value =
            (this.data.variance.sum -
                this.frequency.n *
                    this.data.mean.value *
                    this.data.mean.value) /
            (this.frequency.n - 1);
        sOutput.update(Math.sqrt(this.data.variance.value));

        measuring_value.useField(
            new Field(this.sumSize, this.sumSize * 6, this.frequency.max, 1)
        );
        measuring_value.update();
        approx.update(this.approx(measuring_value.value()));
        this.updateBars();
    }

    approx(n) {
        const s2 = this.data.variance.value;
        const m = this.data.mean.value;
        const p = this.frequency[n] / this.frequency.n;

        const a = 1 / (2 * s2);
        const b = 1 / p;
        const c = n - m;
        const d = -(c * c) / (2 * s2);
        const e = b * Math.exp(d);
        const f = e * e;
        return a * f;
    }
}
const sim = new Simulation();

function diceIcon(str) {
    return `<div class="dice_icon">${str}</div>`;
}

// const rollIcons = document.getElementById("roll_icons");
const barPlot = document.getElementById("bar_plot");
const probabilities = document.getElementById("probabilities");
const sumSize = new Slider(
    "sum_size_slide",
    new Field(2, 64, sim.sumSize, 1),
    (self) => {
        sim.updateSumSize(self.value());
    },
    [new Output("sum_size_output", Output.text, () => `${sim.sumSize}`)],
    (self) => {}
);

const reset = new Button("reset", () => {
    sim.reset();
});
const play = new Button("play", () => {
    sim.toggle();
});
const inc = new Button("roll_increase", () => {
    sim.changeRollSize(sim.rollSize * 2);
});
const dec = new Button("roll_decrease", () => {
    sim.changeRollSize(sim.rollSize * 0.5);
});
const rollOutput = new Output(
    "roll_output",
    Output.text,
    (val) => `${val} rolls`
);

const formatter = Intl.NumberFormat("en-US", { notation: "compact" });

const nOutput = new Output(
    "n_output",
    Output.html,
    (val) => `<i>n</i> = ${formatter.format(val)}`
);
const mOutput = new Output(
    "m_output",
    Output.html,
    (val) => `<i>μ</i> = ${Math.round(val * 1000) / 1000}`
);
const sOutput = new Output(
    "s_output",
    Output.html,
    (val) => `<i>σ</i> = ${isFinite(val) ? Math.round(val * 1000) / 1000 : 0}`
);

const measuring_value = new Slider(
    "x_slide",
    new Field(0, 1, 0, 1),
    (self) => {},
    [
        new Output("x", Output.html, (val) => `<i>x</i> = ${val}`),
        new Output("prob_x", Output.latex, (val) => {
            const n = sim.frequency[val] / sim.frequency.n;
            return `p(x)=${isFinite(n) ? n : 0}`;
        }),
    ],
    (self) => {
        approx.update(sim.approx(self.value()));
    }
);
const approx = new Output("approx", Output.latex, (val) => {
    error.update(
        isFinite(val) ? Math.abs(((val - Math.PI) / Math.PI) * 100) : 0
    );
    return `\\pi\\approx${isFinite(val) ? val : 0}`;
});
const error = new Output("error", Output.text, (val) => `${val}% error`);

// window.addEventListener("keydown", (event) => {
//     if (event.code === "Space") sim.roll(sim.rollSize);
// });

function main() {
    sim.init();
}

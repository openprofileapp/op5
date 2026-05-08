import { execa } from "execa";
import cliProgress from "cli-progress";
import chalk from "chalk";
import { Stopwatch } from "@sapphire/stopwatch";
import { config } from "../../app.config.js";

const sw = new Stopwatch();

type Step = {
    name: string;
    cmd: string;
    args?: string[];
};

const steps: Step[] = [
    { name: "Preparing workspace...", cmd: "npm", args: ["run", "clean"] },
    { name: "Syncing config...", cmd: "npm", args: ["run", "sync"] },
    { name: "Translating locales...", cmd: "npm", args: ["run", "translate"] },
    { name: "Compiling Typescript...", cmd: "tsc" },
    { name: "Building frontend...", cmd: "vite", args: ["build", "--config", "vite.config.web.ts"] },
    { name: "Minifying code...", cmd: "npm", args: ["run", "minify"] },

    ...[
        "copy:ssl",
        "copy:public",
        "copy:package",
        "copy:env",
        "copy:ecosystem",
    ].map(cmd => ({
        name: "Copying files...",
        cmd: "npm",
        args: ["run", cmd],
    }))
];

let isDone = false;

const bar = new cliProgress.SingleBar({
    hideCursor: true,
    format: (options, params, payload) => {
        const total = params.total ?? steps.length;
        const current = params.value ?? 0;

        const width = 42;
        const progress = Math.round((current / total) * width);
        const percent = Math.round((current / total) * 100);

        const color = isDone ? chalk.green : chalk.blueBright;

        const filled = color("━".repeat(progress));
        const empty = (isDone ? chalk.green : chalk.white)(
            "━".repeat(width - progress)
        );

        const title = color(
            config.useNerdFonts
                ? isDone ? "" : ""
                : isDone ? "[BUILT]" : "[BUILDING]"
        );

        const stepText = color(payload.step);
        const percentText = color(`(${percent}%)`);

        return `${title} ${filled}${empty} ${percentText} ${stepText}`;
    },
});

sw.start();

bar.start(steps.length, 0, { step: "Starting..." });

for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    bar.update(i, { step: step.name });

    try {
        await execa(step.cmd, step.args ?? [], {
            stdio: "pipe",
        });
    } catch (error) {
        bar.stop();
        console.error(
            `${config.useNerdFonts ? " " : ""}Failed at step: ${step.name}`
        );
        throw error;
    }
}

sw.stop();

isDone = true;

bar.update(steps.length, {
    step: `${config.useNerdFonts ? " " : ""}Took ${sw.toString()}`,
});

bar.stop();
#!/usr/bin/env node

import * as program from "commander";
import * as inquirer from "inquirer";

import { cloneBoilerplate } from "./commands/cloneBoilerplate";
import { login } from "./commands/login";
import { publish, publishUpdate } from "./commands/publish";
import { getCategoryNames, logError, logInfo } from "./utils";

program
    .version("1.0.0", "-v, --version")
    .usage(`[options] command`)
    .option("-V, --verbose", "Display verbose output")
    .description("Command line interface for the Volusion Element ecosystem");

export const isVerbose =
    process.argv.includes("-V") || process.argv.includes("--verbose");

program
    .command("login")
    .description("Log in using your Volusion credentials")
    .action(() => {
        inquirer
            .prompt([
                {
                    message: "Enter your username",
                    name: "username",
                    type: "input",
                },
                {
                    message: "Enter your password",
                    name: "password",
                    type: "password",
                },
            ])
            .then((val: any) => {
                const { username, password } = val;
                login(username, password);
            })
            .catch(logError);
    });

program
    .command("new <name>")
    .description("Create the block boilerplate")
    .action((...args) => {
        cloneBoilerplate(args);
    });

program
    .command("publish")
    .description(
        `Publish a block to the Block Theme Registry
                    [-n, --name NAME] [-c, --category CATEGORY]
                    Suggestion: Keep your screenshots under 500 kb
                                and aim for more of a rectangle than
                                a square.`
    )
    .option(
        "-n, --name [name]",
        "Name for publishing (defaults to directory name)"
    )
    .option(
        "-c, --category [category]",
        "The Category name that best fits this block"
    )
    .action(async ({ name, category }) => {
        const nameInput = typeof name !== "function" ? name : null;
        const categories = await getCategoryNames();

        if (category) {
            publish(nameInput, category, categories);
        } else {
            inquirer
                .prompt({
                    choices: categories,
                    message: "Select the Category that best fits this block:",
                    name: "categoryFromList",
                    type: "list",
                })
                .then((val: any) => {
                    const { categoryFromList } = val;
                    publish(nameInput, categoryFromList);
                });
        }
    });

program
    .command("update")
    .description(
        `Update your existing block in the Block Theme Registry
                    [-p, --toggle-public] An optional flag to toggle
                    whether or not the block is viewable by members
                    outside of your organization.`
    )
    .option(
        "-p, --toggle-public [togglePublic]",
        "Toggle whether or not the block is public."
    )
    .action(({ togglePublic }: any) => {
        publishUpdate(togglePublic);
    });

program.on("command:*", () => {
    logError(`\nInvalid command: ${program.args.join(" ")}`);
    logInfo("\nSee --help for a list of available commands.");
    process.exit(1);
});

if (
    process.env.NODE_ENV !== "test" &&
    (process.argv.length <= 2 || (isVerbose && process.argv.length === 3))
) {
    program.outputHelp();
} else {
    program.parse(process.argv);
}

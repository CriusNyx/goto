import { program, Command } from "@commander-js/extra-typings";
import { Config } from "./config.ts";
import _ from "lodash";
import chalk from "chalk";

const outputFilePath = "/tmp/goto.output";

/** Generate an error when the app failed to resolve a path. */
function generateFailedToResolveError(pathInput: string) {
  const base = pathInput.split("/").shift();

  return (
    `No entry for ${base} exists in the goto table.\n` +
    `Make sure to add it with ${chalk.reset.blue(`goto add ${base} [path]`)}`
  );
}

/** Write to the output file. Pass in null to clear the output file. */
function writeOutput(path?: string) {
  Deno.writeTextFileSync(outputFilePath, path ?? "");
}

// Clear output before running the program.
// This ensures there is no output if the command isn't a goto [path] command.
writeOutput();

type SupportedShells = "fish" | "bash";

/** Print environment variables generated from the goto table. */
function printEnvVariables(shell: SupportedShells) {
  const config = Config.load();
  switch (shell) {
    case "fish":
      for (const [key, value] of Object.entries(config.directories ?? {})) {
        console.log(`set -gx ${key.toUpperCase()} "${value}"`);
      }
      break;
    case "bash":
      for (const [key, value] of Object.entries(config.directories ?? {})) {
        console.log(`export ${key.toUpperCase()}="${value}"`);
      }
      break;
    default:
      "Shell not supported";
  }
}

/** Print command completions for goto. */
function printCompletions(shell: SupportedShells) {
  const config = Config.load();
  switch (shell) {
    case "fish":
      console.log(
        [
          "add",
          "remove",
          "list",
          ...Object.keys(config.directories ?? {}),
        ].join?.(" "),
      );
      break;
  }
}

const actions = {
  /** Default main function */
  main(...[path, opts]: CommandArgs<typeof defaultCommand>) {
    if (opts.environmentVariables) {
      printEnvVariables(opts.environmentVariables as SupportedShells);
      return;
    }
    if (opts.completions) {
      printCompletions(opts.completions as SupportedShells);
      return;
    }

    if (!path) {
      throw "Path must be defined";
    }
    const resolved = Config.resolvePath(path).expect(
      generateFailedToResolveError(path),
    );
    console.log(resolved);
    writeOutput(resolved);
  },
  /** Main function for the add command. */
  add(...[name, path]: CommandArgs<typeof addCommand>) {
    if (!path) {
      path = Deno.cwd();
    }
    Config.modify((config) => {
      _.set(config, `directories.${name}`, path);
    });
  },
  /** Default function for the remove command. */
  remove(...[name]: CommandArgs<typeof removeCommand>) {
    Config.modify((config) => {
      if (config.directories && name in config.directories) {
        delete config.directories[name];
      } else {
        throw `${name} is not registered with goto.`;
      }
    });
  },
  /** Default function for the list command. */
  list() {
    const config = Config.load();

    const entries = _.sortBy(
      Object.entries(config?.directories ?? {}),
      ([_key, value]) => value,
    );

    const padAmount = _.max(entries.map(([key]) => key?.length)) ?? 0;

    for (const [key, value] of entries) {
      const pad = Math.max(padAmount - key.length, 0);
      console.log(
        `${chalk.bold.green(key)}${" ".repeat(pad)}  ${chalk.green(value)}`,
      );
    }
  },
} as const;

// Given a command determine the arguments for that command.
type CommandArgs<CommandType extends Command<any, any, any>> =
  CommandType extends Command<infer Args, infer Opts> ? [...Args, Opts] : [];

// Configure the add command.
const addCommand = program
  .command("add <name> [path]")
  .description("Add or replace a path with goto.")
  .action(actions.add);

// Configure the remove command.
const removeCommand = program
  .command("remove <name>")
  .description("Remove a path from goto.")
  .action(actions.remove);

// Configure the list command.
program
  .command("list")
  .description("List all paths registered with goto.")
  .action(actions.list);

// Configure the default command.
const defaultCommand = program
  .name("goto")
  .description(
    "Utility program register predefined paths and jump around your operating system.",
  )
  .option(
    "--environment-variables [shell]",
    "Print fish command to register environment variables.",
  )
  .option(
    "--completions [shell]",
    "Print completions to register with fish config.",
  )
  .argument("[path]", "Path to goto, starting with an entry in the goto table.")
  .action(actions.main);

// Run the program.
try {
  program.parse();
} catch (error) {
  if (typeof error == "string") {
    console.error(chalk.bold.red(error));
  } else if (error instanceof Error) {
    console.error(chalk.bold.red(error.message));
  } else {
    console.error(error);
  }
  Deno.exit(1);
}

import { program, Command } from "@commander-js/extra-typings";
import { Config } from "./config.ts";
import _ from "lodash";
import chalk from "chalk";

const outputFilePath = "/tmp/goto.output";

function generateFailedToResolveError(pathInput: string) {
  const base = pathInput.split("/").shift();

  return (
    `No entry for ${base} exists in the goto table.\n` +
    `Make sure to add it with ${chalk.reset.blue(`goto add ${base} [path]`)}`
  );
}

function writeOutput(path?: string) {
  Deno.writeTextFileSync(outputFilePath, path ?? "");
}

// Clear output before running the program.
// This ensures there is no output if the command isn't a goto [path] command.
writeOutput();

function printEnvTable() {
  const config = Config.load();
  for (const [key, value] of Object.entries(config.directories ?? {})) {
    console.log(`set ${key.toUpperCase()} "${value}"`);
  }
}

function printCompletions() {
  console.log(
    `complete -c goto -a "${Object.keys(Config.load().directories ?? {}).join(" ")}"`,
  );
}

const actions = {
  main(...[path, opts]: CommandArgs<typeof defaultCommand>) {
    if (opts.environmentVariables) {
      printEnvTable();
      return;
    }
    if (opts.completions) {
      printCompletions();
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
  add(...[name, path]: CommandArgs<typeof addCommand>) {
    if (!path) {
      path = Deno.cwd();
    }
    Config.modify((config) => {
      _.set(config, `directories.${name}`, path);
    });
  },
  remove(...[name]: CommandArgs<typeof removeCommand>) {
    Config.modify((config) => {
      if (config.directories && name in config.directories) {
        delete config.directories[name];
      } else {
        throw `${name} is not registered with goto.`;
      }
    });
  },
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

type CommandArgs<CommandType extends Command<any, any, any>> =
  CommandType extends Command<infer Args, infer Opts> ? [...Args, Opts] : [];

const addCommand = program
  .command("add <name> [path]")
  .description("Add or replace a path with goto.")
  .action(actions.add);

const removeCommand = program
  .command("remove <name>")
  .description("Remove a path from goto.")
  .action(actions.remove);

program
  .command("list")
  .description("List all paths registered with goto.")
  .action(actions.list);

const defaultCommand = program
  .name("goto")
  .description(
    "Utility program register predefined paths and jump around your operating system.",
  )
  .option(
    "--environment-variables",
    "Print fish command to register environment variables.",
  )
  .option("--completions", "Print completions to register with fish config.")
  .argument("[path]", "Path to goto, starting with an entry in the goto table.")
  .action(actions.main);

addCommand.processedArgs;

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

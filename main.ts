import { program, Command } from "@commander-js/extra-typings";
import { Config } from "./config.ts";
import _ from "lodash";

const actions = {
  add(...[name, path]: CommandArgs<typeof addCommand>) {
    Config.modify((config) => {
      _.set(config, `directories.${name}`, path);
    });
  },
  list() {},
} as const;

type CommandArgs<CommandType extends Command<any, any, any>> =
  CommandType extends Command<infer Args, infer Opts> ? [...Args, Opts] : [];

const addCommand = program.command("add <name> <path>").action(actions.add);

const listCommand = program.command("list").action(actions.list);

addCommand.processedArgs;

const cli = program.addCommand(addCommand);

cli.parse();

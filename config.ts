import * as Path from "@std/path";
import * as FS from "@std/fs";
import _ from "lodash";
import { Option, Some, None } from "ts-results";

const gotoConfigName = ".gotoConfig.json";

export interface ConfigFile {
  directories?: Partial<Record<string, string>>;
}

function getConfigFolder() {
  return (
    Deno.env.get("XDG_CONFIG_HOME") ??
    Path.join(Deno.env.get("HOME") ?? "", "/.config")
  );
}

export const Config = {
  getFilePath() {
    return Path.join(getConfigFolder(), gotoConfigName);
  },
  load(): ConfigFile {
    const configFilePath = this.getFilePath();
    if (FS.existsSync(configFilePath)) {
      const configFileText = Deno.readTextFileSync(configFilePath);
      return JSON.parse(configFileText);
    }
    return {};
  },
  save(configFile: ConfigFile) {
    Deno.writeTextFileSync(
      this.getFilePath(),
      JSON.stringify(configFile, undefined, 2),
    );
  },
  modify(mutation: (config: ConfigFile) => ConfigFile | void) {
    const oldConfig = this.load();
    const newConfig = mutation(oldConfig);
    if (newConfig) {
      this.save(newConfig);
    }
    this.save(oldConfig);
  },
  resolveBasePath(base: string): Option<string> {
    const config = this.load();
    const result = _.get(config?.directories, base);
    if (!!result) {
      return Some(result);
    }
    return None;
  },
  resolvePath(path: string): Option<string> {
    const [base, ...rest] = path.split("/");
    return this.resolveBasePath(base).map((basePath) =>
      Path.join(basePath, ...rest),
    );
  },
} as const;

import { getConfigHome } from "platform-folders";
import * as Path from "@std/path";
import * as FS from "@std/fs";
import { fileURLToPath } from "node:url";
import { monitorEventLoopDelay } from "node:perf_hooks";

const gotoConfigName = ".gotoConfig.json";

export interface ConfigFile {
  directories?: Partial<Record<string, string>>;
}

export const Config = {
  getFilePath() {
    return Path.join(getConfigHome(), gotoConfigName);
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
} as const;

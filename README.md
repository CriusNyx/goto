# GOTO

A utility program for managing a goto table to jump around your os.

Also generates environment variables that you can use for scripts.

Goto current supports bash and fish. It does not currently support completions
in bash.

## Installing.

Run `deno run build` and install `/bin/goto-bin` in your system.

Copy the contents of corresponding shell config file to your shell config.

- `goto.fish` for fish shell.
- `goto.sh` for bash shell.

## How to use

`goto add <name> [path]`. Add the specified path to goto. If no path is
specified it will add the current path. ex: `goto add projects ~/Projects`

`goto remove <name>`. Remove the path from goto. ex: `goto remove projects`

`goto list`. List all paths registered with goto.

`goto <name>`. Goto the specified path. ex: `goto projects`

`goto <name>/[subpath]` Goto the specified subpath.: ex:
`goto projects/MyCoolProject`

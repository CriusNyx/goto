# GOTO

A utility program for managing a goto table to jump around your os.

Also generates environment variables that you can use for scripts.

## Adding a path

`goto add <name> [path]`. Add the specified path to goto. If no path is
specified it will add the current path.

`goto remove <name>`. Remove the path from goto.

`goto list`. List all paths registered with goto.

`goto <name>`. Goto the specified path.

`goto <name>/[subpath]` Goto the specified subpath.

# host-colors

A Claude Code mod that colors the bar above the prompt, the footer mode row and the status line by the machine's hostname. Each host gets its own color, so you can tell sessions apart at a glance.

## Install

```
/plugin install host-colors --marketplace sshamilton/claude-mods
```

Answer `y` to add the marketplace, then pick the user scope.

## Colors

Edit the `HOST_COLORS` table at the top of `hooks/register.tsx`. Keys are lower-case hostnames. Values are terminal color names or hex strings. A host not in the table gets a stable color hashed from its name.

## Develop

```
claude plugin validate .
claude plugin test .
claude --plugin-dir "$PWD"
```

---
title: Clear terminal history
description: The commands to clear your history on Linux, macOS and Windows.
lang: en
translationKey: clear-terminal-history
category: Shell
os:
  linux: true
  macos: true
  windows: true
testedOn: ['Ubuntu [version] (WSL)', 'macOS 27']
verifiedAt: 2026-11-15
destructive: true
tags: ['bash', 'zsh', 'powershell', 'wsl', 'history']
---

The command depends on your shell[^shell]:

- **[bash](#with-bash-linux-wsl)** (Linux, WSL)[^wsl]: history in `~/.bash_history`.
- **[zsh](#with-zsh-macos)** (macOS): history in `~/.zsh_history` and `~/.zsh_sessions`.
- **[PowerShell](#with-powershell-windows)** (Windows): history in the PSReadLine[^psreadline] file.

Either way, history lives in two places: **in memory** for the current session, and in that **file**. To really clear it, you have to empty both.

## With bash (Linux, WSL)

```bash
$ history -c && history -w
```

- `history -c` (*clear*) clears the history in memory, the current session’s. The file is left untouched.
- `history -w` (*write*) writes the history in memory to `~/.bash_history`, replacing everything in it. Since memory was just cleared, the file ends up empty.

Without `-w`, the old file would stay intact: on Ubuntu[^histappend], bash only appends the new commands to it when the terminal closes.

## Sample output

`history` lists the saved commands, numbered from oldest to newest:

```console title="terminal"
$ history
  495  cd ~/projects/api
  496  git pull
  497  ssh deploy@my-server.com
  498  export API_TOKEN=[…]
  499  git status
  500  history
```

After cleaning up, only the `history` command you just typed is left:

```console title="terminal"
$ history -c && history -w
$ history
    1  history
```

## Useful variants

Delete the file, then clear memory:

```bash
$ rm -f ~/.bash_history && history -c
```

Clear and close the terminal without saving anything:

```bash
$ history -c && exit
```

Delete only the previous command (bash 5.1 and later, Ubuntu 22.04 and later). `-1` is the `history -d` command itself, hence `-2`:

```bash
$ history -d -2 && history -w
```

Delete a range of lines:

```bash
$ history -d 495-499 && history -w
```

## Delete a single line

First find the line number:

```bash vars="keyword=token"
$ history | grep <keyword>
```

Then delete it and rewrite the file:

```bash vars="number=498"
$ history -d <number> && history -w
```

## With zsh (macOS)

zsh is the default shell on macOS. It has no `history -c`: delete the history files, then close the window without writing anything back.

```zsh
$ rm -rf ~/.zsh_history ~/.zsh_sessions && unset HISTFILE && exit
```

- `rm -rf ~/.zsh_history ~/.zsh_sessions` deletes the shared history and the folder where the macOS Terminal keeps a history per window. The folder is created again next time.
- `unset HISTFILE` stops the session from writing its history back when it closes.
- `exit` closes the window, which also clears the history in memory.

## With PowerShell (Windows)

In PowerShell, `Clear-History` only clears the session history. The commands you get back with the up arrow are kept by PSReadLine in a separate file:

```powershell
Clear-History
Remove-Item (Get-PSReadLineOption).HistorySavePath
```

To stop saving anything for the current session:

```powershell
Set-PSReadLineOption -HistorySaveStyle SaveNothing
```

## Good to know

- **Other open terminals**: each bash or zsh session keeps its history in memory and appends it to the file when it closes. Close the other tabs or windows (WSL, Terminal) before cleaning up, or the history comes back.
- **Commands typed after cleaning up**: they are saved as usual when the terminal closes. To avoid that, finish with `history -c && exit`.
- **Commands run with `sudo`**: `sudo command` is saved in **your** history, not root’s. Only `sudo -i` or `sudo su` sessions write to `/root/.bash_history`. To clear it:

  ```bash
  $ sudo truncate -s 0 /root/.bash_history
  ```

- **Not saving a command**: on Ubuntu, the default `~/.bashrc` already sets `HISTCONTROL=ignoreboth`[^ignoreboth]. Prefix a command with a space and it is not saved, which is handy for a command that contains a token or a password. On other systems, add the line to `~/.bashrc`:

  ```bash title="~/.bashrc"
  export HISTCONTROL=ignoreboth
  ```

- **No undo**: there is no trash. Once the file is overwritten, the history is gone.

[^shell]: The **shell** is the program that reads the commands typed in the terminal and runs them. The terminal is just the window; bash, zsh and PowerShell are shells. The same terminal can run any of them.

[^wsl]: *Windows Subsystem for Linux*: runs a Linux distribution (Ubuntu…) inside Windows. You use bash there, not PowerShell.

[^psreadline]: The PowerShell module that handles typing: up arrow, completion, colouring. It is PSReadLine, not PowerShell itself, that saves the history to a file.

[^histappend]: Ubuntu’s default `~/.bashrc` turns on the `histappend` option: when the terminal closes, bash appends its commands to the file. Without it, bash rewrites the whole file with the history in memory.

[^ignoreboth]: `ignoreboth` combines `ignorespace` (skip commands that start with a space) and `ignoredups` (skip a command identical to the previous one).

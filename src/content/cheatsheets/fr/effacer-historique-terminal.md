---
title: Effacer l’historique du terminal
description: Les commandes pour effacer l’historique sous Linux, macOS et Windows.
lang: fr
translationKey: clear-terminal-history
category: Shell
os:
  linux: true
  macos: true
  windows: true
testedOn: ['Ubuntu 26.04 (WSL)', 'macOS 27']
verifiedAt: 2026-11-15
destructive: true
tags: ['bash', 'zsh', 'powershell', 'wsl', 'history']
---

La commande dépend du shell[^shell] :

- **[bash](#avec-bash-linux-wsl)** (Linux, WSL)[^wsl] : historique dans `~/.bash_history`.
- **[zsh](#avec-zsh-macos)** (macOS) : historique dans `~/.zsh_history` et `~/.zsh_sessions`.
- **[PowerShell](#avec-powershell-windows)** (Windows) : historique dans le fichier de PSReadLine[^psreadline].

Dans tous les cas, l’historique existe à deux endroits : **en mémoire** pour la session en cours, et dans ce **fichier**. Pour l’effacer vraiment, il faut vider les deux.

## Avec bash (Linux, WSL)

```bash
$ history -c && history -w
```

- `history -c` (*clear*) vide l’historique en mémoire, celui de la session en cours. Le fichier n’est pas touché.
- `history -w` (*write*) écrit l’historique en mémoire dans `~/.bash_history`, en remplaçant tout son contenu. Comme la mémoire vient d’être vidée, le fichier se retrouve vide.

Sans `-w`, l’ancien fichier resterait intact : sur Ubuntu[^histappend], bash ne fait qu’y ajouter les nouvelles commandes à la fermeture du terminal.

## Exemple de sortie

`history` liste les commandes enregistrées, numérotées de la plus ancienne à la plus récente :

```console title="terminal"
$ history
  495  cd ~/projets/api
  496  git pull
  497  ssh deploy@mon-serveur.fr
  498  export API_TOKEN=[…]
  499  git status
  500  history
```

Après le nettoyage, il ne reste que la commande `history` qu’on vient de taper :

```console title="terminal"
$ history -c && history -w
$ history
    1  history
```

## Variantes utiles

Supprimer le fichier, puis vider la mémoire :

```bash
$ rm -f ~/.bash_history && history -c
```

Vider et fermer le terminal sans rien sauvegarder :

```bash
$ history -c && exit
```

Effacer la commande précédente seulement (bash 5.1 et plus, Ubuntu 22.04 et plus). `-1` désigne la commande `history -d` elle-même, d’où le `-2` :

```bash
$ history -d -2 && history -w
```

Effacer une plage de lignes :

```bash
$ history -d 495-499 && history -w
```

## Supprimer une seule ligne

Repérer d’abord le numéro de la ligne :

```bash vars="motclé=token"
$ history | grep <motclé>
```

Puis la supprimer et réécrire le fichier :

```bash vars="numéro=498"
$ history -d <numéro> && history -w
```

## Avec zsh (macOS)

zsh est le shell par défaut sur macOS. Il n’a pas de `history -c` : on supprime les fichiers d’historique, puis on ferme la fenêtre sans rien réécrire.

```zsh
$ rm -rf ~/.zsh_history ~/.zsh_sessions && unset HISTFILE && exit
```

- `rm -rf ~/.zsh_history ~/.zsh_sessions` supprime l’historique commun et le dossier où le Terminal de macOS garde un historique par fenêtre. Ce dossier est recréé à la prochaine ouverture.
- `unset HISTFILE` empêche la session de réécrire son historique en se fermant.
- `exit` ferme la fenêtre, ce qui vide aussi l’historique en mémoire.

## Avec PowerShell (Windows)

Dans PowerShell, `Clear-History` ne vide que l’historique de la session. Les commandes retrouvées avec la flèche haut sont gardées par PSReadLine dans un fichier à part :

```powershell
Clear-History
Remove-Item (Get-PSReadLineOption).HistorySavePath
```

Pour ne plus rien enregistrer pendant la session en cours :

```powershell
Set-PSReadLineOption -HistorySaveStyle SaveNothing
```

## Bon à savoir

- **Autres terminaux ouverts** : chaque session bash ou zsh garde son historique en mémoire et l’ajoute au fichier quand elle se ferme. Ferme les autres onglets ou fenêtres (WSL, Terminal) avant de nettoyer, sinon l’historique revient.
- **Commandes tapées après le nettoyage** : elles sont enregistrées normalement à la fermeture du terminal. Pour les éviter, termine par `history -c && exit`.
- **Commandes avec `sudo`** : `sudo commande` est enregistrée dans **ton** historique, pas dans celui de root. Seules les sessions `sudo -i` ou `sudo su` écrivent dans `/root/.bash_history`. Pour le vider :

  ```bash
  $ sudo truncate -s 0 /root/.bash_history
  ```

- **Ne pas enregistrer une commande** : sur Ubuntu, le `~/.bashrc` fourni par défaut contient déjà `HISTCONTROL=ignoreboth`[^ignoreboth]. Il suffit de faire précéder la commande d’un espace pour qu’elle ne soit pas enregistrée, ce qui est pratique pour une commande qui contient un token ou un mot de passe. Sur d’autres systèmes, ajoute la ligne dans `~/.bashrc` :

  ```bash title="~/.bashrc"
  export HISTCONTROL=ignoreboth
  ```

- **Irréversible** : aucune corbeille. Une fois le fichier écrasé, l’historique est perdu.

[^shell]: Le **shell** est le programme qui lit les commandes tapées dans le terminal et les exécute. Le terminal n’est que la fenêtre ; bash, zsh et PowerShell sont des shells. Un même terminal peut lancer l’un ou l’autre.

[^wsl]: *Windows Subsystem for Linux* : permet de faire tourner une distribution Linux (Ubuntu…) dans Windows. On y utilise bash, pas PowerShell.

[^psreadline]: Le module de PowerShell qui gère la saisie : flèche haut, complétion, coloration. C’est lui, et non PowerShell, qui enregistre l’historique dans un fichier.

[^histappend]: Le `~/.bashrc` fourni par Ubuntu active l’option `histappend` : à la fermeture, bash ajoute ses commandes au fichier. Sans cette option, il réécrit le fichier entier avec l’historique en mémoire.

[^ignoreboth]: `ignoreboth` combine `ignorespace` (ignorer les commandes précédées d’une espace) et `ignoredups` (ignorer une commande identique à la précédente).

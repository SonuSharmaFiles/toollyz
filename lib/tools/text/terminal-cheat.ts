// Terminal Cheat Sheet engine. Curated reference of ~80 high-traffic shell
// commands covering: file ops, text processing, networking, git, system,
// process management and package managers. Each entry has a one-line
// description and a tested example.
//
// Pure data export — the component renders it with search + category filter.

export type Shell = "Bash/Zsh" | "Git" | "macOS" | "Linux" | "Docker" | "Network";

export interface CheatEntry {
  id: string;
  command: string;
  description: string;
  example: string;
  shell: Shell;
  tags: string[];
}

export const CHEATS: CheatEntry[] = [
  // ── Files & directories ────────────────────────────────────────────────
  { id: "ls", command: "ls -lah", description: "List files with sizes, hidden, human-readable.", example: "ls -lah ~/Downloads", shell: "Bash/Zsh", tags: ["file", "list"] },
  { id: "cd", command: "cd -", description: "Switch back to the previous directory.", example: "cd /tmp && cd -", shell: "Bash/Zsh", tags: ["dir", "navigate"] },
  { id: "pwd", command: "pwd", description: "Print the current working directory.", example: "pwd", shell: "Bash/Zsh", tags: ["dir"] },
  { id: "mkdir", command: "mkdir -p path/to/dir", description: "Make a directory, including parents.", example: "mkdir -p ~/projects/2026/q2", shell: "Bash/Zsh", tags: ["dir", "create"] },
  { id: "cp", command: "cp -R src dest", description: "Recursive copy of a directory tree.", example: "cp -R ./build ~/backup-2026-05", shell: "Bash/Zsh", tags: ["file", "copy"] },
  { id: "mv", command: "mv old new", description: "Move or rename a file or directory.", example: "mv draft.md final.md", shell: "Bash/Zsh", tags: ["file", "rename"] },
  { id: "rm", command: "rm -rf dir/", description: "Recursive force delete — be very careful.", example: "rm -rf .next", shell: "Bash/Zsh", tags: ["file", "delete"] },
  { id: "ln", command: "ln -s target link", description: "Create a symbolic link.", example: "ln -s ~/dotfiles/.zshrc ~/.zshrc", shell: "Bash/Zsh", tags: ["file", "link"] },
  { id: "touch", command: "touch file.txt", description: "Create an empty file or update its mtime.", example: "touch .gitkeep", shell: "Bash/Zsh", tags: ["file", "create"] },
  { id: "find", command: "find . -name '*.log'", description: "Find files by name pattern.", example: "find ~/projects -name 'package.json' -not -path '*/node_modules/*'", shell: "Bash/Zsh", tags: ["search", "file"] },
  { id: "du", command: "du -sh *", description: "Show top-level file/dir sizes.", example: "du -sh ~/Downloads/*", shell: "Bash/Zsh", tags: ["disk"] },
  { id: "df", command: "df -h", description: "Disk space per mounted filesystem.", example: "df -h", shell: "Bash/Zsh", tags: ["disk"] },
  { id: "tree", command: "tree -L 2", description: "Show directory tree to 2 levels.", example: "tree -L 2 src/", shell: "Bash/Zsh", tags: ["dir"] },

  // ── Text processing ──────────────────────────────────────────────────
  { id: "cat", command: "cat file", description: "Concatenate and print a file.", example: "cat package.json", shell: "Bash/Zsh", tags: ["text"] },
  { id: "head", command: "head -20 file", description: "First N lines of a file.", example: "head -20 README.md", shell: "Bash/Zsh", tags: ["text"] },
  { id: "tail", command: "tail -f log.txt", description: "Follow a log file in real time.", example: "tail -f ~/logs/app.log", shell: "Bash/Zsh", tags: ["text", "log"] },
  { id: "grep", command: "grep -rn 'TODO' src/", description: "Recursive search for a string with line numbers.", example: "grep -rn --include='*.ts' 'useState' src/", shell: "Bash/Zsh", tags: ["search", "text"] },
  { id: "sed", command: "sed -i 's/foo/bar/g' file", description: "In-place replace text across a file.", example: "sed -i.bak 's/localhost/127.0.0.1/g' .env", shell: "Bash/Zsh", tags: ["text", "edit"] },
  { id: "awk", command: "awk '{print $1}' file", description: "Print the first whitespace-separated column.", example: "ps aux | awk '{print $2}' # PIDs", shell: "Bash/Zsh", tags: ["text"] },
  { id: "sort", command: "sort file | uniq -c | sort -nr", description: "Sort lines, count unique, sort by frequency desc.", example: "cat access.log | awk '{print $1}' | sort | uniq -c | sort -nr", shell: "Bash/Zsh", tags: ["text", "sort"] },
  { id: "wc", command: "wc -l file", description: "Count lines in a file.", example: "find src -name '*.ts' | xargs wc -l", shell: "Bash/Zsh", tags: ["text", "count"] },
  { id: "tr", command: "tr 'a-z' 'A-Z'", description: "Translate characters — uppercase example.", example: "echo hello | tr 'a-z' 'A-Z'", shell: "Bash/Zsh", tags: ["text", "transform"] },
  { id: "cut", command: "cut -d',' -f2", description: "Extract a field by delimiter.", example: "cut -d',' -f2,4 data.csv", shell: "Bash/Zsh", tags: ["text"] },

  // ── Processes ────────────────────────────────────────────────────────
  { id: "ps", command: "ps aux | grep node", description: "List running processes filtered by name.", example: "ps aux | grep node", shell: "Bash/Zsh", tags: ["process"] },
  { id: "top", command: "htop", description: "Interactive process viewer (install htop).", example: "htop", shell: "Linux", tags: ["process", "monitor"] },
  { id: "kill", command: "kill -9 PID", description: "Force-kill a process by PID.", example: "kill -9 12345", shell: "Bash/Zsh", tags: ["process"] },
  { id: "lsof-port", command: "lsof -i :3000", description: "What is listening on a port?", example: "lsof -i :3000", shell: "Bash/Zsh", tags: ["network", "process"] },
  { id: "jobs", command: "jobs && fg %1", description: "List background jobs and bring %1 to foreground.", example: "jobs; fg %1", shell: "Bash/Zsh", tags: ["process"] },

  // ── Networking ───────────────────────────────────────────────────────
  { id: "curl", command: "curl -i https://example.com", description: "Show response headers and body.", example: "curl -i -H 'Accept: application/json' https://api.example.com", shell: "Network", tags: ["http"] },
  { id: "curl-post", command: "curl -X POST -d '{}' url", description: "POST JSON to a URL.", example: "curl -X POST -H 'Content-Type: application/json' -d '{\"k\":1}' https://api.example.com/items", shell: "Network", tags: ["http"] },
  { id: "wget", command: "wget url", description: "Download a file (resumable with -c).", example: "wget -c https://example.com/big.tar.gz", shell: "Network", tags: ["download"] },
  { id: "ping", command: "ping -c 4 host", description: "ICMP latency check.", example: "ping -c 4 1.1.1.1", shell: "Network", tags: ["latency"] },
  { id: "traceroute", command: "traceroute host", description: "Show network path to host.", example: "traceroute 8.8.8.8", shell: "Network", tags: ["network"] },
  { id: "dig", command: "dig +short example.com", description: "DNS lookup (short answer).", example: "dig +short toollyz.com", shell: "Network", tags: ["dns"] },
  { id: "ssh", command: "ssh user@host", description: "Connect via SSH.", example: "ssh -i ~/.ssh/id_ed25519 deploy@server", shell: "Network", tags: ["remote"] },
  { id: "scp", command: "scp file user@host:path", description: "Copy a file over SSH.", example: "scp ./build.tar.gz deploy@server:~/", shell: "Network", tags: ["remote", "copy"] },
  { id: "rsync", command: "rsync -av src/ user@host:dest/", description: "Sync directories (deletes are not propagated unless --delete).", example: "rsync -avh --progress build/ deploy@server:~/site/", shell: "Network", tags: ["sync", "remote"] },
  { id: "netstat", command: "ss -tunlp", description: "Modern netstat: TCP/UDP listening sockets with PID.", example: "ss -tunlp", shell: "Linux", tags: ["network"] },

  // ── Git ──────────────────────────────────────────────────────────────
  { id: "git-status", command: "git status -sb", description: "Compact status with branch info.", example: "git status -sb", shell: "Git", tags: ["status"] },
  { id: "git-log-oneline", command: "git log --oneline -20", description: "Compact 20-line history.", example: "git log --oneline --graph --decorate -20", shell: "Git", tags: ["log"] },
  { id: "git-stash", command: "git stash push -m 'wip'", description: "Stash uncommitted changes with a message.", example: "git stash push -u -m 'wip: refactor'", shell: "Git", tags: ["stash"] },
  { id: "git-amend", command: "git commit --amend --no-edit", description: "Amend the last commit without changing the message.", example: "git add . && git commit --amend --no-edit", shell: "Git", tags: ["commit"] },
  { id: "git-rebase", command: "git rebase -i HEAD~3", description: "Interactive rebase of the last 3 commits.", example: "git rebase -i HEAD~3", shell: "Git", tags: ["rebase"] },
  { id: "git-diff-stat", command: "git diff --stat", description: "Compact diff summary by file.", example: "git diff --stat main..feature", shell: "Git", tags: ["diff"] },
  { id: "git-clean", command: "git clean -fd", description: "Remove untracked files and directories.", example: "git clean -fd -n  # dry-run first", shell: "Git", tags: ["clean"] },
  { id: "git-reset-soft", command: "git reset --soft HEAD~1", description: "Undo last commit, keep changes staged.", example: "git reset --soft HEAD~1", shell: "Git", tags: ["reset"] },
  { id: "git-cherry-pick", command: "git cherry-pick SHA", description: "Apply a single commit from another branch.", example: "git cherry-pick a1b2c3d", shell: "Git", tags: ["pick"] },
  { id: "git-branch", command: "git branch -a", description: "List all branches including remote.", example: "git branch -a --sort=-committerdate | head", shell: "Git", tags: ["branch"] },
  { id: "git-remote", command: "git remote -v", description: "Show all configured remotes with URLs.", example: "git remote -v", shell: "Git", tags: ["remote"] },
  { id: "git-blame", command: "git blame file", description: "Show who last changed each line.", example: "git blame -L 100,150 src/index.ts", shell: "Git", tags: ["blame"] },
  { id: "git-bisect", command: "git bisect start", description: "Binary-search for the commit that broke something.", example: "git bisect start; git bisect bad; git bisect good v1.0.0", shell: "Git", tags: ["debug"] },

  // ── System / packages ────────────────────────────────────────────────
  { id: "apt", command: "sudo apt update && sudo apt install pkg", description: "Update package lists then install a package.", example: "sudo apt update && sudo apt install -y nodejs", shell: "Linux", tags: ["install"] },
  { id: "brew", command: "brew install pkg", description: "Install a Homebrew package on macOS.", example: "brew install jq", shell: "macOS", tags: ["install"] },
  { id: "brew-services", command: "brew services start pkg", description: "Run a brew package as a background service.", example: "brew services start postgresql@16", shell: "macOS", tags: ["service"] },
  { id: "systemctl", command: "sudo systemctl status nginx", description: "Inspect a systemd service.", example: "sudo systemctl restart nginx", shell: "Linux", tags: ["service"] },
  { id: "journalctl", command: "journalctl -u nginx -f", description: "Follow systemd logs for a unit.", example: "journalctl -u nginx -f --since '1 hour ago'", shell: "Linux", tags: ["log"] },
  { id: "uname", command: "uname -a", description: "Show kernel + architecture.", example: "uname -a", shell: "Linux", tags: ["info"] },
  { id: "uptime", command: "uptime", description: "Time since boot + load averages.", example: "uptime", shell: "Linux", tags: ["info"] },
  { id: "whoami", command: "whoami", description: "Print the effective user.", example: "whoami", shell: "Bash/Zsh", tags: ["info"] },

  // ── macOS specific ───────────────────────────────────────────────────
  { id: "pbcopy", command: "pbcopy < file", description: "Copy a file's contents to the clipboard.", example: "cat ~/.ssh/id_ed25519.pub | pbcopy", shell: "macOS", tags: ["clipboard"] },
  { id: "open", command: "open path", description: "Open file/dir/URL with the default app.", example: "open . && open https://toollyz.com", shell: "macOS", tags: ["open"] },
  { id: "mdfind", command: "mdfind 'kMDItemDisplayName == file.pdf'", description: "Spotlight search from the terminal.", example: "mdfind -name 'invoice.pdf'", shell: "macOS", tags: ["search"] },
  { id: "say", command: "say 'Hello'", description: "macOS text-to-speech.", example: "say 'Build complete' && afplay /System/Library/Sounds/Glass.aiff", shell: "macOS", tags: ["fun"] },

  // ── Docker ───────────────────────────────────────────────────────────
  { id: "docker-ps", command: "docker ps -a", description: "List all containers, including stopped.", example: "docker ps -a --format 'table {{.Names}}\\t{{.Status}}'", shell: "Docker", tags: ["container"] },
  { id: "docker-run", command: "docker run --rm -it image", description: "Run a container interactively, auto-clean on exit.", example: "docker run --rm -it node:20 bash", shell: "Docker", tags: ["container"] },
  { id: "docker-exec", command: "docker exec -it name sh", description: "Open a shell inside a running container.", example: "docker exec -it my-app sh", shell: "Docker", tags: ["container"] },
  { id: "docker-logs", command: "docker logs -f name", description: "Follow a container's logs.", example: "docker logs -f my-app --since 10m", shell: "Docker", tags: ["log"] },
  { id: "docker-build", command: "docker build -t name:tag .", description: "Build an image from the current directory.", example: "docker build -t toollyz:dev .", shell: "Docker", tags: ["build"] },
  { id: "docker-prune", command: "docker system prune -af", description: "Reclaim disk by removing unused images/containers/networks.", example: "docker system prune -af --volumes", shell: "Docker", tags: ["clean"] },
];

export const SHELL_LIST: Shell[] = ["Bash/Zsh", "Git", "Network", "Docker", "macOS", "Linux"];

export interface FilterOptions {
  shell: Shell | "All";
  query: string;
  tag?: string;
}

export const DEFAULT_FILTER: FilterOptions = { shell: "All", query: "" };

export function filterCheats(opt: FilterOptions): CheatEntry[] {
  const q = opt.query.trim().toLowerCase();
  return CHEATS.filter((c) => {
    if (opt.shell !== "All" && c.shell !== opt.shell) return false;
    if (opt.tag && !c.tags.includes(opt.tag)) return false;
    if (!q) return true;
    return (
      c.command.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}

export function allTags(): string[] {
  const set = new Set<string>();
  for (const c of CHEATS) c.tags.forEach((t) => set.add(t));
  return [...set].sort();
}

export const TOTAL_CHEATS = CHEATS.length;

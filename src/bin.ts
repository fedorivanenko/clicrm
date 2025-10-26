import { Command } from "commander";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { exit, argv as processArgv } from "node:process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const commands = ["add", "list", "find", "exit"] as const;
type CommandName = (typeof commands)[number];

async function handleCommand(cmd: CommandName, args: string[]): Promise<void> {
  switch (cmd) {
    case "add":
      console.log("→ would scrape:", args[0] ?? "(missing URL)");
      break;
    case "list":
      console.log("→ would list leads");
      break;
    case "find":
      console.log("→ would find leads matching:", args.join(" ") || "(missing query)");
      break;
    case "exit":
      exit(0);
  }
}

async function startSession(): Promise<void> {
  const completer: readline.Completer = (line) => {
    const trimmed = line.trimStart();
    const firstToken = trimmed.split(/\s+/)[0] ?? "";
    const isCommandPosition = trimmed.length === 0 || !trimmed.includes(" ");

    if (!isCommandPosition) {
      return [[], line];
    }

    const matches = commands.filter((cmd) => cmd.startsWith(firstToken));
    return [matches.length > 0 ? matches : [...commands], line];
  };

  const rl = readline.createInterface({
    input,
    output,
    terminal: true,
    completer,
  });

  rl.on("SIGINT", () => {
    console.log();
    rl.close();
    exit(0);
  });

  rl.on("close", () => {
    console.log();
    exit(0);
  });

  console.log(`Available commands: ${commands.join(", ")}`);

  const prompt = () => {
    rl.setPrompt("crm> ");
    rl.prompt();
  };

  rl.on("line", async (line) => {
    const [cmd, ...args] = line.trim().split(/\s+/);
    if (!cmd) {
      prompt();
      return;
    }

    if (commands.includes(cmd as CommandName)) {
      await handleCommand(cmd as CommandName, args);
    } else {
      console.log("Unknown:", cmd);
    }

    prompt();
  });

  prompt();
}

const isMainModule =
  processArgv[1] !== undefined &&
  fileURLToPath(import.meta.url) === resolve(processArgv[1]);

if (isMainModule) {
  const cli = new Command();
  cli
    .name("clicrm")
    .description("Simple CRM CLI for scraping and managing leads")
    .version("0.1.0");

  cli
    .command("start")
    .description("Launch an interactive session")
    .action(() =>
      startSession().catch((err) => {
        console.error("Session crashed:", err);
        exit(1);
      })
    );

  cli.parseAsync(processArgv).catch((err) => {
    console.error("Failed to start CLI:", err);
    exit(1);
  });
}

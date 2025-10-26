import { Command } from "cliffy/command";
import { Input } from "cliffy/prompt";

type CommandName = "add" | "list" | "find" | "exit";

const cli = new Command()
  .name("clicrm")
  .version("0.1.0")
  .description("Minimal CRM CLI scaffold.")
  .throwErrors();

cli
  .command("start")
  .description("Start the interactive CRM session.")
  .action(startSession);

cli
  .command("add <url:string>")
  .description("Add or scrape a new lead using the provided URL.")
  .action((_options, url) => runAdd(url));

cli
  .command("list")
  .description("List the currently stored leads.")
  .action(runList);

cli
  .command("find <terms...>")
  .description("Search stored leads for the provided terms.")
  .action((_options, ...terms) => runFind(terms));

function printInteractiveHelp(): void {
  console.log(`
Interactive commands:
  add <url>   Add or scrape a new lead
  list        List the currently stored leads
  find <text> Find leads matching the provided text
  exit        Leave the interactive session
`);
}

async function runAdd(url?: string): Promise<void> {
  if (!url) {
    console.error("Missing required <url> argument.");
    console.log("Usage: add <url>");
    return;
  }
  console.log("→ would scrape:", url);
}

async function runList(): Promise<void> {
  console.log("→ would list leads");
}

async function runFind(terms: string[]): Promise<void> {
  console.log(
    "→ would find leads matching:",
    terms.length > 0 ? terms.join(" ") : "(missing query)",
  );
}

async function handleInteractiveCommand(
  cmd: CommandName,
  args: string[],
): Promise<void> {
  switch (cmd) {
    case "add":
      await runAdd(args[0]);
      break;
    case "list":
      await runList();
      break;
    case "find":
      await runFind(args);
      break;
    case "exit":
      console.log("Bye!");
      Deno.exit(0);
  }
}

async function startSession(): Promise<void> {
  console.log('Starting CRM session. Type "help" to list commands.');
  while (true) {
    const line = await Input.prompt({
      message: "crm>",
      default: "",
    });

    const trimmed = line.trim();
    if (!trimmed) continue;

    const [cmd, ...args] = trimmed.split(/\s+/);

    if (cmd === "help") {
      printInteractiveHelp();
      continue;
    }

    if (["add", "list", "find", "exit"].includes(cmd)) {
      await handleInteractiveCommand(cmd as CommandName, args);
    } else {
      console.log(`Unknown command: ${cmd}. Type "help" to see options.`);
    }
  }
}

if (import.meta.main) {
  try {
    await cli.parse(Deno.args);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    Deno.exit(1);
  }
}
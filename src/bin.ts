const commands = ["add", "list", "find", "exit"] as const;

type Command = (typeof commands)[number];

function printUsage(exitCode: number): never {
  console.log("Usage: deno run --allow-read src/bin.ts start");
  Deno.exit(exitCode);
}

async function handleCommand(cmd: Command, args: string[]): Promise<void> {
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
      Deno.exit(0);
  }
}

async function startSession(): Promise<void> {

  while (true) {
    const line = prompt("crm> ");
    if (line === null) {
      console.log();
      Deno.exit(0);
    }

    const [cmd, ...args] = line.trim().split(/\s+/);
    if (!cmd) {
      continue;
    }

    if (commands.includes(cmd as Command)) {
      await handleCommand(cmd as Command, args);
    } else {
      console.log("Unknown:", cmd);
    }
  }
}

if (import.meta.main) {
  const [subcommand] = Deno.args;
  if (!subcommand) {
    printUsage(1);
  }

  if (subcommand === "start") {
    await startSession();
  } else {
    console.error("Unknown command:", subcommand);
    printUsage(1);
  }
}

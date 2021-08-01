import { readFileSync } from "fs";

import { Scanner } from "./scanner";

export class Lox {
  static hadError = false;

  public static main(args: string[]) {
    if (args.length > 1) {
      console.log("Usage: jlox [script]");
      process.exit(64);
    } else if (args.length == 1) {
      this.runFile(args[0]);
    } else {
      this.runPrompt();
    }
  }

  private static runFile(path: string) {
    const buffer = readFileSync(path);
    this.run(buffer.toString());

    // Indicate an error in the exit code.
    if (this.hadError) process.exit(65);
  }

  /**
   * @todo REPL
   */
  private static runPrompt() {}

  private static run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    // For now, just print the tokens.
    for (const t of tokens) {
      console.log("token: ", t);
    }
  }

  static error(line: number, message: string) {
    this.report(line, "", message);
  }

  private static report(line: number, where: string, message: string) {
    console.log("[line " + line + "] Error" + where + ": " + message);
    this.hadError = true;
  }
}

Lox.main(process.argv.slice(2));

import { readFileSync } from "fs";
import { createInterface } from "readline";

import { AstPrinter } from "./astPrinter";
import { Parser } from "./parser";
import { Scanner } from "./scanner";
import { Token } from "./token";
import { TokenType } from "./tokenType";

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
   * REPL
   */
  private static runPrompt() {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "[lox]: ",
    });

    rl.prompt();
    rl.on("line", (line) => {
      const cmd = line.trim();
      this.run(cmd);
      rl.prompt();
    }).on("close", () => {
      console.log("Bye!");
    });
  }

  private static run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    const parser = new Parser(tokens);
    const expression = parser.parse();

    // Stop if there was a syntax error.
    if (this.hadError) return;
    expression
      ? console.log(new AstPrinter().print(expression))
      : console.log("Error found in the parser");
  }

  static error(line: number, message: string) {
    this.report(line, "", message);
  }

  private static report(line: number, where: string, message: string) {
    console.log("[line " + line + "] Error" + where + ": " + message);
    this.hadError = true;
  }

  static tokenError(token: Token, message: string): void {
    if (token.type === TokenType.EOF) {
      this.report(token.line, " at end", message);
    } else {
      this.report(token.line, " at '" + token.lexeme + "'", message);
    }
  }
}

/**
 * Only run if called directly from cli
 *
 * @link https://nodejs.org/api/modules.html#modules_accessing_the_main_module
 */
if (require.main === module) {
  Lox.main(process.argv.slice(2));
}
